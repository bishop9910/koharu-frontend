<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { deleteUser } from '@/api/users'
import { useUserStore } from '@/stores/user'
import { verifyCurrentPassword } from '@/utils/reauth'
import { getErrorMessage } from '@/utils/format'
import { Role } from '@/enums/role'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const confirmed = ref(false)
const password = ref('')
const loading = ref(false)

const isSuperAdmin = computed(() => userStore.role === Role.SUPER_ADMIN)

async function handleDelete() {
  if (loading.value || !confirmed.value || !password.value) return
  if (!userStore.userId) {
    message.error('未找到当前用户')
    return
  }

  loading.value = true
  try {
    const reauthToken = await verifyCurrentPassword(password.value)
    await deleteUser(userStore.userId, reauthToken)
    userStore.logout()
    message.success('账号已删除')
    await router.replace({ name: 'login' })
  } catch (error) {
    message.error(getErrorMessage(error, '删除账号失败'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-full max-w-2xl overflow-y-auto">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-red-600">删除账号</h2>
      <p class="mt-1 text-sm text-gray-500">此操作会停用账号并进入删除流程，请谨慎操作。</p>
    </div>

    <n-alert type="warning" :bordered="false" class="mb-5">
      删除后账号将无法登录，图片、头像等数据会按后端清理策略处理，可能无法恢复。
    </n-alert>

    <n-alert v-if="isSuperAdmin" type="error" :bordered="false" class="mb-5">
      超级管理员账号不允许删除。
    </n-alert>

    <div class="space-y-4 rounded-xl border border-red-100 bg-red-50/40 p-5">
      <n-checkbox v-model:checked="confirmed">
        我确认已了解上述后果，并申请删除当前账号
      </n-checkbox>

      <n-input
        v-model:value="password"
        type="password"
        show-password-on="click"
        placeholder="请输入当前密码以确认身份"
        :maxlength="100"
      />

      <n-button
        type="error"
        :loading="loading"
        :disabled="isSuperAdmin || !confirmed || !password"
        @click="handleDelete"
      >
        永久删除账号
      </n-button>
    </div>
  </div>
</template>
