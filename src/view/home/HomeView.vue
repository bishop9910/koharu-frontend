<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { UploadCustomRequestOptions } from 'naive-ui/es/upload'
import AppHeader from '@/components/layout/AppHeader.vue'
import { uploadImage } from '@/api/image'
import { getErrorMessage } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const pageTitle = computed(() => route.meta.title ?? '图库')
const pageDescription = computed(() =>
  route.name === 'albums'
    ? '浏览公开图集，图片会按图集归类展示。'
    : '浏览已通过审核的图片，上传后会在「我的投稿」中显示。'
)

async function handleUpload(options: UploadCustomRequestOptions) {
  const { file, onFinish, onError } = options
  if (!file.file) {
    onError?.()
    return
  }

  const formData = new FormData()
  formData.append('file', file.file)

  try {
    await uploadImage(formData)
    message.success('上传成功，等待审核')
    onFinish?.()
    router.push({ name: 'my-images-pending' })
  } catch (error) {
    message.error(getErrorMessage(error, '上传失败'))
    onError?.()
  }
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-50">
    <AppHeader />

    <main class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-5 md:px-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ pageTitle }}</h1>
          <p class="mt-0.5 text-sm text-gray-500">{{ pageDescription }}</p>
        </div>

        <n-upload
          accept="image/*"
          :show-file-list="false"
          :custom-request="handleUpload"
          class="w-auto"
        >
          <n-button type="primary">上传图片</n-button>
        </n-upload>
      </div>

      <div class="min-h-0 flex-1">
        <RouterView />
      </div>
    </main>
  </div>
</template>
