import type { Component } from 'vue'
import { QBtn, QBtnToggle, QTab, Quasar } from 'quasar'
import { brand } from '@/theme/brand'

/**
 * Quasar's install config has no switch for button case.
 * The noCaps prop is what turns off the default uppercase,
 * so the default is set on each button-like component here.
 */
function enableNoCaps(component: Component) {
  const props = (component as { props?: Record<string, unknown> }).props
  if (!props || !('noCaps' in props)) return
  props.noCaps = { type: Boolean, default: true }
}

enableNoCaps(QBtn)
enableNoCaps(QBtnToggle)
enableNoCaps(QTab)

/**
 * `config.brand` sets the runtime CSS variables (--q-primary and friends)
 * used by props such as color="primary".
 * Build-time Sass ($primary and friends) still comes from
 * `src/quasar-variables.sass` via the Vite Quasar plugin.
 * Keep both colour lists matching `src/theme/brand.ts`.
 */
export const quasarOptions = {
  config: { brand },
  plugins: {},
}

export { Quasar }
