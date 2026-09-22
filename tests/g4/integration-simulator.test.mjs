import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dispatchFixture, EXTERNAL_PORTS, loadFixtureRegistry, SCENARIOS,
  SIMULATED_BOUNDARIES, SIMULATED_MARKER
} from '../../scripts/g4/lib/integration-simulator.mjs';
import { createSimulatedServer } from '../../scripts/g4/simulated-service.mjs';

test('registry exposes eight distinct EXT ports plus GIS and H5', async () => {
  const registry = await loadFixtureRegistry();
  assert.equal(EXTERNAL_PORTS.length, 8);
  assert.deepEqual([...registry.keys()].sort(), [...SIMULATED_BOUNDARIES].sort());
  assert.equal(new Set(EXTERNAL_PORTS).size, 8);
});

test('every adapter has deterministic marked normal, unauthorized, timeout and failure fixtures', async () => {
  const registry = await loadFixtureRegistry();
  for (const adapter of SIMULATED_BOUNDARIES) {
    for (const scenario of SCENARIOS) {
      const first = dispatchFixture(registry, adapter, scenario);
      const second = dispatchFixture(registry, adapter, scenario);
      assert.deepEqual(first, second);
      assert.equal(first.body.marker, SIMULATED_MARKER);
      assert.equal(first.body.adapter, adapter);
    }
  }
});

test('unknown adapters and scenarios fail closed with simulated markers', async () => {
  const registry = await loadFixtureRegistry();
  assert.equal(dispatchFixture(registry, 'EXT-UNKNOWN', 'normal').status, 404);
  assert.equal(dispatchFixture(registry, 'EXT-VIDEO', 'surprise').status, 400);
});

test('GIS and H5 fixtures retain frozen responsibility boundaries', async () => {
  const registry = await loadFixtureRegistry();
  const gis = dispatchFixture(registry, 'GIS', 'normal').body;
  const h5 = dispatchFixture(registry, 'H5', 'normal').body;
  assert.equal(gis.coordinateSystem, 'EPSG:4490');
  assert.equal(gis.provider, 'CLIENT_EXISTING_MAP_SERVICE');
  assert.equal(h5.delivery, 'EMBEDDED_H5_PACKAGE');
  assert.equal(h5.nativeApplicationDelivered, false);
});

test('HTTP simulator returns fixture status, body and evidence header', async (context) => {
  const server = await createSimulatedServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/simulated/v1/EXT-ACCESS/timeout`);
  assert.equal(response.status, 504);
  assert.equal(response.headers.get('x-evidence-kind'), SIMULATED_MARKER);
  const body = await response.json();
  assert.equal(body.code, 'SIM-ACCESS-RESULT-UNKNOWN');
  assert.equal(body.autoReplayAllowed, false);
});
