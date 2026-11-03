<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import AlbumFormModal from '@/components/album/AlbumFormModal.vue'
import {
  favoriteAlbum,
  getAlbums,
  getFavoriteAlbums,
  getLikedAlbums,
  likeAlbum,
  searchAlbums,
  unfavoriteAlbum,
  unlikeAlbum
} from '@/api/albums'
import { getTags } from '@/api/tags'
import type { AlbumSummary, Tag } from '@/api/types'
import { useUserStore } from '@/stores/user'
import { getErrorMessage } from '@/utils/format'

type AlbumMode = 'all' | 'favorites' | 'liked'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const albums = ref<AlbumSummary[]>([])
const allTags = ref<Tag[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const keyword = ref('')
const searchFocused = ref(false)
const formShow = ref(false)
const page = ref(1)
const hasMore = ref(false)
const busy = ref<Record<string, boolean>>({})

const mode = computed<AlbumMode>(() => {
  if (route.name === 'favorites') return 'favorites'
  if (route.name === 'liked') return 'liked'
  return 'all'
})

const tagFragment = computed(() => {
  const match = keyword.value.match(/#([^\s#]*)$/)
  return match ? (match[1] ?? '') : null
})

const tagSuggestions = computed(() => {
  const fragment = tagFragment.value
  if (fragment === null) return []

  const value = fragment.toLowerCase()
  return allTags.value.filter((tag) => tag.name.toLowerCase().includes(value)).slice(0, 8)
})

const showTagSuggestions = computed(
  () => searchFocused.value && tagSuggestions.value.length > 0
)

const emptyText = computed(() => {
  if (mode.value === 'favorites') return '还没有收藏图库'
  if (mode.value === 'liked') return '还没有点赞过的图库'
  return '暂无图库'
})

function parseKeyword(value: string) {
  const tags: string[] = []
  const q = value
    .replace(/#([^\s#]+)/g, (_match: string, name: string) => {
      if (name && !tags.includes(name)) tags.push(name)
      return ' '
    })
    .replace(/\s+/g, ' ')
    .trim()

  return { q, tags }
}

function fetchPage(targetPage: number, limit: number) {
  if (mode.value === 'favorites') {
    return getFavoriteAlbums({ page: targetPage, limit })
  }
  if (mode.value === 'liked') {
    return getLikedAlbums({ page: targetPage, limit })
  }

  const { q, tags } = parseKeyword(keyword.value)
  if (q || tags.length) {
    return searchAlbums({
      page: targetPage,
      limit,
      q: q || undefined,
      tags: tags.length ? tags : undefined
    })
  }
  return getAlbums({ page: targetPage, limit })
}

async function loadAlbums() {
  loading.value = true
  page.value = 1
  try {
    const result = await fetchPage(1, 24)
    albums.value = result.data
    hasMore.value = result.page < result.totalPages
  } catch (error) {
    message.error(getErrorMessage(error, '加载图库失败'))
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  try {
    const next = page.value + 1
    const result = await fetchPage(next, 24)
    albums.value = [...albums.value, ...result.data]
    page.value = next
    hasMore.value = result.page < result.totalPages
  } catch (error) {
    message.error(getErrorMessage(error, '加载更多失败'))
  } finally {
    loadingMore.value = false
  }
}

async function loadTags() {
  try {
    allTags.value = await getTags()
  } catch {
    allTags.value = []
  }
}

function applyFilters() {
  searchFocused.value = false
  void loadAlbums()
}

function selectTag(name: string) {
  const match = keyword.value.match(/#([^\s#]*)$/)
  if (!match || match.index === undefined) return

  keyword.value = `${keyword.value.slice(0, match.index)}#${name} `
  applyFilters()
}

function goMode(name: AlbumMode) {
  const target = name === 'all' ? 'albums' : name
  if (route.name === target) return
  router.push({ name: target })
}

function openCreate() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  formShow.value = true
}

function handleSaved() {
  if (route.name !== 'albums') {
    router.push({ name: 'albums' })
    return
  }
  void loadAlbums()
}

function requireLogin() {
  if (userStore.isLoggedIn) return false

  router.push({ name: 'login', query: { redirect: route.fullPath } })
  return true
}

async function toggleReaction(album: AlbumSummary, kind: 'like' | 'favorite') {
  if (requireLogin()) return

  const key = `${kind}:${album.id}`
  if (busy.value[key]) return

  busy.value[key] = true
  try {
    const result =
      kind === 'like'
        ? album.likedByMe
          ? await unlikeAlbum(album.id)
          : await likeAlbum(album.id)
        : album.favoritedByMe
          ? await unfavoriteAlbum(album.id)
          : await favoriteAlbum(album.id)

    album.likeCount = result.likeCount
    album.favoriteCount = result.favoriteCount
    album.likedByMe = result.likedByMe
    album.favoritedByMe = result.favoritedByMe

    if (mode.value === 'favorites' && !result.favoritedByMe) {
      albums.value = albums.value.filter((item) => item.id !== album.id)
    }
    if (mode.value === 'liked' && !result.likedByMe) {
      albums.value = albums.value.filter((item) => item.id !== album.id)
    }
  } catch (error) {
    message.error(getErrorMessage(error, '操作失败'))
  } finally {
    busy.value[key] = false
  }
}

watch(
  () => route.name,
  (name, previous) => {
    if (name === previous) return
    if (name !== 'albums' && name !== 'favorites' && name !== 'liked') return

    keyword.value = ''
    searchFocused.value = false
    void loadAlbums()
  }
)

onMounted(() => {
  void loadTags()
  void loadAlbums()
})
</script>

<template>
  <div>
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <div v-if="mode === 'all'" class="relative w-72">
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="搜索图库，输入 #标签 可筛选"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @keyup.enter="applyFilters"
        />
        <div
          v-if="showTagSuggestions"
          class="absolute inset-x-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white p-1 shadow-lg"
        >
          <button
            v-for="tag in tagSuggestions"
            :key="tag.id"
            type="button"
            class="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-sky-50 hover:text-sky-700"
            @mousedown.prevent="selectTag(tag.name)"
          >
            #{{ tag.name }}
          </button>
        </div>
      </div>
      <n-button v-if="mode === 'all'" @click="applyFilters">搜索</n-button>

      <n-button v-if="mode === 'all'" type="primary" class="sm:ml-auto" @click="openCreate">
        创建图库
      </n-button>
    </div>

    <p v-if="mode === 'all'" class="mb-4 text-xs text-gray-400">
      搜索支持 #标签，例如 #风景；输入 # 会自动匹配已有标签。
    </p>

    <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="index in 8" :key="index" class="h-56 animate-pulse rounded-xl border bg-white" />
    </div>

    <div
      v-else-if="albums.length"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <article
        v-for="album in albums"
        :key="album.id"
        class="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
      >
        <RouterLink :to="{ name: 'album-detail', params: { id: album.id } }" class="block p-4">
          <div
            class="mb-4 grid h-28 place-items-center rounded-lg bg-gradient-to-br from-sky-50 to-indigo-100 text-3xl"
          >
            📁
          </div>
          <div class="flex items-center gap-2">
            <span class="truncate font-medium">{{ album.title }}</span>
            <n-tag
              v-if="album.reviewStatus === 'pending'"
              size="small"
              type="warning"
              :bordered="false"
            >
              待评审
            </n-tag>
            <n-tag
              v-else-if="album.reviewStatus === 'rejected'"
              size="small"
              type="error"
              :bordered="false"
            >
              已驳回
            </n-tag>
          </div>
          <div class="mt-1 line-clamp-2 min-h-8 text-xs text-gray-500">
            {{ album.description || '暂无简介' }}
          </div>
          <div v-if="album.tags.length" class="mt-2 flex flex-wrap gap-1.5">
            <n-tag v-for="tag in album.tags.slice(0, 2)" :key="tag.id" size="small" :bordered="false">
              {{ tag.name }}
            </n-tag>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>{{ album.owner?.username ?? '已注销用户' }}</span>
            <span>{{ album.imageCount }} 张</span>
          </div>
        </RouterLink>

        <div class="mt-auto flex items-center gap-4 border-t px-4 py-2 text-xs text-gray-500">
          <button
            type="button"
            class="flex items-center gap-1 transition hover:text-amber-600 disabled:opacity-50"
            :class="album.likedByMe ? 'text-amber-600' : ''"
            :disabled="busy[`like:${album.id}`]"
            @click.stop="toggleReaction(album, 'like')"
          >
            <span>{{ album.likedByMe ? '已赞' : '点赞' }}</span>
            <span>{{ album.likeCount }}</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1 transition hover:text-rose-500 disabled:opacity-50"
            :class="album.favoritedByMe ? 'text-rose-500' : ''"
            :disabled="busy[`favorite:${album.id}`]"
            @click.stop="toggleReaction(album, 'favorite')"
          >
            <span>{{ album.favoritedByMe ? '♥' : '♡' }}</span>
            <span>{{ album.favoriteCount }}</span>
          </button>
        </div>
      </article>
    </div>

    <n-empty v-else :description="emptyText" class="py-16">
      <template #icon>
        <img :src="phoebe" alt="" class="size-[72px] object-contain" />
      </template>
      <template #extra>
        <n-button v-if="mode !== 'all'" text type="primary" @click="goMode('all')">
          查看全部图库
        </n-button>
        <n-button v-else text type="primary" @click="openCreate">创建第一个图库</n-button>
      </template>
    </n-empty>

    <div v-if="!loading && hasMore" class="mt-6 flex justify-center">
      <n-button :loading="loadingMore" @click="loadMore">加载更多</n-button>
    </div>

    <AlbumFormModal v-model:show="formShow" @saved="handleSaved" />
  </div>
</template>
