<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import { getAlbum, getAlbums } from '@/api/albums'
import { getMyImages } from '@/api/image'
import type { AlbumDetail, MyImageListItem } from '@/api/types'
import { ImageStatus } from '@/enums/status'
import { useUserStore } from '@/stores/user'
import { getErrorMessage } from '@/utils/format'
import { imageThumbnailUrl, withAccessToken } from '@/utils/media'

interface ArchivedAlbum {
  album: AlbumDetail
  cover: string | null
}

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(false)
const images = ref<MyImageListItem[]>([])
const archivedAlbums = ref<ArchivedAlbum[]>([])

const archivedImageIds = computed(
  () =>
    new Set(
      archivedAlbums.value.flatMap(({ album }) => album.images.map((image) => image.id))
    )
)

const unarchivedImages = computed(() =>
  images.value.filter((image) => !archivedImageIds.value.has(image.id))
)

async function loadApprovedImages() {
  const limit = 100
  let page = 1

  while (true) {
    const result = await getMyImages({ page, limit, status: ImageStatus.APPROVED })
    images.value.push(...result.data)
    if (result.data.length < limit) break
    page++
  }
}

async function loadArchivedAlbums() {
  const userId = userStore.userId
  if (!userId) return

  const limit = 100
  let page = 1
  const summaries = []

  while (true) {
    const result = await getAlbums({ page, limit })
    summaries.push(...result.data.filter((album) => album.ownerId === userId))
    if (result.data.length < limit) break
    page++
  }

  const details = await Promise.all(
    summaries.map(async (album) => {
      try {
        return await getAlbum(album.id)
      } catch {
        return null
      }
    })
  )

  archivedAlbums.value = details
    .filter((album): album is AlbumDetail => Boolean(album && album.images.length > 0))
    .map((album) => ({
      album,
      cover: album.images[0] ? withAccessToken(album.images[0].thumbnailUrl) : null
    }))
}

function openAlbum(id: string) {
  router.push({ name: 'album-detail', params: { id } })
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([loadApprovedImages(), loadArchivedAlbums()])
  } catch (error) {
    message.error(getErrorMessage(error, '加载投稿失败'))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="mb-6 shrink-0">
      <h2 class="text-xl font-semibold">我的投稿</h2>
      <p class="mt-1 text-sm text-gray-500">已通过审核的投稿；已加入图集的按图集展示，其余直接展示图片。</p>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center">
      <n-spin size="large" />
    </div>

    <div v-else class="min-h-0 flex-1 overflow-y-auto">
      <section v-if="archivedAlbums.length > 0">
        <div class="mb-3 flex items-center gap-2">
          <h3 class="text-base font-semibold">已归档图集</h3>
          <n-tag size="small" :bordered="false">{{ archivedAlbums.length }}</n-tag>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <button
            v-for="item in archivedAlbums"
            :key="item.album.id"
            type="button"
            class="group overflow-hidden rounded-xl border bg-white text-left transition hover:shadow-md"
            @click="openAlbum(item.album.id)"
          >
            <div class="aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                v-if="item.cover"
                :src="item.cover"
                :alt="item.album.title"
                class="size-full object-cover transition duration-200 group-hover:scale-105"
              />
              <div v-else class="grid size-full place-items-center text-3xl">📁</div>
            </div>
            <div class="p-3">
              <div class="truncate text-sm font-medium">{{ item.album.title }}</div>
              <div class="mt-1 text-xs text-gray-400">
                {{ item.album.images.length }} 张 ·
                {{ item.album.visibility === 'private' ? '私有' : '公开' }}
              </div>
            </div>
          </button>
        </div>
      </section>

      <section :class="archivedAlbums.length > 0 ? 'mt-8' : ''">
        <div class="mb-3 flex items-center gap-2">
          <h3 class="text-base font-semibold">未归档图片</h3>
          <n-tag size="small" :bordered="false">{{ unarchivedImages.length }}</n-tag>
        </div>

        <n-image-group v-if="unarchivedImages.length > 0">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <div
              v-for="image in unarchivedImages"
              :key="image.id"
              class="aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              <n-image
                :src="withAccessToken(imageThumbnailUrl(image.id))"
                :width="'100%'"
                :height="'100%'"
                object-fit="cover"
              />
            </div>
          </div>
        </n-image-group>

        <n-empty v-else description="暂无未归档图片" class="py-10">
          <template #icon>
            <img :src="phoebe" alt="" class="size-16 object-contain" />
          </template>
        </n-empty>
      </section>

      <n-empty
        v-if="archivedAlbums.length === 0 && unarchivedImages.length === 0"
        description="还没有已通过的投稿"
        class="py-16"
      >
        <template #icon>
          <img :src="phoebe" alt="" class="size-[72px] object-contain" />
        </template>
        <template #extra>
          <n-button text type="primary" @click="router.push({ name: 'profile' })">
            去上传图片
          </n-button>
        </template>
      </n-empty>
    </div>
  </div>
</template>
