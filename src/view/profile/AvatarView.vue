<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import type { UploadCustomRequestOptions } from 'naive-ui/es/upload'
import { deleteAvatar, getPendingAvatars, reviewAvatar, uploadAvatar } from '@/api/avatars'
import type { PendingAvatar } from '@/api/types'
import { AvatarStatus } from '@/enums/status'
import { Role, hasRole } from '@/enums/role'
import { useUserStore } from '@/stores/user'
import { avatarImageUrl, withAccessToken } from '@/utils/media'
import { formatDateTime, getErrorMessage } from '@/utils/format'

const message = useMessage()
const userStore = useUserStore()

const avatarBusy = ref(false)
const avatarFailed = ref(false)
const pendingAvatarVisible = ref(true)
const pendingAvatarKey = ref(0)

const isModerator = computed(() => hasRole(userStore.role, Role.MODERATOR))
const currentAvatarSrc = computed(() =>
  userStore.userId ? withAccessToken(avatarImageUrl(userStore.userId)) : ''
)
const pendingAvatarSrc = computed(() => {
  if (!userStore.userId) return ''
  const url = withAccessToken(avatarImageUrl(userStore.userId, true))
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${pendingAvatarKey.value}`
})

const pendingList = ref<PendingAvatar[]>([])
const pendingLoading = ref(false)
const reviewingId = ref<string | null>(null)

const rejectVisible = ref(false)
const rejectTarget = ref<PendingAvatar | null>(null)
const rejectReason = ref('')

async function loadPendingAvatars() {
  if (!isModerator.value) return
  pendingLoading.value = true
  try {
    const result = await getPendingAvatars({ page: 1, limit: 30 })
    pendingList.value = result.data
  } catch (error) {
    message.error(getErrorMessage(error, '加载待审头像失败'))
  } finally {
    pendingLoading.value = false
  }
}

async function handleUpload(options: UploadCustomRequestOptions) {
  const { file, onFinish, onError } = options
  if (!userStore.userId || !file.file) {
    onError?.()
    return
  }

  avatarBusy.value = true
  try {
    await uploadAvatar(userStore.userId, file.file)
    message.success('头像已提交，审核通过后生效')
    pendingAvatarVisible.value = true
    pendingAvatarKey.value++
    onFinish()
  } catch (error) {
    message.error(getErrorMessage(error, '头像上传失败'))
    onError()
  } finally {
    avatarBusy.value = false
  }
}

async function handleDelete() {
  if (!userStore.userId || avatarBusy.value) return
  avatarBusy.value = true
  try {
    await deleteAvatar(userStore.userId)
    message.success('头像已删除')
    avatarFailed.value = false
    pendingAvatarVisible.value = false
  } catch (error) {
    message.error(getErrorMessage(error, '删除头像失败'))
  } finally {
    avatarBusy.value = false
  }
}

async function approve(item: PendingAvatar) {
  if (reviewingId.value) return
  reviewingId.value = item.userId
  try {
    await reviewAvatar(item.userId, { status: AvatarStatus.APPROVED })
    pendingList.value = pendingList.value.filter((entry) => entry.userId !== item.userId)
    message.success(`已通过 ${item.username} 的头像`)
  } catch (error) {
    message.error(getErrorMessage(error, '审核失败'))
  } finally {
    reviewingId.value = null
  }
}

function openReject(item: PendingAvatar) {
  rejectTarget.value = item
  rejectReason.value = ''
  rejectVisible.value = true
}

async function submitReject() {
  if (!rejectTarget.value || reviewingId.value) return
  const target = rejectTarget.value
  reviewingId.value = target.userId
  try {
    await reviewAvatar(target.userId, {
      status: AvatarStatus.REJECTED,
      reason: rejectReason.value.trim() || undefined
    })
    pendingList.value = pendingList.value.filter((entry) => entry.userId !== target.userId)
    rejectVisible.value = false
    message.success(`已拒绝 ${target.username} 的头像`)
  } catch (error) {
    message.error(getErrorMessage(error, '审核失败'))
  } finally {
    reviewingId.value = null
  }
}

function pendingImage(item: PendingAvatar) {
  const url = item.imageUrl || avatarImageUrl(item.userId, true)
  return withAccessToken(url)
}

onMounted(() => {
  void loadPendingAvatars()
})
</script>

<template>
  <div class="max-w-4xl">
    <div class="mb-6">
      <h2 class="text-xl font-semibold">我的头像</h2>
      <p class="mt-1 text-sm text-gray-500">头像提交后需要审核，审核通过才会对外展示。</p>
    </div>

    <section class="mb-8 flex flex-col gap-5 rounded-xl border p-5 sm:flex-row sm:items-center">
      <div class="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-gray-100">
        <img
          v-if="currentAvatarSrc && !avatarFailed"
          :src="currentAvatarSrc"
          alt=""
          class="size-full object-cover"
          @error="avatarFailed = true"
        />
        <span v-else class="text-2xl font-medium text-gray-400">
          {{ userStore.username.slice(0, 1).toUpperCase() || '?' }}
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium">当前头像</p>
        <p class="mt-1 text-sm text-gray-500">支持 JPG、PNG、WebP，建议使用正方形图片。</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <n-upload
            accept="image/*"
            :show-file-list="false"
            :custom-request="handleUpload"
            :disabled="avatarBusy"
          >
            <n-button size="small" :loading="avatarBusy">上传新头像</n-button>
          </n-upload>
          <n-button size="small" quaternary type="error" :disabled="avatarBusy" @click="handleDelete">
            删除头像
          </n-button>
        </div>
      </div>

      <div v-if="pendingAvatarSrc && pendingAvatarVisible" class="shrink-0 text-center">
        <img
          :src="pendingAvatarSrc"
          alt="待审头像"
          class="size-20 rounded-full border object-cover"
          @error="pendingAvatarVisible = false"
        />
        <p class="mt-2 text-xs text-gray-500">待审头像</p>
      </div>
    </section>

    <section v-if="isModerator">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold">待审头像</h3>
          <p class="mt-1 text-sm text-gray-500">审核员及以上角色可以处理头像投稿。</p>
        </div>
        <n-button size="small" quaternary :loading="pendingLoading" @click="loadPendingAvatars">
          刷新
        </n-button>
      </div>

      <n-spin :show="pendingLoading">
        <n-empty v-if="!pendingList.length" description="暂无待审头像" class="py-10">
          <template #icon>
            <img :src="phoebe" alt="" class="size-16 object-contain" />
          </template>
        </n-empty>

        <ul v-else class="divide-y rounded-xl border">
          <li
            v-for="item in pendingList"
            :key="item.submissionId"
            class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <img
              :src="pendingImage(item)"
              alt=""
              class="size-16 rounded-full border object-cover"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ item.username }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ formatDateTime(item.createdAt) }}</p>
            </div>
            <div class="flex gap-2">
              <n-button
                size="small"
                type="primary"
                :loading="reviewingId === item.userId"
                @click="approve(item)"
              >
                通过
              </n-button>
              <n-button size="small" type="error" quaternary @click="openReject(item)">
                拒绝
              </n-button>
            </div>
          </li>
        </ul>
      </n-spin>
    </section>

    <n-modal v-model:show="rejectVisible" preset="card" title="拒绝头像" class="max-w-md">
      <p class="mb-3 text-sm text-gray-500">
        拒绝 {{ rejectTarget?.username }} 的头像投稿，可填写原因。
      </p>
      <n-input
        v-model:value="rejectReason"
        type="textarea"
        :maxlength="200"
        :autosize="{ minRows: 3, maxRows: 5 }"
        placeholder="拒绝原因（可选）"
      />
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button quaternary @click="rejectVisible = false">取消</n-button>
          <n-button type="error" :loading="reviewingId !== null" @click="submitReject">
            确认拒绝
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
