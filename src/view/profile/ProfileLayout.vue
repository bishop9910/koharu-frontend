<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type MenuOption } from 'naive-ui'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const menuOptions: MenuOption[] = [
  { label: '个人资料', key: 'profile' },
  {
    label: '我的投稿',
    key: 'my-images',
    children: [
      { label: '已通过', key: 'my-images-approved' },
      { label: '待审核', key: 'my-images-pending' },
      { label: '未通过', key: 'my-images-rejected' }
    ]
  },
  { label: '我的头像', key: 'avatar' },
  { label: '修改密码', key: 'password' },
  { label: '删除账号', key: 'delete-account' }
]

const activeKey = computed(() => {
  const name = route.name
  return typeof name === 'string' ? name : 'profile'
})

function handleUpdate(key: string) {
  router.push({ name: key })
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-50">
    <AppHeader />

    <div class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-5 md:flex-row md:gap-5 md:px-6">
      <aside class="w-full shrink-0 self-start overflow-hidden rounded-xl border bg-white shadow-sm md:w-52">
        <n-menu
          mode="vertical"
          :options="menuOptions"
          :value="activeKey"
          :default-expanded-keys="['my-images']"
          @update:value="handleUpdate"
        />
      </aside>

      <section class="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border bg-white p-6 shadow-sm">
        <RouterView />
      </section>
    </div>
  </div>
</template>
