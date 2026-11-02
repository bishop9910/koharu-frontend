<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
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

function goLogin() {
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
}

function goRegister() {
  router.push({ name: 'register' })
}

function goProfile() {
  router.push({ name: 'profile' })
}

function logout() {
  userStore.logout()
  message.success('已退出登录')
  router.replace({ name: 'gallery' })
}
</script>

<template>
  <header class="z-10 flex h-16 shrink-0 items-center border-b bg-white px-6">
    <div class="flex w-full items-center justify-between">
      <RouterLink to="/home/gallery" class="flex items-center gap-2.5">
        <span class="grid size-9 place-items-center rounded-lg bg-[#e0eff9] text-sm font-bold text-gray-800">
          K
        </span>
        <span class="text-lg font-semibold tracking-tight">Koharu</span>
      </RouterLink>

      <n-popover
        v-if="userStore.isLoggedIn"
        trigger="hover"
        placement="bottom-end"
        :show-arrow="false"
        style="padding: 0; border-radius: 8px"
      >
        <template #trigger>
          <button class="cursor-pointer rounded-full transition hover:opacity-80">
            <span class="grid size-9 place-items-center overflow-hidden rounded-full bg-gray-100">
              <img
                v-if="avatarSrc && !avatarFailed"
                :src="avatarSrc"
                alt=""
                class="size-full object-cover"
                @error="avatarFailed = true"
              />
              <span v-else class="text-sm font-medium text-gray-500">{{ initial }}</span>
            </span>
          </button>
        </template>

        <div class="w-[240px]">
          <div class="flex items-center gap-3 bg-[#e0eff9] p-4">
            <span class="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
              <img
                v-if="avatarSrc && !avatarFailed"
                :src="avatarSrc"
                alt=""
                class="size-full object-cover"
              />
              <span v-else class="text-sm font-medium text-gray-500">{{ initial }}</span>
            </span>
            <div class="min-w-0">
              <div class="truncate font-bold text-gray-800">{{ userStore.username }}</div>
              <div class="truncate text-xs text-gray-500">{{ roleLabel }}</div>
            </div>
          </div>
          <div class="py-2">
            <div
              class="cursor-pointer px-4 py-2.5 text-sm hover:bg-gray-100"
              @click="goProfile"
            >
              个人中心
            </div>
            <div
              class="cursor-pointer px-4 py-2.5 text-sm hover:bg-gray-100"
              @click="logout"
            >
              退出登录
            </div>
          </div>
        </div>
      </n-popover>

      <div v-else class="flex items-center gap-2">
        <n-button quaternary @click="goLogin">登录</n-button>
        <n-button type="primary" @click="goRegister">注册</n-button>
      </div>
    </div>
  </header>
</template>
