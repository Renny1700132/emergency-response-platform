const REQUIRED_PRODUCTION_KEYS = ['DATABASE_URL', 'MIDDLE_PLATFORM_BASE_URL'];

export function loadConfig(environment = process.env) {
  const mode = environment.NODE_ENV ?? 'development';
  const port = Number(environment.PORT ?? 3000);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535');
  }

  const missing = mode === 'production'
    ? REQUIRED_PRODUCTION_KEYS.filter((key) => !environment[key])
    : [];
  if (missing.length > 0) {
    throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  }

  return Object.freeze({
    mode,
    port,
    databaseUrl: environment.DATABASE_URL ?? null,
    middlePlatformBaseUrl: environment.MIDDLE_PLATFORM_BASE_URL ?? null,
    middlePlatformIdentityPath: environment.MIDDLE_PLATFORM_IDENTITY_PATH ?? '/api/v1/platform/context',
    middlePlatformFilePresignPath: environment.MIDDLE_PLATFORM_FILE_PRESIGN_PATH ?? '/api/v1/platform/files/presign',
    requestTimeoutMs: Number(environment.REQUEST_TIMEOUT_MS ?? 3000),
    simulatedIntegrationBaseUrl: environment.SIMULATED_INTEGRATION_BASE_URL ?? null,
    simulatedMessageScenario: environment.SIMULATED_MESSAGE_SCENARIO ?? 'normal',
    allowDevelopmentIdentityHeaders: mode === 'development' && environment.ALLOW_DEVELOPMENT_IDENTITY_HEADERS === 'true'
  });
}
