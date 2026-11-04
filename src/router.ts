import { createRouter, createWebHistory } from 'vue-router'
import CalculatorPage from '@/pages/CalculatorPage.vue'
import HowItWorksPage from '@/pages/HowItWorksPage.vue'
import LicensePage from '@/pages/LicensePage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'calculator', component: CalculatorPage },
    { path: '/how-it-works', name: 'how-it-works', component: HowItWorksPage },
    { path: '/license', name: 'license', component: LicensePage },
  ],
})
