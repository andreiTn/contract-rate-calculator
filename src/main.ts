import { createApp } from 'vue'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import App from './App.vue'
import { Quasar, quasarOptions } from './plugins/quasar'
import { router } from './router'
import { hydrateDashboard, refreshRates, startPersistence } from './state/dashboard'
import './styles.css'

async function boot() {
  await hydrateDashboard()
  startPersistence()
  void refreshRates()

  const app = createApp(App)
  app.use(router)
  app.use(Quasar, quasarOptions)

  // GitHub Pages serves public/404.html for unknown paths. That page stashes the
  // URL and redirects to /. Restore the intended route before the first paint.
  const redirected = sessionStorage.getItem('spa-redirect')
  if (redirected) {
    sessionStorage.removeItem('spa-redirect')
    await router.replace(redirected)
  }

  app.mount('#app')
}

void boot()
