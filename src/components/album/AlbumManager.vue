<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import { deleteAlbum, getAlbums, submitAlbumReview } from '@/api/albums'
import type { AlbumSummary } from '@/api/types'
import { ALBUM_REVIEW_STATUS_LABEL } from '@/enums/album'
import { useUserStore } from '@/stores/user'
import { getErrorMessage } from '@/utils/format'
import AlbumFormModal from './AlbumFormModal.vue'
import ImagePickerModal from './ImagePickerModal.vue'

const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

const albums = ref<AlbumSummary[]>([])
const loading = ref(false)
const formShow = ref(false)
const editing = ref<AlbumSummary | null>(null)
const pickerShow = ref(false)
const pickerAlbumId = ref<string | null>(null)
const submittingId = ref('')

async function loadAlbums() {
  if (!userStore.userId) return

  loading.value = true
  try {
    const all: AlbumSummary[] = []
    let page = 1

    while (true) {
      const result = await getAlbums({ page, limit: 100 })
      all.push(...result.data)
      if (result.data.length < 100) break
      page += 1
    }

    albums.value = all.filter((album) => album.ownerId === userStore.userId)
  } catch (error) {
    message.error(getErrorMessage(error, '加载我的图库失败'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  formShow.value = true
}

function openEdit(album: AlbumSummary) {
  if (album.reviewStatus === 'rejected' && album.reviewEditUsed) {
    message.warning('这个图库的修改机会已用完，请直接重新提交评审')
    return
  }
  editing.value = album
  formShow.value = true
}

async function handleResubmit(album: AlbumSummary) {
  submittingId.value = album.id
  try {
    await submitAlbumReview(album.id)
    message.success('已重新提交评审')
    await loadAlbums()
  } catch (error) {
    message.error(getErrorMessage(error, '提交评审失败'))
  } finally {
    submittingId.value = ''
  }
}

function openPicker(album: AlbumSummary) {
  pickerAlbumId.value = album.id
  pickerShow.value = true
}

function handleSaved() {
  void loadAlbums()
}

function handleDelete(album: AlbumSummary) {
  dialog.warning({
    title: '删除图库',
    content: `确定删除“${album.title}”吗？图库里的图片本身不会被删除。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteAlbum(album.id)
        message.success('图库已删除')
        await loadAlbums()
      } catch (error) {
        message.error(getErrorMessage(error, '删除图库失败'))
      }
    }
  })
}

onMounted(() => {
  void loadAlbums()
})
</script>

<template>
  <section>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold">我的图库</h3>
        <p class="mt-1 text-sm text-gray-500">把已过审的图片整理成图库，可公开或仅自己可见。</p>
      </div>
      <n-button type="primary" @click="openCreate">创建图库</n-button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <n-spin />
    </div>

    <div v-else-if="albums.length" class="grid gap-4 sm:grid-cols-2">
      <article
        v-for="album in albums"
        :key="album.id"
        class="flex flex-col rounded-xl border bg-white p-4"
      >
        <div class="mb-3 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <RouterLink
              :to="{ name: 'album-detail', params: { id: album.id } }"
              class="block truncate font-medium hover:text-sky-600"
            >
              {{ album.title }}
            </RouterLink>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{{ album.visibility === 'private' ? '私有' : '公开' }}</span>
              <span>{{ album.imageCount }} 张</span>
              <n-tag v-if="album.reviewStatus !== 'none'" size="tiny" :bordered="false">
                {{ ALBUM_REVIEW_STATUS_LABEL[album.reviewStatus] }}
              </n-tag>
            </div>
          </div>
          <div class="flex shrink-0 flex-wrap justify-end gap-1">
            <n-button
              v-if="album.reviewStatus === 'rejected'"
              size="tiny"
              type="warning"
              quaternary
              :loading="submittingId === album.id"
              @click="handleResubmit(album)"
            >
              重新提交
            </n-button>
            <n-button size="tiny" quaternary @click="openEdit(album)">编辑</n-button>
            <n-button size="tiny" quaternary type="error" @click="handleDelete(album)">
              删除
            </n-button>
          </div>
        </div>

        <p class="mb-3 line-clamp-2 min-h-8 text-xs text-gray-500">
          {{ album.description || '暂无简介' }}
        </p>

        <div v-if="album.tags.length" class="mb-3 flex flex-wrap gap-1.5">
          <n-tag v-for="tag in album.tags" :key="tag.id" size="small" :bordered="false">
            {{ tag.name }}
          </n-tag>
        </div>

        <div class="mt-auto flex gap-2">
          <n-button size="small" @click="openPicker(album)">添加图片</n-button>
          <RouterLink :to="{ name: 'album-detail', params: { id: album.id } }">
            <n-button size="small" quaternary>查看</n-button>
          </RouterLink>
        </div>
      </article>
    </div>

    <n-empty v-else description="还没有创建图库" class="py-12">
      <template #icon>
        <img :src="phoebe" alt="" class="size-16 object-contain" />
      </template>
      <template #extra>
        <n-button type="primary" @click="openCreate">创建第一个图库</n-button>
      </template>
    </n-empty>

    <AlbumFormModal v-model:show="formShow" :album="editing" @saved="handleSaved" />
    <ImagePickerModal
      v-model:show="pickerShow"
      :album-id="pickerAlbumId"
      @saved="handleSaved"
    />
  </section>
</template>
