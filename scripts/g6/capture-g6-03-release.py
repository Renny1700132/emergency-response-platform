from pathlib import Path
import hashlib, json, subprocess, datetime

root = Path.cwd()
out = root / 'evidence/g6/G6-03'
base = 'deaddc6e454dcd1064db2e2271838b5ef19ad87c'
def command(*args):
    result = subprocess.run(['git', *args], capture_output=True, cwd=root, check=True)
    return result.stdout.decode('utf-8').strip()
scope = ['frontend', 'backend', 'compose.yaml', 'docs/work/B_TECH/openapi_v1.yaml']
files = command('ls-files', '--', *scope).splitlines()
entries = [{'path': file, 'sha256': hashlib.sha256((root / file).read_bytes()).hexdigest()} for file in files]
changed = command('diff', '--name-only', base, '--', *scope).splitlines()
expected = {'frontend/src/features/response/workflow.ts', 'frontend/tests/workflow.test.ts'}
assert set(changed) == expected, changed
manifest = {
    'taskId': 'G6-03', 'lockedAt': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(),
    'baseRepositoryCommit': base, 'baseG6_01CodeCommit': '5fc359aea5e08118d17f2e076e6f669b04adf9b4',
    'candidateVersion': 'V0.1+ISSUE-G6-03-001', 'candidateState': 'WORKTREE_HASH_LOCK_PENDING_CONTENT_COMMIT',
    'applicationChangeIssue': 'ISSUE-G6-03-001', 'changedFilesFromBase': changed,
    'files': entries, 'applicationTreeSha256': hashlib.sha256(json.dumps(entries, sort_keys=True).encode()).hexdigest(),
    'buildIndexSha256': hashlib.sha256((root / 'frontend/dist/index.html').read_bytes()).hexdigest(),
    'storage': 'IN_MEMORY_REHEARSAL', 'externalPorts': 'SIMULATED_IDENTITY_MESSAGE_AND_PLAN',
    'bTechnicalConfirmation': 'PENDING_REVIEW', 'cOverallReview': 'PENDING_REVIEW',
    'boundary': 'This is a dated file-hash lock after the recorded UI correction, not a claim that the old G6-01 release commit contains this correction.'
}
(out / 'rehearsal-release-lock.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'candidate': manifest['candidateVersion'], 'codeChanges': changed, 'treeSha256': manifest['applicationTreeSha256']}))
