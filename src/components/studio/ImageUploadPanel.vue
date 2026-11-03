<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui/es/upload'
import { uploadImage } from '@/api/image'
import { getErrorMessage } from '@/utils/format'

const message = useMessage()
const router = useRouter()

const uploading = ref(false)
const uploadFiles = ref<UploadFileInfo[]>([])

async function handleUploadImages() {
  const files = uploadFiles.value
    .map((item) => item.file)
    .filter((file): file is File => file instanceof File)

  if (!files.length) {
    message.warning('请先选择图片')
    return
  }

  uploading.value = true
  let success = 0
  let failed = 0
  let lastError: unknown

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      await uploadImage(formData)
      success++
    } catch (error) {
      failed++
      lastError = error
    }
  }

  uploading.value = false
  uploadFiles.value = []

  if (success > 0) {
    message.success(
      failed > 0 ? `成功上传 ${success} 张，${failed} 张失败` : `已上传 ${success} 张，等待审核`
    )
    router.push({ name: 'my-images-pending' })
    return
  }

  message.error(getErrorMessage(lastError, '图片上传失败'))
}

function clearUploadFiles() {
  if (uploading.value) return
  uploadFiles.value = []
}
</script>

<template>
  <section>
    <div class="mb-4">
      <h3 class="text-base font-semibold">上传图片</h3>
      <p class="mt-1 text-sm text-gray-500">
        支持单张或多张上传，提交后进入待审核列表。审核通过后可以加入图库。
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <n-upload
        v-model:file-list="uploadFiles"
        multiple
        accept="image/*"
        :default-upload="false"
        :show-file-list="false"
        :max="20"
        :disabled="uploading"
      >
        <n-button :disabled="uploading">选择图片</n-button>
      </n-upload>

      <n-button
        type="primary"
        :loading="uploading"
        :disabled="uploadFiles.length === 0"
        @click="handleUploadImages"
      >
        {{ uploadFiles.length ? `上传 ${uploadFiles.length} 张` : '上传' }}
      </n-button>

      <n-button v-if="uploadFiles.length" quaternary :disabled="uploading" @click="clearUploadFiles">
        清空
      </n-button>
    </div>

    <p v-if="uploadFiles.length" class="mt-2 text-xs text-gray-400">
      已选择 {{ uploadFiles.length }} 张图片
    </p>
  </section>
</template>
