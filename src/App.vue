<script setup lang="ts">
import { QBanner, QLayout, QPage, QPageContainer } from 'quasar'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { persistError } from '@/state/dashboard'
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <app-header />
    <q-page-container>
      <q-page class="page">
        <q-banner
          v-if="persistError"
          class="bg-orange-1 text-orange-10 q-mb-md"
          rounded
          dense
          role="status"
          aria-live="polite"
        >
          {{ persistError }}
        </q-banner>
        <router-view />
        <footer class="footer-note">
          <p>Estimate for negotiation. It is not tax, accounting, or legal advice.</p>
          <p class="footer-copy">© 2026 Andrei Tincu. Free to use if you credit this project.</p>
          <p class="footer-links">
            <router-link to="/how-it-works">How this works</router-link>
            <router-link to="/license">License</router-link>
          </p>
        </footer>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
