<script setup lang="ts">
import { computed } from 'vue'
import { QHeader, QToolbar, QToolbarTitle } from 'quasar'
import { useRoute } from 'vue-router'
import { dashboard } from '@/state/dashboard'
import { fxCaption } from '@/ui/fxCaption'

const route = useRoute()
const caption = computed(() => fxCaption(dashboard.fxStatus, dashboard.fx))
</script>

<template>
  <q-header elevated>
    <q-toolbar>
      <q-toolbar-title>Contract rate calculator</q-toolbar-title>
      <nav class="app-nav">
        <router-link to="/" :class="{ 'nav-link--on': route.name === 'calculator' }">Calculator</router-link>
        <router-link to="/how-it-works" :class="{ 'nav-link--on': route.name === 'how-it-works' }">How this works</router-link>
      </nav>
      <div class="fx-meta">{{ caption }}</div>
    </q-toolbar>
  </q-header>
</template>
