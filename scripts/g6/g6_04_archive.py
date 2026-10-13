"""Shared archive semantics. All functions in this module are read-only."""
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]
INDEX_PATH = 'evidence/g6/G6-04/final-archive-index.json'
TEXT_EXTENSIONS = {'.md', '.json', '.txt', '.log', '.yaml', '.yml', '.py', '.ps1', '.mjs', '.sh', '.csv', '.tsv', '.ts', '.patch', '.lock'}
MUTABLE_PATHS = {'tasks.md', 'control/issues.md', 'control/overrides.md', 'docs/README.md', 'logs/prompts/2026-10-13-A.md', 'docs/work/G6/G6-04_A_self_review.md'}

def git(*args, root=None):
    return subprocess.check_output(['git', '-c', 'core.quotepath=false', *args], cwd=root or ROOT, timeout=30)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def hash_kind(path):
    return 'TEXT_CRLF_TO_LF_ONLY' if Path(path).suffix.lower() in TEXT_EXTENSIONS else 'BINARY_EXACT_BYTES'

def canonical(data, kind):
    # No trimming, Unicode decoding, BOM removal or whitespace normalization.
    # Binary files, including Office packages, PDF and images, remain exact.
    return data.replace(b'\r\n', b'\n') if kind == 'TEXT_CRLF_TO_LF_ONLY' else data

def content_hash(data, kind):
    return sha(canonical(data, kind))

def paths_at(commit):
    return [p.decode('utf-8') for p in git('ls-tree', '-rz', '--name-only', commit).split(b'\0') if p]

def blobs_at(commit, paths):
    if not paths:
        return {}
    # Literal UTF-8 paths are not shell text. Names with newlines are rejected.
    if any('\n' in p or '\r' in p for p in paths):
        raise ValueError('Newline in Git path is unsupported')
    data = subprocess.check_output(['git', 'cat-file', '--batch'], input=''.join(f'{commit}:{p}\n' for p in paths).encode('utf-8'), cwd=ROOT, timeout=30)
    result = {}
    offset = 0
    for path in paths:
        eol = data.index(b'\n', offset)
        header = data[offset:eol].split()
        if len(header) != 3 or header[1] != b'blob':
            raise ValueError(f'Missing/non-blob Git object: {commit}:{path}')
        size = int(header[2])
        result[path] = data[eol + 1:eol + size + 1]
        offset = eol + size + 2
    return result

def category(path):
    if path.startswith('docs/deliverables/'):
        return '正式文档'
    if 'rtm' in path.lower() and path.startswith(('docs/work/', 'evidence/')):
        return 'RTM'
    if path.startswith('logs/reviews/'):
        return 'Review记录'
    if path.startswith('logs/prompts/'):
        return 'Prompt日志'
    if path.startswith(('evidence/', 'quality/selfcheck/')):
        return '测试/质量/Git过程证据'
    if path.startswith(('control/', 'governance/')) or path in ['tasks.md', 'AGENTS.md', 'docs/README.md', 'docs/work/A_PM/g6_delivery_acceptance_plan.md']:
        return '控制/治理/计划'
    if path.startswith('docs/work/G6/'):
        return 'G6移交源'
    if path.startswith(('scripts/g6/', 'logs/history/2026-10-13-g6-04-bootstrap-preserved/')):
        return 'G6-04制作/启动留痕'
    return None

def verify_archive(index_file=INDEX_PATH, commit=None, working_tree=False):
    """Validate an existing index without writing it or any other file.

    Default commit is the latest commit touching INDEX_PATH, so an independent
    log-backfill commit cannot silently change the content snapshot under test.
    Mutable current files must still match their HEAD blobs, not just exist.
    """
    failures = []
    checks = []
    def check(name, passed, details=None):
        checks.append({'check': name, 'pass': bool(passed), 'details': details})
        if not passed:
            failures.append(checks[-1])
    index_bytes = (ROOT / index_file).read_bytes()
    index_before = sha(index_bytes)
    index = json.loads(index_bytes.decode('utf-8-sig'))
    check('Archive schema version 2', index.get('schemaVersion') == 2)
    if index.get('schemaVersion') != 2:
        return {'status': 'FAIL', 'failures': failures, 'checks': checks, 'assertionCount': len(checks), 'archiveRows': len(index.get('rows', [])), 'verificationMode': 'UNSUPPORTED_LEGACY_SCHEMA', 'filesWritten': 0}
    rows = index['rows']
    check('Unique archive paths', len({r['path'] for r in rows}) == len(rows))
    unsafe = [r['path'] for r in rows if Path(r['path']).is_absolute() or '..' in Path(r['path']).parts or '\\' in r['path'] or ':' in r['path']]
    check('All archive paths safe before reading', not unsafe, unsafe)
    if unsafe:
        return {'status':'FAIL','failures':failures,'checks':checks,'assertionCount':len(checks),'archiveRows':len(rows),'verificationMode':'REJECT_UNSAFE_PATHS','filesWritten':0}
    if not working_tree:
        commit = commit or git('log', '-1', '--format=%H', '--', INDEX_PATH).decode().strip()
        if not commit:
            raise ValueError('No committed archive index; use --working-tree only for a draft')
        commit = git('rev-parse', '--verify', commit + '^{commit}').decode().strip()
        check('Archive commit is ancestor of HEAD', subprocess.run(['git', 'merge-base', '--is-ancestor', commit, 'HEAD'], cwd=ROOT, capture_output=True).returncode == 0)
        committed_index = git('show', f'{commit}:{INDEX_PATH}')
        check('Loaded index matches submitted Git index', canonical(index_bytes, hash_kind(INDEX_PATH)) == canonical(committed_index, hash_kind(INDEX_PATH)))
        expected_paths = paths_at(commit)
        # Protect coverage, not only the rows that happened to be generated.
        exclusions = index['exclusions']
        required = {p for p in expected_paths if category(p) and not any(p == x or (x.endswith('/') and p.startswith(x)) for x in exclusions)}
        check('Submitted controlled archive paths covered', required <= {r['path'] for r in rows}, sorted(required - {r['path'] for r in rows}))
        submitted = blobs_at(commit, [r['path'] for r in rows])
        head = blobs_at('HEAD', [r['path'] for r in rows if r['path'] in MUTABLE_PATHS])
    else:
        submitted = head = {}
    input_paths = [r['path'] for r in rows if r.get('inputGitBlobSha256')]
    input_blobs = blobs_at(index['sourceMaster'], input_paths)
    permitted_eol = []
    mutable_transitions = []
    for row in rows:
        path = row['path']
        target = ROOT / path
        check('Safe relative archive path ' + path, not Path(path).is_absolute() and '..' not in Path(path).parts)
        check('Archive file present ' + path, target.is_file())
        if not target.is_file():
            continue
        kind = hash_kind(path)
        check('Explicit format policy ' + path, row['hashKind'] == kind)
        actual = target.read_bytes()
        if not working_tree:
            blob = submitted[path]
            check('Submitted content fingerprint ' + path, content_hash(blob, kind) == row['contentSha256'])
        if row.get('inputGitBlobSha256'):
            check('Input canonical Git blob ' + path, sha(input_blobs[path]) == row['inputGitBlobSha256'])
        if path in MUTABLE_PATHS and not working_tree:
            # The original snapshot still has an exact fingerprint above.
            # Post-snapshot changes are permitted only if separately committed.
            check('Mutable checkout matches committed HEAD ' + path, canonical(actual, kind) == canonical(head[path], kind))
            if content_hash(actual, kind) != row['contentSha256']:
                mutable_transitions.append(path)
        else:
            check('Checkout content fingerprint ' + path, content_hash(actual, kind) == row['contentSha256'])
            if sha(actual) != row['physicalSha256AtGeneration'] and content_hash(actual, kind) == row['contentSha256']:
                permitted_eol.append(path)
    check('Archive categories covered', all(any(r['category'] == c for r in rows) for c in ['正式文档', 'RTM', 'Review记录', 'Prompt日志', '测试/质量/Git过程证据']))
    check('Index bytes unchanged by verification', sha((ROOT / index_file).read_bytes()) == index_before)
    return {'status': 'PASS' if not failures else 'FAIL', 'assertionCount': len(checks), 'failures': failures, 'checks': checks, 'archiveRows': len(rows), 'verificationMode': 'READ_ONLY_WORKING_TREE_DRAFT' if working_tree else 'READ_ONLY_SUBMITTED_GIT_AND_CHECKOUT', 'archiveSnapshotCommit': commit, 'permittedTextEolConversions': permitted_eol, 'committedMutableTransitions': mutable_transitions, 'physicalHashInterpretation': 'Diagnostic generation bytes; only CRLF-to-LF text equivalence allowed. Binary hashes exact.', 'indexSha256Before': index_before, 'indexSha256After': sha((ROOT / index_file).read_bytes()), 'filesWritten': 0}
