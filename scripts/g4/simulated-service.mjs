import { createServer } from 'node:http';
import { dispatchFixture, loadFixtureRegistry, SIMULATED_MARKER } from './lib/integration-simulator.mjs';

export async function createSimulatedServer() {
  const registry = await loadFixtureRegistry();
  return createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://simulated.local');
    const match = /^\/simulated\/v1\/([^/]+)\/([^/]+)$/.exec(url.pathname);
    const result = match
      ? dispatchFixture(registry, decodeURIComponent(match[1]), decodeURIComponent(match[2]))
      : { status: 404, body: { marker: SIMULATED_MARKER, code: 'SIM-ROUTE-NOT-FOUND' } };
    response.writeHead(result.status, {
      'content-type': 'application/json; charset=utf-8',
      'x-evidence-kind': SIMULATED_MARKER,
      'cache-control': 'no-store'
    });
    response.end(JSON.stringify(result.body));
  });
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href) {
  const port = Number.parseInt(process.env.SIMULATED_PORT ?? '43104', 10);
  const server = await createSimulatedServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(JSON.stringify({ marker: SIMULATED_MARKER, status: 'LISTENING', host: '127.0.0.1', port }));
  });
}
