import { createApp } from 'vue'
import App from './App.vue'
import { authContextKey, browserTokenProvider, createAuthContext } from './shared/auth/auth-context'
import { createApiClient } from './shared/http/api-client'
import { apiClientKey } from './shared/http/api-context'
import { createAppRouter } from './router'
import { createPresentationApiClient } from './shared/demo/presentation-api'
import './styles/base.css'

const presentationMode = import.meta.env.VITE_PRESENTATION_MODE === 'true'
const tokenProvider = presentationMode ? async () => 'presentation-demo-token' : browserTokenProvider()
let auth: ReturnType<typeof createAuthContext>
const api = presentationMode ? createPresentationApiClient() : createApiClient({ tokenProvider, onUnauthorized: () => auth?.clear() })
auth = createAuthContext(api, tokenProvider)
const router = createAppRouter(auth)

createApp(App).provide(apiClientKey, api).provide(authContextKey, auth).use(router).mount('#app')
