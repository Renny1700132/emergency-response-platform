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
    files = {'docs/deliverables/report.pdf':b'%PDF-fixture\x00binary\r\n', 'docs/work/C_REQ/rtm.md':'仅测试夹具\nrow\n'.encode(), 'logs/reviews/review.md':b'synthetic review fixture\n', 'logs/prompts/2026-10-13-A.md':b'initial fixture log\n', 'evidence/test/result.json':b'{"fixture": true}\n'}
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
archive.ROOT = root
result = {'task':'G6-04','testScope':'Isolated synthetic Git repository, no project evidence/acceptance modified','status':'PASS','cases':cases,'caseCount':len(cases)}
print(json.dumps(result,ensure_ascii=False,indent=2))
