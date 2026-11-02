<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import type { UploadCustomRequestOptions } from 'naive-ui/es/upload'
import { getCurrentUser, updateUser } from '@/api/users'
import { deleteAvatar, uploadAvatar } from '@/api/avatars'
import { uploadImage } from '@/api/image'
import { useUserStore } from '@/stores/user'
import { avatarImageUrl, withAccessToken } from '@/utils/media'
import { formatDateTime, getErrorMessage } from '@/utils/format'
import { ROLE_LABEL } from '@/enums/role'
import type { User } from '@/api/types'

const message = useMessage()
const dialog = useDialog()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const saving = ref(false)
const avatarBusy = ref(false)
const uploading = ref(false)
const avatarFailed = ref(false)
const avatarVersion = ref(0)
const profile = ref<User | null>(null)

const form = reactive({
  username: '',
  email: '',
  bio: ''
})

const avatarSrc = computed(() => {
  if (!profile.value) return ''
  const url = withAccessToken(avatarImageUrl(profile.value.id))
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${avatarVersion.value}`
})

const dirty = computed(() => {
  if (!profile.value) return false
  return (
    form.username !== profile.value.username ||
    form.email !== profile.value.email ||
    form.bio !== (profile.value.bio ?? '')
  )
})

function syncForm(user: User) {
  profile.value = user
  form.username = user.username
  form.email = user.email
  form.bio = user.bio ?? ''
  userStore.setUserInfo({
    id: user.id,
    username: user.username,
    role: user.role
  })
}

async function loadProfile() {
  loading.value = true
  try {
    const user = await getCurrentUser()
    syncForm(user)
    avatarFailed.value = false
    avatarVersion.value++
  } catch (error) {
    message.error(getErrorMessage(error, '加载个人资料失败'))
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!profile.value || saving.value || !dirty.value) return
  saving.value = true

  try {
    const updated = await updateUser(profile.value.id, {
      username: form.username.trim(),
      email: form.email.trim(),
      bio: form.bio.trim()
    })
    syncForm(updated)
    message.success('资料已更新')
  } catch (error) {
    message.error(getErrorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}

async function handleUploadAvatar(options: UploadCustomRequestOptions) {
  if (!profile.value) return
  const { file, onFinish, onError } = options
  if (!file.file) {
    onError?.()
    return
  }

  avatarBusy.value = true
  try {
    await uploadAvatar(profile.value.id, file.file as File)
    message.success('头像已提交，审核通过后生效')
    onFinish?.()
    await loadProfile()
  } catch (error) {
    message.error(getErrorMessage(error, '头像上传失败'))
    onError?.()
  } finally {
    avatarBusy.value = false
  }
}

function handleRemoveAvatar() {
  if (!profile.value || avatarBusy.value) return

  dialog.warning({
    title: '删除头像',
    content: '删除后头像会恢复为默认状态，确定继续吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      avatarBusy.value = true
      try {
        await deleteAvatar(profile.value!.id)
        message.success('头像已删除')
        await loadProfile()
      } catch (error) {
        message.error(getErrorMessage(error, '删除头像失败'))
      } finally {
        avatarBusy.value = false
      }
    }
  })
}

async function handleUploadImage(options: UploadCustomRequestOptions) {
  const { file, onFinish, onError } = options
  if (!file.file) {
    onError?.()
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file.file as File)
    await uploadImage(formData)
    message.success('上传成功，等待审核')
    onFinish?.()
    router.push({ name: 'my-images-pending' })
  } catch (error) {
    message.error(getErrorMessage(error, '图片上传失败'))
    onError?.()
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <div class="max-w-3xl">
    <div class="mb-6">
      <h2 class="text-xl font-semibold">个人资料</h2>
      <p class="mt-1 text-sm text-gray-500">管理头像、用户名、邮箱和自我介绍。</p>
    </div>

    <n-skeleton v-if="loading && !profile" text :repeat="6" />

    <template v-else-if="profile">
      <section class="mb-8 flex flex-col gap-5 rounded-xl border p-5 sm:flex-row sm:items-center">
        <div class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gray-100">
          <img
            v-if="avatarSrc && !avatarFailed"
            :src="avatarSrc"
            alt=""
            class="size-full object-cover"
            @error="avatarFailed = true"
          />
          <span v-else class="text-2xl font-medium text-gray-400">
            {{ profile.username.slice(0, 1).toUpperCase() }}
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-base font-medium">{{ profile.username }}</span>
            <n-tag size="small" :bordered="false">{{ ROLE_LABEL[profile.role] }}</n-tag>
            <n-tag v-if="profile.reviewExempt" size="small" type="success" :bordered="false">
              免审
            </n-tag>
          </div>
          <p class="mt-1 text-sm text-gray-500">支持 JPG、PNG、WebP，提交后需要审核。</p>

          <div class="mt-3 flex flex-wrap gap-2">
            <n-upload
              accept="image/*"
              :show-file-list="false"
              :custom-request="handleUploadAvatar"
              :disabled="avatarBusy"
            >
              <n-button size="small" :loading="avatarBusy">更换头像</n-button>
            </n-upload>
            <n-button
              size="small"
              quaternary
              type="error"
              :disabled="avatarBusy || !profile.avatar"
              @click="handleRemoveAvatar"
            >
              删除头像
            </n-button>
          </div>
        </div>
      </section>

      <section>
        <h3 class="mb-4 text-base font-semibold">基本资料</h3>
        <n-form label-placement="top">
          <n-form-item label="用户名">
            <n-input v-model:value="form.username" :maxlength="50" placeholder="用户名" />
          </n-form-item>

          <n-form-item label="邮箱">
            <n-input v-model:value="form.email" :maxlength="254" placeholder="邮箱" />
          </n-form-item>

          <n-form-item label="自我介绍">
            <n-input
              v-model:value="form.bio"
              type="textarea"
              :maxlength="500"
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder="介绍一下自己"
            />
          </n-form-item>

          <div class="flex items-center gap-3">
            <n-button type="primary" :loading="saving" :disabled="!dirty" @click="handleSave">
              保存修改
            </n-button>
            <n-button quaternary :disabled="!dirty" @click="profile && syncForm(profile)">重置</n-button>
          </div>
        </n-form>
      </section>

      <section class="mt-8 border-t pt-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-base font-semibold">上传图片</h3>
            <p class="mt-1 text-sm text-gray-500">上传后进入待审核列表，审核通过后展示在图库中。</p>
          </div>
          <n-upload
            accept="image/*"
            :show-file-list="false"
            :custom-request="handleUploadImage"
            :disabled="uploading"
          >
            <n-button type="primary" :loading="uploading">选择图片</n-button>
          </n-upload>
        </div>
      </section>

      <section class="mt-8 border-t pt-6">
        <h3 class="mb-3 text-base font-semibold">账号信息</h3>
        <dl class="grid gap-3 text-sm sm:grid-cols-2">
          <div class="flex justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
            <dt class="text-gray-500">注册时间</dt>
            <dd>{{ formatDateTime(profile.createdAt) }}</dd>
          </div>
          <div class="flex justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3">
            <dt class="text-gray-500">最近更新</dt>
            <dd>{{ formatDateTime(profile.updatedAt) }}</dd>
          </div>
        </dl>
      </section>
    </template>
  </div>
</template>
