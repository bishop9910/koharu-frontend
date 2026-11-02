<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type DropdownOption } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { ROLE_LABEL } from '@/enums/role'
import { avatarImageUrl, withAccessToken } from '@/utils/media'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const avatarFailed = ref(false)
const avatarSrc = computed(() =>
  userStore.userId ? withAccessToken(avatarImageUrl(userStore.userId)) : ''
)
const initial = computed(() => userStore.username.slice(0, 1).toUpperCase() || '?')
const roleLabel = computed(() => (userStore.role ? ROLE_LABEL[userStore.role] : ''))

watch(
  () => userStore.userId,
  () => {
    avatarFailed.value = false
  }
)

const options: DropdownOption[] = [
  { label: '个人资料', key: 'profile' },
  { label: '我的投稿', key: 'my-images-approved' },
  { label: '我的头像', key: 'avatar' },
  { type: 'divider', key: 'divider' },
  { label: '退出登录', key: 'logout' }
]

function handleSelect(key: string) {
  if (key === 'logout') {
    userStore.logout()
    message.success('已退出登录')
    router.replace({ name: 'login' })
    return
  }
  router.push({ name: key })
}
</script>

<template>
  <header class="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
    <div class="flex min-w-0 items-center gap-6">
      <RouterLink to="/home/gallery" class="flex items-center gap-2">
        <span class="grid size-8 place-items-center rounded-lg bg-gray-900 text-sm font-bold text-white">
          K
        </span>
        <span class="text-lg font-semibold tracking-tight">Koharu</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex">
        <RouterLink
          to="/home/gallery"
          class="rounded-md px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
          active-class="bg-gray-100 font-medium text-gray-900"
        >
          图库
        </RouterLink>
        <RouterLink
          to="/home/albums"
          class="rounded-md px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
          active-class="bg-gray-100 font-medium text-gray-900"
        >
          图集
        </RouterLink>
      </nav>
    </div>

    <n-dropdown :options="options" trigger="click" @select="handleSelect">
      <button class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100">
        <span class="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gray-100">
          <img
            v-if="avatarSrc && !avatarFailed"
            :src="avatarSrc"
            alt=""
            class="size-full object-cover"
            @error="avatarFailed = true"
          />
          <span v-else class="text-sm font-medium text-gray-500">{{ initial }}</span>
        </span>
        <span class="hidden text-left sm:block">
          <span class="block max-w-32 truncate text-sm font-medium">{{ userStore.username }}</span>
          <span class="block text-xs text-gray-500">{{ roleLabel }}</span>
        </span>
      </button>
    </n-dropdown>
  </header>
</template>
