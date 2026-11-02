<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { getPublicKey } from '@/api/auth'
import { createUser } from '@/api/users'
import { encryptPassword } from '@/utils/crypto'
import { getErrorMessage } from '@/utils/format'

const router = useRouter()
const message = useMessage()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const bio = ref('')
const loading = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  const name = username.value.trim()
  if (name.length < 2 || name.length > 50) {
    message.warning('用户名长度为 2 到 50 个字符')
    return false
  }
  if (!emailPattern.test(email.value.trim())) {
    message.warning('请输入正确的邮箱地址')
    return false
  }
  if (password.value.length < 6 || password.value.length > 100) {
    message.warning('密码长度为 6 到 100 个字符')
    return false
  }
  if (password.value !== confirmPassword.value) {
    message.warning('两次输入的密码不一致')
    return false
  }
  return true
}

async function handleSubmit() {
  if (loading.value || !validate()) return
  loading.value = true

  try {
    const { publicKey } = await getPublicKey()
    await createUser({
      username: username.value.trim(),
      email: email.value.trim(),
      password: encryptPassword(password.value, publicKey),
      bio: bio.value.trim() || undefined,
      encrypted: true
    })

    message.success('注册成功，请登录')
    await router.replace({ name: 'login' })
  } catch (error) {
    message.error(getErrorMessage(error, '注册失败'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="创建账号" subtitle="填写以下信息完成注册">
    <n-form label-placement="left" label-width="0" @submit.prevent="handleSubmit">
      <n-form-item path="username">
        <n-input v-model:value="username" placeholder="请输入用户名" size="large" :maxlength="50">
          <template #prefix>
            <svg class="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </template>
        </n-input>
      </n-form-item>

      <n-form-item path="email">
        <n-input v-model:value="email" placeholder="请输入邮箱" size="large" :maxlength="254">
          <template #prefix>
            <svg class="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
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
        >
          <template #prefix>
            <svg class="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </template>
        </n-input>
      </n-form-item>

      <n-form-item path="confirmPassword">
        <n-input
          v-model:value="confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="请再次输入密码"
          size="large"
          :maxlength="100"
        >
          <template #prefix>
            <svg class="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </n-input>
      </n-form-item>

      <n-form-item path="bio">
        <n-input
          v-model:value="bio"
          type="textarea"
          placeholder="介绍一下自己（可选）"
          :maxlength="500"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>

      <n-button type="primary" block strong size="large" :loading="loading" class="mt-2" @click="handleSubmit">
        立即注册
      </n-button>
    </n-form>

    <template #footer>
      已经有账号？
      <RouterLink to="/login" class="font-medium text-primary hover:underline">去登录</RouterLink>
    </template>
  </AuthLayout>
</template>
