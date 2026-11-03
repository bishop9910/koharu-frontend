<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import { addAlbumImages, getAlbum } from '@/api/albums'
import { getMyImages } from '@/api/image'
import { ImageStatus } from '@/enums/status'
import type { AlbumDetail, MyImageListItem } from '@/api/types'
import { getErrorMessage } from '@/utils/format'
import { imageThumbnailUrl, withAccessToken } from '@/utils/media'

const props = defineProps<{
  show: boolean
  albumId: string | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: [album: AlbumDetail]
}>()

const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const candidates = ref<MyImageListItem[]>([])
const selected = ref<string[]>([])

async function loadCandidates(albumId: string) {
  loading.value = true
  selected.value = []
  try {
    const album = await getAlbum(albumId)
    const existing = new Set(album.images.map((image) => image.id))
    const all: MyImageListItem[] = []
    let page = 1

    while (true) {
      const result = await getMyImages({
        page,
        limit: 100,
        status: ImageStatus.APPROVED
      })
      all.push(...result.data)
      if (result.data.length < 100) break
      page += 1
    }

    candidates.value = all.filter((image) => !existing.has(image.id))
  } catch (error) {
    candidates.value = []
    message.error(getErrorMessage(error, '加载可添加的图片失败'))
  } finally {
    loading.value = false
  }
}

function isSelected(id: string) {
  return selected.value.includes(id)
}

function toggle(id: string) {
  selected.value = isSelected(id)
    ? selected.value.filter((item) => item !== id)
    : [...selected.value, id]
}

function handleShowChange(value: boolean) {
  emit('update:show', value)
}

async function submit() {
  if (!props.albumId || selected.value.length === 0) {
    message.warning('请先选择图片')
    return
  }

  saving.value = true
  try {
    const album = await addAlbumImages(props.albumId, { imageIds: selected.value })
    message.success(`已添加 ${selected.value.length} 张图片`)
    emit('saved', album)
    emit('update:show', false)
  } catch (error) {
    message.error(getErrorMessage(error, '添加图片失败'))
  } finally {
    saving.value = false
  }
}

watch(
  () => [props.show, props.albumId] as const,
  ([show, albumId]) => {
    if (show && albumId) {
      void loadCandidates(albumId)
    }
  }
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="添加图片"
    style="width: 760px; max-width: calc(100vw - 32px)"
    @update:show="handleShowChange"
  >
    <div v-if="loading" class="flex justify-center py-16">
      <n-spin />
    </div>

    <template v-else>
      <div v-if="candidates.length" class="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto p-1 sm:grid-cols-4">
        <button
          v-for="image in candidates"
          :key="image.id"
          type="button"
          class="relative aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition"
          :class="isSelected(image.id) ? 'border-sky-500' : 'border-transparent hover:border-gray-300'"
          @click="toggle(image.id)"
        >
          <img
            :src="withAccessToken(imageThumbnailUrl(image.id))"
            :alt="image.filename"
            class="size-full object-cover"
          />
          <span
            v-if="isSelected(image.id)"
            class="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-sky-500 text-xs text-white"
          >
            ✓
          </span>
        </button>
      </div>

      <n-empty v-else description="没有可添加的已过审图片" class="py-12">
        <template #icon>
          <img :src="phoebe" alt="" class="size-16 object-contain" />
        </template>
        <template #extra>
          <RouterLink :to="{ name: 'studio' }" class="text-sm text-sky-600 hover:text-sky-700">
            去创作中心上传
          </RouterLink>
        </template>
      </n-empty>
    </template>

    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-400">已选择 {{ selected.length }} 张</span>
        <div class="flex gap-3">
          <n-button quaternary @click="handleShowChange(false)">取消</n-button>
          <n-button
            type="primary"
            :loading="saving"
            :disabled="selected.length === 0"
            @click="submit"
          >
            添加
          </n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>
