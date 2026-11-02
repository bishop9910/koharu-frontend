<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const menuOptions: MenuOption[] = [
  { label: '资料', key: 'profile' },
  { label: '密码', key: 'password' },
  {
    label: '我的投稿',
    key: 'my-images',
    children: [
      { label: '已通过投稿', key: 'my-submissions' },
      { label: '待审核', key: 'my-images-pending' },
      { label: '未通过', key: 'my-images-rejected' }
    ]
  },
  { label: '我的头像', key: 'avatar' },
  { label: '删除账号', key: 'delete-account' }
]

const activeKey = computed(() => String(route.name ?? 'profile'))

function handleUpdate(key: string) {
  router.push({ name: key })
}
</script>

<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-gray-50">
    <AppHeader />

    <div class="flex-1 overflow-y-auto p-6">
      <div class="mx-auto flex h-full w-full max-w-6xl gap-6">
        <aside class="w-[200px] shrink-0 overflow-hidden rounded-xl bg-white shadow-sm">
          <n-menu
            mode="vertical"
            :options="menuOptions"
            :value="activeKey"
            :default-expanded-keys="['my-images']"
            @update:value="handleUpdate"
          />
        </aside>

        <section class="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
          <div class="flex min-h-0 flex-1 flex-col p-6">
            <RouterView />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
