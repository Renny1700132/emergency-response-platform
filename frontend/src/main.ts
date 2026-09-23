import { createApp } from 'vue'
import App from './App.vue'
import { authContextKey, browserTokenProvider, createAuthContext } from './shared/auth/auth-context'
import { createApiClient } from './shared/http/api-client'
import { createAppRouter } from './router'
import './styles/base.css'

const tokenProvider = browserTokenProvider()
let auth: ReturnType<typeof createAuthContext>
const api = createApiClient({ tokenProvider, onUnauthorized: () => auth?.clear() })
auth = createAuthContext(api, tokenProvider)
const router = createAppRouter(auth)

createApp(App).provide(authContextKey, auth).use(router).mount('#app')
