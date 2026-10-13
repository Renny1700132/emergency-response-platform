"""Exercise submitted-snapshot verification using an isolated synthetic Git repo."""
from pathlib import Path
import json
import subprocess
import tempfile
import g6_04_archive as archive

root = archive.ROOT
scratch = root / '.tmp/g6-04-archive-tests'
scratch.mkdir(parents=True, exist_ok=True)
cases = []
def run_case(name, expect_pass, result, index_before, index_after):
    actual = result['status'] == 'PASS'
    correct = actual == expect_pass and index_before == index_after and result['filesWritten'] == 0
    cases.append({'case':name,'expected':'PASS' if expect_pass else 'FAIL','actual':result['status'],'expectationMet':correct,'indexUnchanged':index_before==index_after,'filesWritten':result['filesWritten'],'failureChecks':[x['check'] for x in result['failures']]})
    assert correct, cases[-1]

with tempfile.TemporaryDirectory(prefix='fixture-', dir=scratch) as fixture:
    archive.ROOT = Path(fixture)
    def git(*args):
        return subprocess.check_output(['git',*args],cwd=fixture,stderr=subprocess.PIPE)
    git('init')
    git('config','user.name','G6-04 synthetic test fixture')
    git('config','user.email','fixture@example.invalid')
    git('config','core.autocrlf','false')
    files = {'docs/deliverables/report.pdf':b'%PDF-fixture\x00binary\r\n', 'docs/work/C_REQ/rtm.md':'仅测试夹具\nrow\n'.encode(), 'logs/reviews/review.md':b'synthetic review fixture\n', 'logs/prompts/2026-10-13-A.md':b'initial fixture log\n', 'logs/prompts/2026-10-14-C.md':b'initial C review fixture log\n', 'evidence/test/result.json':b'{"fixture": true}\n'}
    task_rows = b''.join(f'| G6-0{i} | scope | A | C | input | output | dependency | criteria | risk | REVIEW |\n'.encode() for i in range(5))
    files['tasks.md'] = task_rows
    files[archive.PLAN_PATH] = b'# Controlled plan fixture\n' + task_rows
    files['control/issues.md'] = b'fixture issue OPEN\n'
    for extension in ['jsonl','ndjson','sha256']:
        files['evidence/test/text.'+extension]=b'explicit text fixture\nsecond line\n'
    for path, data in files.items():
        target = archive.ROOT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    git('add','.')
    git('commit','-m','fixture input')
    source = git('rev-parse','HEAD').decode().strip()
    rows = [{'path':p,'category':archive.category(p),'hashKind':archive.hash_kind(p),'contentSha256':archive.content_hash(data,archive.hash_kind(p)),'physicalSha256AtGeneration':archive.sha(data),'inputGitBlobSha256':archive.sha(data)} for p,data in files.items()]
    index = {'schemaVersion':2,'sourceMaster':source,'rows':rows,'exclusions':[archive.INDEX_PATH]}
    target = archive.ROOT / archive.INDEX_PATH
    target.parent.mkdir(parents=True,exist_ok=True)
    original_index = (json.dumps(index,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
    target.write_bytes(original_index)
    git('add','.')
    git('commit','-m','fixture archive snapshot')
    def verify(name, expected):
        before = archive.sha(target.read_bytes())
        result = archive.verify_archive()
        after = archive.sha(target.read_bytes())
        run_case(name,expected,result,before,after)
    verify('Committed fixture snapshot',True)
    text_path = 'docs/work/C_REQ/rtm.md'
    text_file = archive.ROOT / text_path
    text_file.write_bytes(files[text_path].replace(b'\n',b'\r\n'))
    verify('Only LF to CRLF checkout conversion',True)
    text_file.write_bytes(files[text_path]+b'UNCOMMITTED_CHANGE\n')
    verify('Arbitrary text change is rejected',False)
    text_file.write_bytes(files[text_path])
    for extension in ['jsonl','ndjson','sha256']:
        path='evidence/test/text.'+extension
        (archive.ROOT/path).write_bytes(files[path].replace(b'\n',b'\r\n'))
        verify(extension+' text checkout EOL conversion',True)
        (archive.ROOT/path).write_bytes(files[path])
    binary_file = archive.ROOT / 'docs/deliverables/report.pdf'
    binary_file.write_bytes(files['docs/deliverables/report.pdf'].replace(b'\r\n',b'\n'))
    verify('Binary newline alteration is rejected',False)
    binary_file.write_bytes(files['docs/deliverables/report.pdf'])
    altered = json.loads(original_index)
    altered['rows'][0]['contentSha256'] = '0'*64
    target.write_text(json.dumps(altered),encoding='utf-8')
    verify('Tampered existing index is rejected without rebuilding',False)
    target.write_bytes(original_index)
    log_path = archive.ROOT / 'logs/prompts/2026-10-13-A.md'
    log_path.write_bytes(files['logs/prompts/2026-10-13-A.md']+b'backfill fixture\n')
    verify('Uncommitted mutable log alteration is rejected',False)
    git('add','logs/prompts/2026-10-13-A.md')
    git('commit','-m','fixture independent log backfill')
    verify('Committed log backfill uses original archive snapshot and HEAD',True)
    c_log_path = archive.ROOT / 'logs/prompts/2026-10-14-C.md'
    c_log_original = files['logs/prompts/2026-10-14-C.md']
    c_log_path.write_bytes(c_log_original + b'uncommitted C review prompt fixture\n')
    verify('Uncommitted same-day C prompt log append is rejected',False)
    c_log_path.write_bytes(c_log_original)
    # The index is kept byte-identical throughout the C Review lifecycle.
    updated_rows = task_rows.replace(b'| G6-04 | scope | A | C | input | output | dependency | criteria | risk | REVIEW |', b'| G6-04 | scope | A | C | input | output | dependency | criteria | risk | REVIEW / CHANGES_REQUIRED |')
    (archive.ROOT / 'tasks.md').write_bytes(updated_rows)
    (archive.ROOT / archive.PLAN_PATH).write_bytes(b'# Controlled plan fixture\n' + updated_rows)
    (archive.ROOT / 'control/issues.md').write_bytes(b'fixture C Review issue PARTIALLY_REMEDIATED / OPEN\n')
    c_log_path.write_bytes(c_log_original + b'committed C review prompt and result fixture\n')
    verify('Uncommitted C prompt tasks issues plan migration rejected',False)
    git('add','logs/prompts/2026-10-14-C.md','tasks.md','control/issues.md',archive.PLAN_PATH)
    git('commit','-m','fixture independent C prompt and Review state migration')
    verify('Archive then C prompt tasks issues plan commit then read-only PASS',True)
    plan_file = archive.ROOT / archive.PLAN_PATH
    approved_plan = plan_file.read_bytes()
    plan_file.write_bytes(approved_plan.replace(b'CHANGES_REQUIRED',b'PENDING_C'))
    verify('Uncommitted plan status change rejected',False)
    plan_file.write_bytes(approved_plan)
    plan_file.write_bytes(approved_plan.replace(b'Controlled plan fixture',b'Arbitrary committed business prose'))
    git('add',archive.PLAN_PATH)
    git('commit','-m','fixture forbidden plan prose change')
    verify('Committed non-status plan change rejected',False)
    plan_file.write_bytes(approved_plan)
    git('add',archive.PLAN_PATH)
    git('commit','-m','fixture restore controlled prose')
    (archive.ROOT / 'tasks.md').write_bytes(task_rows)
    git('add','tasks.md')
    git('commit','-m','fixture inconsistent task status')
    verify('Committed plan task status mismatch rejected',False)
archive.ROOT = root
result = {'task':'G6-04','testScope':'Isolated synthetic Git repository, no project evidence/acceptance modified','status':'PASS','cases':cases,'caseCount':len(cases)}
print(json.dumps(result,ensure_ascii=False,indent=2))
