<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import { getAlbum } from '@/api/albums'
import type { AlbumDetail } from '@/api/types'
import { formatDateTime, getErrorMessage } from '@/utils/format'
import { withAccessToken } from '@/utils/media'

const route = useRoute()
const message = useMessage()

const album = ref<AlbumDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const albumId = computed(() => String(route.params.id ?? ''))

async function loadAlbum(id: string) {
  if (!id) return

  loading.value = true
  errorMessage.value = ''
  try {
    album.value = await getAlbum(id)
  } catch (error) {
    album.value = null
    errorMessage.value = getErrorMessage(error, '加载图集失败')
    message.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

watch(albumId, (id) => void loadAlbum(id), { immediate: true })
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <RouterLink
      :to="{ name: 'albums' }"
      class="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-800"
    >
      ← 返回图集
    </RouterLink>

    <div v-if="loading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <div v-else-if="errorMessage" class="rounded-xl border border-dashed bg-white py-16 text-center">
      <p class="text-sm text-gray-500">{{ errorMessage }}</p>
      <n-button class="mt-4" @click="loadAlbum(albumId)">重试</n-button>
    </div>

    <div v-else-if="album">
      <header class="mb-6">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-bold">{{ album.title }}</h1>
          <n-tag size="small" :bordered="false">
            {{ album.visibility === 'private' ? '私有' : '公开' }}
          </n-tag>
          <n-tag v-if="album.locked" size="small" type="warning" :bordered="false">已锁定</n-tag>
        </div>

        <p class="mt-3 whitespace-pre-wrap text-sm text-gray-600">
          {{ album.description || '暂无简介' }}
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
          <span>{{ album.owner?.username ?? '已注销用户' }}</span>
          <span>{{ album.images.length }} 张图片</span>
          <span>创建于 {{ formatDateTime(album.createdAt) }}</span>
        </div>

        <div v-if="album.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
          <n-tag v-for="tag in album.tags" :key="tag.id" size="small" :bordered="false">
            {{ tag.name }}
          </n-tag>
        </div>
      </header>

      <n-image-group v-if="album.images.length > 0">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <div
            v-for="image in album.images"
            :key="image.id"
            class="aspect-square overflow-hidden rounded-lg bg-gray-100"
          >
            <n-image
              :src="withAccessToken(image.thumbnailUrl)"
              :alt="image.filename"
              :width="'100%'"
              :height="'100%'"
              object-fit="cover"
            />
          </div>
        </div>
      </n-image-group>

      <n-empty v-else description="图集里还没有图片" class="py-16">
        <template #icon>
          <img :src="phoebe" alt="" class="size-[72px] object-contain" />
        </template>
        <template #extra>
          <RouterLink :to="{ name: 'albums' }" class="text-sm text-gray-500 hover:text-gray-800">
            去看看其他图集
          </RouterLink>
        </template>
      </n-empty>
    </div>
  </div>
</template>
