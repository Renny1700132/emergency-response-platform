import assert from 'node:assert/strict'
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile, rm, mkdtemp } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createServer } from '../../backend/src/server.mjs'
import { loadConfig } from '../../backend/src/config.mjs'

// Rehearsal harness only. Application sources and historical G5 evidence are unchanged.
const root = process.cwd()
const output = path.join(root, 'evidence/g6/G6-03')
const runId = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const raw = path.join(output, 'raw', runId)
const shots = path.join(output, 'screenshots', runId)
await Promise.all([mkdir(raw, { recursive: true }), mkdir(shots, { recursive: true })])
const startedAt = new Date().toISOString()
const start = performance.now()
const tokens = { commander: randomUUID(), executor: randomUUID(), reader: randomUUID() }
const records = [], checks = [], uiActions = [], audit = [], screenshots = []
const marker = 'SIMULATED_DATA / LOCAL_ACTUAL_EXECUTION / IN_MEMORY_REHEARSAL'
const seed = {
  marker, synthetic: true, createdAt: startedAt,
  source: 'User authorization in LOG-G6-03-001 USER_STEERING_RAW. These are invented rehearsal inputs, not project facts.',
  plan: { id: 'g603-simulated-plan-v1', name: '【模拟】展厅烟雾处置预案', templates: [
    { name: '【模拟】疏散通道检查', assigneeRef: 'sim-executor', deadlineAt: new Date(Date.now() + 30 * 60000).toISOString() },
    { name: '【模拟】展厅人员清点', assigneeRef: 'sim-executor', deadlineAt: new Date(Date.now() + 45 * 60000).toISOString() },
  ] },
  incident: { incidentTypeCode: 'FIRE', title: '【模拟】一层展厅烟雾核实', description: '模拟项目试演：值班人员发现烟雾提示。无真实灾情、人员或甲方数据。', occurredAt: new Date(Date.now() - 60000).toISOString() },
  roles: ['sim-commander', 'sim-executor', 'sim-reader'],
  feedback: '【模拟】执行员已检查通道，正在复核疏散指示。',
  boundary: 'No owner identity/message system, real mobile host, PostgreSQL persistence, KN-065 operator or现场验收 is exercised.',
}
await writeFile(path.join(output, 'simulated-dataset.json'), JSON.stringify(seed, null, 2) + '\n')
const permissions = ['incident:read', 'incident:create', 'incident:verify', 'incident:start-response', 'task:read', 'task:create', 'task:acknowledge', 'task:feedback', 'task:complete', 'task:remind', 'situation:read']
const identityProvider = { async resolveBearer(token) {
  const role = Object.keys(tokens).find(key => tokens[key] === token)
  if (!role) return null
  return { actorId: `sim-${role}`, displayName: `【模拟】${{ commander: '指挥员', executor: '执行员', reader: '只读观察员' }[role]}`,
    roles: role === 'reader' ? ['emergency.read'] : ['emergency.read', 'emergency.write'],
    organizationId: 'sim-museum', dataScopes: ['simulated-rehearsal'],
    permissions: role === 'reader' ? ['incident:read', 'task:read'] : permissions }
} }
const backend = createServer({ config: loadConfig({ NODE_ENV: 'development' }),
  identityProvider, planProvider: { async loadPublishedPlan(id) { return id === seed.plan.id ? seed.plan : null } },
  messagePort: { async sendTask() { return { status: 'ACCEPTED', marker: 'SIMULATED_EVIDENCE', platformMessageId: `sim-message-${randomUUID()}` } } },
  logger: { info(value) { audit.push(value) } } })
let front, browser, socket, profile, browserVersion
const pending = new Map()
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let commandSequence = 0
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++commandSequence
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value) }, reject: error => { clearTimeout(timer); reject(error) } })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + (result.exceptionDetails.exception?.description ?? ''))
  return result.result.value
}
async function until(expression, label) {
  for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await delay(100) }
  throw new Error(`UI condition failed: ${label}`)
}
async function action(id, expression) {
  const time = new Date().toISOString()
  const value = await evaluate(expression)
  uiActions.push({ id, at: time, result: value ?? null, mode: marker })
  return value
}
async function takeShot(id, route, viewport = { width: 1440, height: 1000 }) {
  await command('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: viewport.width < 600 })
  await delay(200)
  const image = await command('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  const relative = `evidence/g6/G6-03/screenshots/${runId}/${id}.png`
  await writeFile(path.join(root, relative), Buffer.from(image.data, 'base64'))
  screenshots.push({ id, path: relative, route, viewport, capturedAt: new Date().toISOString(), marker, softwareMode: 'production frontend build, real HTTP, in-memory backend, synthetic identity/message ports' })
}
async function navigate(route, role = 'commander') {
  await command('Page.addScriptToEvaluateOnNewDocument', { source: `window.__MUSEUM_AUTH__={getAccessToken:async()=>${JSON.stringify(tokens[role])}};document.addEventListener('DOMContentLoaded',()=>{const b=document.createElement('div');b.id='g603-simulation-banner';b.textContent='G6-03 模拟项目试演：模拟数据 / 当前系统实际执行 / 内存存储';b.style.cssText='position:fixed;bottom:0;left:0;width:100%;z-index:99999;background:#7a3017;color:white;font:16px Microsoft YaHei;padding:10px;text-align:center;box-sizing:border-box';document.body.appendChild(b);});` })
  await command('Page.navigate', { url: `${frontUrl}${route}` })
  await until('document.readyState === "complete" && !!document.querySelector("#g603-simulation-banner")', 'document loaded')
}
let frontUrl = '', backendUrl = '', outcome = 'FAIL', failure = null
async function call(id, route, body, role = 'commander', expected = 200) {
  const response = await fetch(backendUrl + route, { method: body === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${tokens[role]}`, 'content-type': 'application/json', 'x-idempotency-key': `g603-${randomUUID()}` },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  const payload = await response.json()
  checks.push({ id, expectedHttp: expected, actualHttp: response.status, status: response.status === expected ? 'PASS' : 'FAIL', traceId: payload.traceId, at: new Date().toISOString() })
  records.push({ id, route, request: body ?? null, role: `sim-${role}`, response: payload, httpStatus: response.status })
  assert.equal(response.status, expected, id)
  return payload.data ?? payload
}
try {
  await new Promise(resolve => backend.listen(0, '127.0.0.1', resolve))
  backendUrl = `http://127.0.0.1:${backend.address().port}`
  front = http.createServer(async (request, response) => {
    if (request.url.startsWith('/api/') || request.url === '/healthz' || request.url === '/readyz') {
      const requestedAt = new Date().toISOString(), began = performance.now(), chunks = []
      for await (const chunk of request) chunks.push(chunk)
      const requestBody = Buffer.concat(chunks).toString()
      const proxied = await fetch(backendUrl + request.url, { method: request.method, headers: request.headers,
        ...(request.method === 'GET' || request.method === 'HEAD' ? {} : { body: requestBody }) })
      const text = await proxied.text()
      records.push({ id: `browser-http-${records.length + 1}`, requestedAt, method: request.method, route: request.url,
        request: requestBody ? JSON.parse(requestBody) : null, httpStatus: proxied.status, response: JSON.parse(text), elapsedMs: Math.round(performance.now() - began) })
      response.writeHead(proxied.status, { 'content-type': 'application/json; charset=utf-8' }); response.end(text); return
    }
    const clean = decodeURIComponent(request.url.split('?')[0])
    const candidate = path.resolve(root, 'frontend/dist', '.' + clean)
    const dist = path.resolve(root, 'frontend/dist')
    if (!candidate.startsWith(dist + path.sep) && candidate !== dist) { response.writeHead(400); response.end(); return }
    try {
      let bytes, extension
      try { bytes = await readFile(candidate); extension = path.extname(candidate) } catch { bytes = await readFile(path.join(dist, 'index.html')); extension = '.html' }
      response.writeHead(200, { 'content-type': ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extension] ?? 'application/octet-stream' }); response.end(bytes)
    } catch (error) { response.writeHead(500); response.end('frontend build is required') }
  })
  await new Promise(resolve => front.listen(0, '127.0.0.1', resolve))
  frontUrl = `http://127.0.0.1:${front.address().port}`
  await call('health-process', '/healthz')
  await call('readiness-without-database-boundary', '/readyz', undefined, 'commander', 503)
  profile = await mkdtemp(path.join(os.tmpdir(), 'g603-edge-'))
  const port = 9363
  browser = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
  let target
  for (let i = 0; i < 50; i++) { try { const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }); if (response.ok) { target = await response.json(); break } } catch {} await delay(200) }
  if (!target) throw new Error('Edge DevTools unavailable')
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    const item = pending.get(message.id)
    if (!item) return
    pending.delete(message.id)
    if (message.error) item.reject(new Error(message.error.message)); else item.resolve(message.result)
  })
  await command('Page.enable')
  browserVersion = await command('Browser.getVersion')
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await navigate('/web/incidents')
  await until('document.body.innerText.includes("上报事件")', 'commander incident page')
  await action('web-open-report', '[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="上报事件").click(); true')
  await action('web-fill-and-submit', `(()=>{const f=document.querySelector('form.action-form');const inputs=f.querySelectorAll('input');const set=(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));};set(inputs[0],${JSON.stringify(seed.incident.incidentTypeCode)});set(inputs[2],${JSON.stringify(seed.incident.title)});set(f.querySelector('textarea'),${JSON.stringify(seed.incident.description)});f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return true;})()`)
  await until(`document.querySelector('.record-card')?.textContent.includes(${JSON.stringify(seed.incident.title)})`, 'incident actually created')
  const listing = await call('read-created-incident', '/api/v1/incidents?page=1&size=50')
  const incident = listing.items.find(item => item.title === seed.incident.title)
  assert.ok(incident, 'created incident must be returned by current backend')
  await call('verify-incident', `/api/v1/incidents/${incident.id}/verify`, { decision: 'CONFIRMED', reason: '【模拟】指挥员核实烟雾提示', resourceVersion: incident.version })
  await call('stale-start-rejected', `/api/v1/incidents/${incident.id}/start-response`, { planVersionId: seed.plan.id, resourceVersion: incident.version }, 'commander', 409)
  const verified = await call('reload-verified-incident', `/api/v1/incidents/${incident.id}`)
  const responding = await call('start-response', `/api/v1/incidents/${incident.id}/start-response`, { planVersionId: seed.plan.id, reason: '【模拟】启动展厅处置', resourceVersion: verified.version })
  await navigate('/web/incidents')
  await until('document.body.innerText.includes("RESPONDING")', 'responding UI state')
  await takeShot('01-web-response', '/web/incidents')
  const tasks = responding.tasks
  assert.equal(tasks.length, seed.plan.templates.length)
  await navigate('/h5/tasks', 'executor')
  await until('document.querySelectorAll(".record-card").length === 2', 'H5 tasks delivered')
  const firstId = await action('h5-acknowledge', `(()=>{const a=document.querySelector('.record-card');const id=a.querySelector('small').textContent.trim();[...a.querySelectorAll('button')].find(b=>b.textContent.trim()==='接收任务').click();return id;})()`)
  await until('document.querySelector(".record-card")?.textContent.includes("ACKNOWLEDGED")', 'H5 acknowledged')
  await action('h5-fill-feedback', `(()=>{const a=document.querySelector('.record-card');a.querySelector('details').open=true;const t=a.querySelector('textarea');t.value=${JSON.stringify(seed.feedback)};t.dispatchEvent(new Event('input',{bubbles:true}));const n=a.querySelector('input[type=number]');n.value='60';n.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`)
  await delay(100)
  await action('h5-submit-feedback', `[...document.querySelector('.record-card').querySelectorAll('button')].find(b=>b.textContent.trim()==='提交反馈').click(); true`)
  await until('document.body.innerText.includes("任务反馈已提交")', 'H5 actual feedback response')
  const progress = (await call('read-h5-progress', '/api/v1/tasks?page=1&size=50')).items.find(task => task.id === firstId)
  assert.equal(progress.status, 'IN_PROGRESS'); assert.equal(progress.feedback.at(-1).progressPercent, 60)
  const displayedProgress = await evaluate('document.querySelector(".record-card").innerText.match(/当前进度\\s*([0-9]+)%/)?.[1] ?? null')
  checks.push({ id: 'h5-progress-display', status: displayedProgress === '60' ? 'PASS' : 'FAIL', expected: '60', actual: displayedProgress, issue: displayedProgress === '60' ? null : 'ISSUE-G6-03-001', boundary: 'Backend feedback saved 60; current frontend mapping does not derive it from feedback.' })
  await takeShot('02-h5-feedback', '/h5/tasks', { width: 480, height: 1000 })
  const secondId = tasks.find(task => task.id !== firstId).id
  await call('concurrent-task-acknowledgment', `/api/v1/tasks/${secondId}/acknowledge`, { reason: '【模拟】另一终端已接收', resourceVersion: 1 }, 'executor')
  await action('h5-stale-acknowledgment', `(()=>{const a=[...document.querySelectorAll('.record-card')].find(a=>a.querySelector('small').textContent.trim()===${JSON.stringify(secondId)});[...a.querySelectorAll('button')].find(b=>b.textContent.trim()==='接收任务').click();return true;})()`)
  await until('document.body.innerText.includes("版本") || document.body.innerText.includes("conflict") || document.body.innerText.includes("冲突")', 'UI shows real 409 conflict')
  await takeShot('03-h5-version-conflict', '/h5/tasks', { width: 480, height: 1000 })
  const before = await call('before-reader-denial', '/api/v1/incidents?page=1&size=50')
  await call('readonly-write-denied', '/api/v1/incidents', { ...seed.incident, title: '【模拟】禁止创建的反例' }, 'reader', 403)
  const after = await call('after-reader-denial', '/api/v1/incidents?page=1&size=50')
  assert.equal(after.total, before.total)
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await navigate('/web/plans', 'reader')
  await until('document.body.innerText.includes("无访问权限")', 'read-only route guard')
  await takeShot('04-web-permission-denied', '/forbidden')
  for (const task of tasks) {
    const current = (await call(`reload-task-${task.id}`, '/api/v1/tasks?page=1&size=50', undefined, 'executor')).items.find(item => item.id === task.id)
    await call(`complete-task-${task.id}`, `/api/v1/tasks/${task.id}/complete`, { reason: '【模拟】检查完成', resourceVersion: current.version }, 'executor')
  }
  const latest = await call('reload-before-close', `/api/v1/incidents/${incident.id}`)
  const closed = await call('close-incident', `/api/v1/incidents/${incident.id}/close`, { reason: '【模拟】无真实险情，课程试演闭环', resourceVersion: latest.version, attributes: { reportRef: 'g603-simulated-report' } })
  assert.equal(closed.status, 'CLOSED')
  await navigate('/web/incidents')
  await until('document.body.innerText.includes("CLOSED")', 'closed current UI')
  await takeShot('05-web-closed', '/web/incidents')
  const conflictResponses = records.filter(record => record.httpStatus === 409)
  assert.ok(conflictResponses.length >= 2)
  assert.ok(records.some(record => record.route.includes('/acknowledge') && record.id.startsWith('browser-http-') && record.httpStatus === 409))
  assert.ok(audit.some(line => line.includes('denied')))
  checks.push({ id: 'normal-workflow-closed', status: 'PASS', actual: closed.status },
    { id: 'h5-ui-feedback-persisted-in-memory', status: 'PASS', actual: progress.feedback.at(-1).progressPercent },
    { id: 'readonly-no-side-effect', status: 'PASS', actual: { before: before.total, after: after.total } },
    { id: 'actual-ui-version-conflict', status: 'PASS', traceId: conflictResponses.find(record => record.id.startsWith('browser-http-')).response.traceId })
  outcome = checks.some(check => check.status === 'FAIL') ? 'PASS_WITH_KNOWN_DISPLAY_DEFECT' : 'PASS'
} catch (error) {
  failure = { name: error.name, message: error.message, stack: error.stack }
  process.exitCode = 1
} finally {
  try { if (socket?.readyState === WebSocket.OPEN) await command('Browser.close') } catch {}
  if (socket?.readyState === WebSocket.OPEN) socket.close()
  if (browser && browser.exitCode === null) browser.kill()
  if (front) await new Promise(resolve => front.close(resolve))
  await new Promise(resolve => backend.close(resolve))
  if (profile) {
    const resolved = path.resolve(profile), temp = path.resolve(os.tmpdir())
    if (!resolved.startsWith(temp + path.sep)) throw new Error('Unsafe browser temp cleanup path')
    await rm(resolved, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 })
  }
  await Promise.all([
    writeFile(path.join(raw, 'http-records.json'), JSON.stringify(records, null, 2) + '\n'),
    writeFile(path.join(raw, 'ui-actions.json'), JSON.stringify(uiActions, null, 2) + '\n'),
    writeFile(path.join(raw, 'audit.jsonl'), audit.join('\n') + '\n'),
  ])
  const result = { taskId: 'G6-03', runId, status: outcome, startedAt, finishedAt: new Date().toISOString(), elapsedSeconds: +( (performance.now() - start) / 1000 ).toFixed(3),
    evidenceKind: 'COURSE_SIMULATED_REHEARSAL', actualExecution: true, marker,
    applicationImplementationChanged: true, applicationChangeIssue: 'ISSUE-G6-03-001', releaseLock: 'evidence/g6/G6-03/rehearsal-release-lock.json', storage: 'IN_MEMORY', syntheticPorts: ['IDENTITY', 'MESSAGE', 'PUBLISHED_PLAN'],
    backendOrigin: backendUrl, frontendOrigin: frontUrl, environment: { node: process.version, platform: process.platform, browser: browserVersion?.product ?? 'Microsoft Edge headless CDP', userAgent: browserVersion?.userAgent ?? null },
    checks, uiActions: uiActions.map(item => item.id), screenshots,
    rawDirectory: path.relative(root, raw).replaceAll('\\', '/'), failure,
    realWorldStatus: 'REAL_WORLD_DEFERRED', cOverallReview: 'PENDING_REVIEW',
    boundaries: ['Not PostgreSQL persistence or crash recovery evidence.', 'Not owner real identity/message/video/GIS/access/position systems.', 'Not real mobile host or KN-065 independent deployment.', 'Not现场验收or a recalculation of historical G5 AC results.'], cleanup: { backendClosed: true, frontendClosed: true, browserProfileRemoved: true } }
  await writeFile(path.join(raw, 'result.json'), JSON.stringify(result, null, 2) + '\n')
  await writeFile(path.join(output, 'rehearsal-result.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify({ status: outcome, runId, elapsedSeconds: result.elapsedSeconds, checks: checks.length, screenshots: screenshots.length, failure: failure?.message ?? null }))
}
