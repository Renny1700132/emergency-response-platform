import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const [url, output, widthText = '390', heightText = '844'] = process.argv.slice(2)
if (!url || !output) throw new Error('Usage: node scripts/g5/capture-edge-viewport.mjs <url> <output> [width] [height]')
const width = Number(widthText)
const height = Number(heightText)
if (!Number.isInteger(width) || !Number.isInteger(height) || width < 240 || height < 320) throw new Error('Invalid viewport')

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const profile = await mkdtemp(path.join(os.tmpdir(), 'g5-edge-cdp-'))
const port = 9335
const browser = spawn(edge, [
  '--headless', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' })

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
let target
let socket
try {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
      if (response.ok) { target = await response.json(); break }
    } catch {}
    await delay(200)
  }
  if (!target?.webSocketDebuggerUrl) throw new Error('Edge DevTools target did not become ready')

  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let sequence = 0
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id || !pending.has(message.id)) return
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result)
  })
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

  await command('Page.enable')
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true, screenWidth: width, screenHeight: height })
  await command('Page.navigate', { url })
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const state = await command('Runtime.evaluate', { expression: 'document.readyState' })
    if (state.result?.value === 'complete') break
    await delay(100)
  }
  await delay(500)
  const metrics = await command('Runtime.evaluate', { expression: '({innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth})', returnByValue: true })
  const shot = await command('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await mkdir(path.dirname(path.resolve(output)), { recursive: true })
  await writeFile(path.resolve(output), Buffer.from(shot.data, 'base64'))
  console.info(JSON.stringify({ output: path.resolve(output), viewport: metrics.result.value }, null, 2))
  await command('Browser.close')
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close()
  if (browser.exitCode === null) browser.kill()
  await Promise.race([once(browser, 'exit'), delay(2000)])
  const resolvedProfile = path.resolve(profile)
  const resolvedTemp = path.resolve(os.tmpdir())
  if (resolvedProfile.startsWith(`${resolvedTemp}${path.sep}`)) await rm(resolvedProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
