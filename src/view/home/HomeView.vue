<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const menuOptions: MenuOption[] = [
  { label: '图库', key: 'gallery' },
  { label: '图集', key: 'albums' }
]

const activeKey = computed(() =>
  route.name === 'album-detail' ? 'albums' : String(route.name ?? 'gallery')
)
const pageTitle = computed(() => String(route.meta.title ?? '图库'))

function handleUpdate(key: string) {
  router.push({ name: key })
}
</script>

<template>
  <div class="flex h-screen w-full flex-col overflow-hidden">
    <AppHeader />

    <div class="flex min-h-0 flex-1">
      <aside class="w-[200px] shrink-0 overflow-y-auto border-r bg-gray-50">
        <n-menu mode="vertical" :options="menuOptions" :value="activeKey" @update:value="handleUpdate" />
      </aside>

      <main class="min-w-0 flex-1 overflow-y-auto p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold">{{ pageTitle }}</h2>
        </div>

        <RouterView />
      </main>
    </div>
  </div>
</template>
