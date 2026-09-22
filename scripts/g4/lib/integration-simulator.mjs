import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SIMULATED_MARKER = 'SIMULATED_EVIDENCE';
export const EXTERNAL_PORTS = Object.freeze([
  'EXT-VIDEO', 'EXT-PUBLISH', 'EXT-INTRUSION', 'EXT-ACCESS',
  'EXT-FIRE', 'EXT-IOT', 'EXT-MIDDLE', 'EXT-MESSAGE'
]);
export const SIMULATED_BOUNDARIES = Object.freeze([...EXTERNAL_PORTS, 'GIS', 'H5']);
export const SCENARIOS = Object.freeze(['normal', 'unauthorized', 'timeout', 'failure']);

const defaultFixtureDirectory = fileURLToPath(
  new URL('../../../simulated-integrations/fixtures/', import.meta.url)
);

function assertFixture(fixture, fileName) {
  if (fixture.marker !== SIMULATED_MARKER) throw new Error(`${fileName}: marker must be ${SIMULATED_MARKER}`);
  if (!SIMULATED_BOUNDARIES.includes(fixture.adapter)) throw new Error(`${fileName}: unknown adapter ${fixture.adapter}`);
  if (typeof fixture.boundary !== 'string' || fixture.boundary.trim() === '') throw new Error(`${fileName}: boundary is required`);
  for (const scenario of SCENARIOS) {
    const response = fixture.scenarios?.[scenario];
    if (!response || !Number.isInteger(response.status) || typeof response.body !== 'object') {
      throw new Error(`${fileName}: scenario ${scenario} must define status and body`);
    }
    if (response.body.marker !== SIMULATED_MARKER || response.body.adapter !== fixture.adapter) {
      throw new Error(`${fileName}: scenario ${scenario} must retain marker and adapter`);
    }
  }
}

export async function loadFixtureRegistry(directory = defaultFixtureDirectory) {
  const entries = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort();
  const registry = new Map();
  for (const name of entries) {
    const fixture = JSON.parse(await readFile(join(directory, name), 'utf8'));
    assertFixture(fixture, name);
    if (registry.has(fixture.adapter)) throw new Error(`${name}: duplicate adapter ${fixture.adapter}`);
    registry.set(fixture.adapter, Object.freeze(fixture));
  }
  const missing = SIMULATED_BOUNDARIES.filter((adapter) => !registry.has(adapter));
  if (missing.length > 0) throw new Error(`missing simulated adapters: ${missing.join(', ')}`);
  return registry;
}

export function dispatchFixture(registry, adapter, scenario) {
  if (!registry.has(adapter)) {
    return { status: 404, body: { marker: SIMULATED_MARKER, code: 'SIM-ADAPTER-NOT-FOUND', adapter } };
  }
  if (!SCENARIOS.includes(scenario)) {
    return { status: 400, body: { marker: SIMULATED_MARKER, code: 'SIM-SCENARIO-INVALID', adapter } };
  }
  return structuredClone(registry.get(adapter).scenarios[scenario]);
}

export function fixtureDirectory() {
  return dirname(join(defaultFixtureDirectory, '.'));
}
