<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import { getAlbums } from '@/api/albums'
import { getErrorMessage } from '@/utils/format'
import type { AlbumSummary } from '@/api/types'

const message = useMessage()
const loading = ref(false)
const albums = ref<AlbumSummary[]>([])

async function loadAlbums() {
  loading.value = true
  try {
    const result = await getAlbums({ page: 1, limit: 24 })
    albums.value = result.data
  } catch (error) {
    message.error(getErrorMessage(error, '加载图集失败'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadAlbums()
})
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <template v-if="loading">
      <div v-for="index in 8" :key="index" class="h-44 animate-pulse rounded-xl border bg-white" />
    </template>

    <RouterLink
      v-for="album in albums"
      v-else
      :key="album.id"
      :to="{ name: 'album-detail', params: { id: album.id } }"
      class="block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div class="mb-4 grid h-28 place-items-center rounded-lg bg-gray-100 text-3xl">📁</div>
      <div class="truncate font-medium">{{ album.title }}</div>
      <div class="mt-1 line-clamp-2 min-h-8 text-xs text-gray-500">
        {{ album.description || '暂无简介' }}
      </div>
      <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{{ album.owner?.username ?? '已注销用户' }}</span>
        <span>{{ album.imageCount }} 张</span>
      </div>
    </RouterLink>

    <n-empty
      v-if="!loading && albums.length === 0"
      description="暂无图集"
      class="col-span-full py-16"
    >
      <template #icon>
        <img :src="phoebe" alt="" class="size-[72px] object-contain" />
      </template>
      <template #extra>
        <n-button text type="primary" @click="loadAlbums">刷新看看</n-button>
      </template>
    </n-empty>
  </div>
</template>
