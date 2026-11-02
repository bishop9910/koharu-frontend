<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { getPublicKey } from '@/api/auth'
import { changePassword } from '@/api/users'
import { encryptPassword } from '@/utils/crypto'
import { verifyCurrentPassword } from '@/utils/reauth'
import { getErrorMessage } from '@/utils/format'

const message = useMessage()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

function validate() {
  if (!oldPassword.value) {
    message.warning('请输入当前密码')
    return false
  }
  if (newPassword.value.length < 6 || newPassword.value.length > 100) {
    message.warning('新密码长度为 6 到 100 个字符')
    return false
  }
  if (newPassword.value !== confirmPassword.value) {
    message.warning('两次输入的新密码不一致')
    return false
  }
  if (oldPassword.value === newPassword.value) {
    message.warning('新密码不能与当前密码相同')
    return false
  }
  return true
}

async function handleSubmit() {
  if (loading.value || !validate()) return
  loading.value = true

  try {
    const reauthToken = await verifyCurrentPassword(oldPassword.value)
    const { publicKey } = await getPublicKey()
    await changePassword(
      {
        newPassword: encryptPassword(newPassword.value, publicKey),
        encrypted: true
      },
      reauthToken
    )

    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    message.success('密码已修改')
  } catch (error) {
    message.error(getErrorMessage(error, '修改密码失败'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg">
    <div class="mb-6">
      <h2 class="text-xl font-semibold">修改密码</h2>
      <p class="mt-1 text-sm text-gray-500">
        出于安全考虑，修改前需要验证当前密码；验证票据有效期约 5 分钟。
      </p>
    </div>

    <n-form label-placement="top">
      <n-form-item label="当前密码">
        <n-input
          v-model:value="oldPassword"
          type="password"
          show-password-on="click"
          placeholder="请输入当前密码"
          :maxlength="100"
        />
      </n-form-item>

      <n-form-item label="新密码">
        <n-input
          v-model:value="newPassword"
          type="password"
          show-password-on="click"
          placeholder="6 到 100 个字符"
          :maxlength="100"
        />
      </n-form-item>

      <n-form-item label="确认新密码">
        <n-input
          v-model:value="confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="请再次输入新密码"
          :maxlength="100"
          @keyup.enter="handleSubmit"
        />
      </n-form-item>

      <n-button type="primary" :loading="loading" @click="handleSubmit">提交新密码</n-button>
    </n-form>
  </div>
</template>
