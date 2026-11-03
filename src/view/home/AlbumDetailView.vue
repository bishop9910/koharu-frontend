<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import AlbumFormModal from '@/components/album/AlbumFormModal.vue'
import ImagePickerModal from '@/components/album/ImagePickerModal.vue'
import {
  deleteAlbum,
  favoriteAlbum,
  getAlbum,
  likeAlbum,
  removeAlbumImages,
  reportAlbum,
  submitAlbumReview,
  unfavoriteAlbum,
  unlikeAlbum,
  unlockAlbum
} from '@/api/albums'
import type { AlbumDetail, AlbumImage } from '@/api/types'
import { ALBUM_REVIEW_STATUS_LABEL } from '@/enums/album'
import { hasRole, Role } from '@/enums/role'
import { useUserStore } from '@/stores/user'
import { formatDateTime, getErrorMessage } from '@/utils/format'
import { withAccessToken } from '@/utils/media'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

const album = ref<AlbumDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const editShow = ref(false)
const pickerShow = ref(false)
const likeBusy = ref(false)
const favoriteBusy = ref(false)
const reportShow = ref(false)
const reportReason = ref('')
const reportDetail = ref('')
const reportSubmitting = ref(false)
const submittingReview = ref(false)
const albumId = computed(() => String(route.params.id ?? ''))
const canManage = computed(() => {
  if (!album.value) return false
  return userStore.userId === album.value.ownerId || hasRole(userStore.role, Role.ADMIN)
})
const canEdit = computed(() => {
  if (!album.value) return false
  return canManage.value && !(album.value.reviewStatus === 'rejected' && album.value.reviewEditUsed)
})
const canUnlock = computed(() => hasRole(userStore.role, Role.ADMIN))
const canResubmit = computed(() => {
  if (!album.value) return false
  return album.value.ownerId === userStore.userId && album.value.reviewStatus === 'rejected'
})
const canReport = computed(() => {
  if (!album.value) return false
  return userStore.isLoggedIn && album.value.ownerId !== userStore.userId
})
const reviewTagType = computed<'default' | 'success' | 'warning' | 'error'>(() => {
  if (album.value?.reviewStatus === 'pending') return 'warning'
  if (album.value?.reviewStatus === 'approved') return 'success'
  if (album.value?.reviewStatus === 'rejected') return 'error'
  return 'default'
})
const reviewStatusLabel = computed(() =>
  album.value ? ALBUM_REVIEW_STATUS_LABEL[album.value.reviewStatus] : ''
)

async function loadAlbum(id: string) {
  if (!id) return

  loading.value = true
  errorMessage.value = ''
  try {
    album.value = await getAlbum(id)
  } catch (error) {
    album.value = null
    errorMessage.value = getErrorMessage(error, '加载图库失败')
    message.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

function requireLogin() {
  if (userStore.isLoggedIn) return false

  router.push({ name: 'login', query: { redirect: route.fullPath } })
  return true
}

async function toggleLike() {
  if (!album.value || requireLogin()) return

  likeBusy.value = true
  try {
    const result = album.value.likedByMe ? await unlikeAlbum(album.value.id) : await likeAlbum(album.value.id)
    album.value.likeCount = result.likeCount
    album.value.favoriteCount = result.favoriteCount
    album.value.likedByMe = result.likedByMe
    album.value.favoritedByMe = result.favoritedByMe
  } catch (error) {
    message.error(getErrorMessage(error, '操作失败'))
  } finally {
    likeBusy.value = false
  }
}

async function toggleFavorite() {
  if (!album.value || requireLogin()) return

  favoriteBusy.value = true
  try {
    const result = album.value.favoritedByMe
      ? await unfavoriteAlbum(album.value.id)
      : await favoriteAlbum(album.value.id)
    album.value.likeCount = result.likeCount
    album.value.favoriteCount = result.favoriteCount
    album.value.likedByMe = result.likedByMe
    album.value.favoritedByMe = result.favoritedByMe
  } catch (error) {
    message.error(getErrorMessage(error, '操作失败'))
  } finally {
    favoriteBusy.value = false
  }
}

function openReport() {
  if (requireLogin()) return

  reportReason.value = ''
  reportDetail.value = ''
  reportShow.value = true
}

async function submitReport() {
  if (!album.value) return

  const reason = reportReason.value.trim()
  if (!reason) {
    message.warning('请填写举报原因')
    return
  }

  reportSubmitting.value = true
  try {
    await reportAlbum(album.value.id, {
      reason,
      detail: reportDetail.value.trim() || undefined
    })
    message.success('举报已提交，等待处理')
    reportShow.value = false
  } catch (error) {
    message.error(getErrorMessage(error, '举报失败'))
  } finally {
    reportSubmitting.value = false
  }
}

async function handleResubmit() {
  if (!album.value) return

  submittingReview.value = true
  try {
    album.value = await submitAlbumReview(album.value.id)
    message.success('已重新提交评审')
  } catch (error) {
    message.error(getErrorMessage(error, '提交评审失败'))
  } finally {
    submittingReview.value = false
  }
}

function handleSaved(updated: AlbumDetail) {
  album.value = updated
}

function handleDelete() {
  if (!album.value) return

  dialog.warning({
    title: '删除图库',
    content: `确定删除“${album.value.title}”吗？图库里的图片本身不会被删除。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteAlbum(album.value!.id)
        message.success('图库已删除')
        router.replace({ name: 'albums' })
      } catch (error) {
        message.error(getErrorMessage(error, '删除图库失败'))
      }
    }
  })
}

function handleRemoveImage(image: AlbumImage) {
  if (!album.value) return

  dialog.warning({
    title: '移出图库',
    content: '只把这张图片移出图库，不会删除图片本身。',
    positiveText: '移出',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const updated = await removeAlbumImages(album.value!.id, { imageIds: [image.id] })
        album.value = updated
        message.success('已移出图库')
      } catch (error) {
        message.error(getErrorMessage(error, '移出图片失败'))
      }
    }
  })
}

async function handleUnlock() {
  if (!album.value) return
  try {
    album.value = await unlockAlbum(album.value.id)
    message.success('图库已解锁')
  } catch (error) {
    message.error(getErrorMessage(error, '解锁图库失败'))
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
      ← 返回图库
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
          <n-tag v-if="album.reviewStatus !== 'none'" size="small" :type="reviewTagType" :bordered="false">
            {{ reviewStatusLabel }}
          </n-tag>

          <div class="ml-auto flex flex-wrap items-center gap-2">
            <n-button size="small" :loading="likeBusy" @click="toggleLike">
              {{ album.likedByMe ? '已赞' : '点赞' }} {{ album.likeCount }}
            </n-button>
            <n-button size="small" :loading="favoriteBusy" @click="toggleFavorite">
              {{ album.favoritedByMe ? '♥ 已收藏' : '♡ 收藏' }} {{ album.favoriteCount }}
            </n-button>
            <n-button v-if="canReport" size="small" quaternary @click="openReport">举报</n-button>
            <template v-if="canManage">
              <n-button size="small" :disabled="!canEdit" @click="editShow = true">编辑</n-button>
              <n-button size="small" @click="pickerShow = true">添加图片</n-button>
              <n-button
                v-if="canResubmit"
                size="small"
                type="warning"
                :loading="submittingReview"
                @click="handleResubmit"
              >
                重新提交评审
              </n-button>
              <n-button size="small" type="error" quaternary @click="handleDelete">删除</n-button>
            </template>
            <n-button v-if="album.locked && canUnlock" size="small" type="warning" @click="handleUnlock">
              解锁
            </n-button>
          </div>
        </div>

        <p class="mt-3 whitespace-pre-wrap text-sm text-gray-600">
          {{ album.description || '暂无简介' }}
        </p>

        <n-alert
          v-if="album.reviewStatus === 'rejected'"
          class="mt-4"
          type="error"
          :show-icon="false"
        >
          <template #header>图集审核未通过</template>
          {{ album.reviewRejectReason || '未填写驳回原因' }}
          <p v-if="album.reviewEditUsed" class="mt-1 text-xs">
            修改机会已用完，可调整后重新提交评审。
          </p>
        </n-alert>

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
            class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
          >
            <n-image
              :src="withAccessToken(image.thumbnailUrl)"
              :alt="image.filename"
              :width="'100%'"
              :height="'100%'"
              object-fit="cover"
            />
            <button
              v-if="canManage"
              type="button"
              class="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-black/50 text-sm text-white opacity-0 transition group-hover:opacity-100"
              title="移出图库"
              @click.stop="handleRemoveImage(image)"
            >
              ×
            </button>
          </div>
        </div>
      </n-image-group>

      <n-empty v-else description="图库里还没有图片" class="py-16">
        <template #icon>
          <img :src="phoebe" alt="" class="size-[72px] object-contain" />
        </template>
        <template #extra>
          <n-button v-if="canManage" type="primary" @click="pickerShow = true">添加图片</n-button>
          <RouterLink v-else :to="{ name: 'albums' }" class="text-sm text-gray-500 hover:text-gray-800">
            去看看其他图库
          </RouterLink>
        </template>
      </n-empty>

      <AlbumFormModal v-model:show="editShow" :album="album" @saved="handleSaved" />
      <ImagePickerModal v-model:show="pickerShow" :album-id="album.id" @saved="handleSaved" />

      <n-modal v-model:show="reportShow" preset="card" title="举报图库" class="w-[480px]">
        <div class="space-y-4">
          <n-input
            v-model:value="reportReason"
            type="textarea"
            :maxlength="500"
            show-count
            placeholder="请填写举报原因（必填）"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
          <n-input
            v-model:value="reportDetail"
            type="textarea"
            :maxlength="1000"
            show-count
            placeholder="补充说明（选填）"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="reportShow = false">取消</n-button>
            <n-button type="primary" :loading="reportSubmitting" @click="submitReport">提交举报</n-button>
          </div>
        </template>
      </n-modal>
    </div>
  </div>
</template>
