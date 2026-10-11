"""Capture G6-03 input/version and cleanup facts without deleting historical work."""
from pathlib import Path
import datetime, hashlib, json, subprocess

root = Path.cwd().resolve()
out = root / 'evidence/g6/G6-03'
out.mkdir(parents=True, exist_ok=True)
def git(*args):
    r = subprocess.run(['git', *args], cwd=root, capture_output=True)
    return {'exitCode': r.returncode, 'stdout': r.stdout.decode('utf-8', 'replace').strip(), 'stderr': r.stderr.decode('utf-8', 'replace').strip()}
base = 'deaddc6e454dcd1064db2e2271838b5ef19ad87c'
code = json.loads((root / 'evidence/g6/G6-01/release-lock.json').read_text(encoding='utf-8'))
scope = ['frontend', 'backend', 'compose.yaml', 'docs/work/B_TECH/openapi_v1.yaml']
code_diff = git('diff', '--exit-code', code['repositorySnapshot'], base, '--', *scope)
assert code_diff['exitCode'] == 0, 'The release code has changed; lock must be reviewed before rehearsal'
wrong_names = ['g6_03_fact_baseline.md', 'g6_03_ai_collaboration_analysis.md', 'g6_03_technical_debt.md', 'project_development_summary_report.md']
worktree_text = git('worktree', 'list', '--porcelain')['stdout']
worktrees = [Path(line[9:]) for line in worktree_text.splitlines() if line.startswith('worktree ')]
scan = []
for tree in worktrees:
    for name in wrong_names:
        matches = list((tree / 'docs').rglob(name)) if (tree / 'docs').exists() else []
        for match in matches:
            scan.append({'path': str(match), 'sha256': hashlib.sha256(match.read_bytes()).hexdigest(), 'disposition': 'REQUIRES_PROVENANCE_CHECK_BEFORE_DELETION'})
record = {
    'taskId': 'G6-03', 'capturedAt': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(),
    'repositoryRoot': git('rev-parse', '--show-toplevel')['stdout'], 'executionWorktree': str(root),
    'branch': git('branch', '--show-current')['stdout'], 'bootstrapHead': base,
    'bootstrapStatus': 'CLEAN (observed before raw prompt logging)',
    'currentStatusDuringTask': git('status', '--short', '--branch')['stdout'],
    'recentCommits': git('log', '--oneline', '-10')['stdout'].splitlines(),
    'registeredWorktrees': [str(p) for p in worktrees], 'suspectedWrongOutputNames': wrong_names,
    'wrongOutputMatches': scan, 'deletedFiles': [],
    'historicalG6_03Commits': git('log', '--all', '--oneline', '--grep=G6-03')['stdout'].splitlines(),
    'originalCwdPreexistingChanges': ['docs/work/C_REQ/rtm_g4_evidence.md', 'frontend/src/api/generated/schema.d.ts', 'tasks.md', '.worktrees/', 'docs/inputs/G5/', 'docs/inputs/G6/', 'logs/prompts/2026-09-24-A.md'],
    'originalCwdDisposition': 'Preserved. These existed before the interrupted incorrect task and are not confirmed pollution. Original raw materials, prior logs and registered worktrees must not be deleted.',
    'cleanupConclusion': 'NO_CONFIRMED_POLLUTION_FILES' if not scan else 'REQUIRES_PROVENANCE_CHECK',
}
assert not scan, 'Suspected outputs need provenance review; do not inherit or delete blindly'
(out / 'bootstrap-and-cleanup.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
sources = [
    'AGENTS.md', 'tasks.md', 'docs/README.md', 'governance/ai_logging.md', 'governance/git_workflow.md', 'governance/source_priority.md', 'governance/review_workflow.md',
    'control/facts.md', 'control/key_numbers.md', 'control/issues.md', 'control/overrides.md', 'control/change_log.md', 'control/compliance_matrix.md',
    'control/baselines/BASELINE-G3-M3-R1.0.md',
    'evidence/g5/G5-03/c-final-acceptance.json', 'logs/reviews/2026-10-11_G5-03-C-final-review.md',
    'evidence/g6/G6-01/release-lock.json', 'evidence/g6/G6-01/command-execution-ledger.md', 'evidence/g6/G6-01/deployment-check.json', 'evidence/g6/G6-01/quality-check.json',
    'evidence/g6/G6-01/document-pair-manifest.json', 'evidence/g6/G6-01/document-render-qa.md',
    'docs/work/B_TECH/g6_user_manual.md', 'docs/work/B_TECH/g6_deployment_operations_manual.md', 'docs/work/B_TECH/g6_deployment_handoff_and_known_limits.md',
    'docs/deliverables/G6/34-用户手册.docx', 'docs/deliverables/G6/34-用户手册.pdf', 'docs/deliverables/G6/45-部署与运维手册.docx', 'docs/deliverables/G6/45-部署与运维手册.pdf',
    'evidence/g6/G6-02/metrics-ledger.md', 'evidence/g6/G6-02/gaps-deferrals.md', 'evidence/g6/G6-02/delivery-index.json',
    'evidence/g6/G6-02/rtm-acceptance-increment.json', 'evidence/g6/G6-02/b-review.json', 'logs/reviews/2026-10-11_G6-02-B-review.md',
    'docs/work/B_TECH/adr/ADR-001-应用拆分与部署单元.md', 'docs/work/B_TECH/adr/ADR-002-事务Outbox与持久任务.md',
    'docs/work/B_TECH/openapi_v1.yaml', 'frontend/src/main.ts', 'backend/src/server.mjs',
]
items = []
for source in sources:
    file = root / source
    assert file.is_file(), source
    data = file.read_bytes()
    items.append({'path': source, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'snapshotKind': 'CURRENT_CONTROLLED_INPUT_AT_CAPTURE'})
manifest = {'taskId': 'G6-03', 'snapshot': base, 'releaseSnapshot': code['repositorySnapshot'], 'latestCodeAffectingCommit': code['latestCodeAffectingCommit'],
    'codeScope': scope, 'codeScopeDiffExitCode': code_diff['exitCode'], 'codeMatchesG6_01': True, 'capturedAt': record['capturedAt'], 'sources': items,
    'boundary': 'Input hashes are a dated capture. Subsequent tasks/status/review changes require an increment, not retroactive editing of historical test results.'}
(out / 'input-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'cleanup': record['cleanupConclusion'], 'deleted': len(record['deletedFiles']), 'inputs': len(items), 'codeMatchesG6_01': True}))
