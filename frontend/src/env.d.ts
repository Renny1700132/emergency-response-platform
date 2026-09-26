/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRESENTATION_MODE?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_REQUEST_TIMEOUT_MS?: string
  readonly VITE_APP_TITLE?: string
}

interface Window {
  __MUSEUM_AUTH__?: { getAccessToken(): string | null | Promise<string | null> }
  MuseumHostBridge?: { getAccessToken(): string | null | Promise<string | null> }
}
