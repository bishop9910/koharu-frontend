<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { getPublicKey, login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { encryptPassword } from '@/utils/crypto'
import { getErrorMessage } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

function validate() {
  if (!username.value.trim()) {
    message.warning('请输入账号')
    return false
  }
  if (username.value.trim().length < 2 || username.value.trim().length > 50) {
    message.warning('账号长度为 2 到 50 个字符')
    return false
  }
  if (password.value.length < 6 || password.value.length > 100) {
    message.warning('密码长度为 6 到 100 个字符')
    return false
  }
  return true
}

async function handleSubmit() {
  if (loading.value || !validate()) return
  loading.value = true

  try {
    const { publicKey } = await getPublicKey()
    const encryptedPassword = encryptPassword(password.value, publicKey)
    const result = await login({
      username: username.value.trim(),
      password: encryptedPassword,
      encrypted: true
    })

    authStore.setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    })
    userStore.setUserInfo(result.user)

    const redirect = route.query.redirect
    const target =
      typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
        ? redirect
        : '/home/gallery'
    await router.replace(target)
    message.success('登录成功')
  } catch (error) {
    message.error(getErrorMessage(error, '登录失败，请检查账号和密码'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="欢迎登录" subtitle="使用账号密码登录 Koharu">
    <n-form label-placement="left" label-width="0" @submit.prevent="handleSubmit">
      <n-form-item path="username">
        <n-input v-model:value="username" placeholder="请输入账号" size="large" :maxlength="50">
          <template #prefix>
            <svg class="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </template>
        </n-input>
      </n-form-item>

      <n-form-item path="password">
        <n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          placeholder="请输入密码"
          size="large"
          :maxlength="100"
          @keyup.enter="handleSubmit"
        >
          <template #prefix>
            <svg class="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </template>
        </n-input>
      </n-form-item>

      <n-button type="primary" block strong size="large" :loading="loading" class="mt-4" @click="handleSubmit">
        登 录
      </n-button>
    </n-form>

    <template #footer>
      还没有账号？
      <RouterLink to="/register" class="font-medium text-primary hover:underline">立即注册</RouterLink>
    </template>
  </AuthLayout>
</template>
