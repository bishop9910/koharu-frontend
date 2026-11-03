<script setup lang="ts">
import { cloneVNode, computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  NIcon,
  NUpload,
  useMessage,
  type ImageRenderToolbarProps,
  type UploadCustomRequestOptions
} from 'naive-ui'
import { deleteImage, getMyImages, modifyImage, signImageDownload } from '@/api/image'
import type { MyImageListItem } from '@/api/types'
import { ImageStatus } from '@/enums/status'
import { imageThumbnailUrl, withAccessToken } from '@/utils/media'
import { getErrorMessage } from '@/utils/format'
import PhoebeLoader from '@/components/feedback/PhoebeLoader.vue'
import phoebe from '@/assets/phoebe.png'
import EditSvg from '@/icon/Edit.svg?raw'
import DeleteSvg from '@/icon/Delete.svg?raw'

const message = useMessage()
const view = ref<HTMLDivElement>()
const viewWidth = ref(0)
const viewHeight = ref(0)
const scrollTop = ref(0)
const buffer = 3
const imgWidth = 130
const imgHeight = 130
const gap = 12
const pad = 16

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let resizeObserver: ResizeObserver | null = null
const photos = ref<MyImageListItem[]>([])
const loading = ref(true)
const downloadLoad = ref(false)
const deleteLoad = ref(false)

let page = 1
const limit = 90
const status = ImageStatus.REJECTED

async function getList() {
  try {
    while (true) {
      const result = await getMyImages({ page, limit, status })
      if (result.data.length === 0) break
      photos.value.push(...result.data)
      page++
      await sleep(100)
    }
  } catch (error) {
    message.error(getErrorMessage(error, '加载投稿失败'))
  } finally {
    loading.value = false
  }
}

const rowHeight = imgHeight + gap
const columnWidth = imgWidth + gap

const cols = computed<number>(() => {
  const available = viewWidth.value - pad * 2
  if (available <= 0) return 1
  return Math.max(1, Math.floor((available + gap) / columnWidth))
})

const rows = computed(() => Math.ceil(photos.value.length / cols.value))

const totalHeight = computed(() => {
  if (rows.value <= 0) return 0
  return rows.value * rowHeight - gap
})

const range = computed(() => {
  const firstRow = Math.max(0, Math.floor(scrollTop.value / rowHeight))
  const lastRow = Math.max(0, Math.floor((scrollTop.value + viewHeight.value) / rowHeight))
  const startRow = Math.max(0, firstRow - buffer)
  const endRow = Math.min(Math.max(0, rows.value - 1), lastRow + buffer)
  const start = Math.min(photos.value.length, Math.max(0, startRow * cols.value))
  const end = Math.min(photos.value.length, Math.max(start, (endRow + 1) * cols.value))
  return { start, end, offset: startRow * rowHeight }
})

const visibleItems = computed(() => {
  const { start, end } = range.value
  const items: { id: string; rejectReason: string }[] = []
  for (let i = start; i < end; i++) {
    const photo = photos.value[i]
    if (!photo) break
    items.push({
      id: photo.id,
      rejectReason: photo.rejectReason ?? '未填写拒绝原因'
    })
  }
  return items
})

let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    if (view.value) scrollTop.value = view.value.scrollTop
    ticking = false
  })
}

function getPreviewSource() {
  const element = document.querySelector<HTMLImageElement>(
    '.n-image-preview-container img.n-image-preview'
  )
  return element?.getAttribute('src') ?? ''
}

function getPreviewId() {
  return getPreviewSource().match(/\/images\/([^/?#]+)\//)?.[1]
}

async function downloadPreview() {
  if (downloadLoad.value) return
  const imageId = getPreviewId()
  if (!imageId) {
    message.warning('未找到当前预览图片')
    return
  }

  downloadLoad.value = true
  try {
    const { downloadUrl } = await signImageDownload(imageId)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'koharu'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    message.error(getErrorMessage(error, '获取下载链接失败'))
  } finally {
    downloadLoad.value = false
  }
}

async function handleEdit(options: UploadCustomRequestOptions) {
  const { file, onFinish, onError } = options
  const imageId = getPreviewId()
  if (!imageId) {
    message.warning('未找到当前预览图片')
    onError()
    return
  }
  if (!file.file) {
    onError()
    return
  }

  const formData = new FormData()
  formData.append('file', file.file)

  try {
    await modifyImage(imageId, formData)
    onFinish()
    message.success('替换成功')
    setTimeout(() => window.location.reload(), 300)
  } catch (error) {
    onError()
    message.error(getErrorMessage(error, '替换失败'))
  }
}

async function handleDelete() {
  if (deleteLoad.value) return
  const imageId = getPreviewId()
  if (!imageId) {
    message.warning('未找到当前预览图片')
    return
  }

  deleteLoad.value = true
  try {
    await deleteImage(imageId)
    message.success('删除成功')
    setTimeout(() => window.location.reload(), 300)
  } catch (error) {
    message.error(getErrorMessage(error, '删除失败'))
  } finally {
    deleteLoad.value = false
  }
}

const uploadRef = ref<InstanceType<typeof NUpload> | null>(null)
const editIcon = EditSvg.replace('stroke-width="2"', 'stroke-width="1.4"')

const renderToolbar = ({ nodes }: ImageRenderToolbarProps) => {
  const download = cloneVNode(nodes.download)
  download.props = {
    ...download.props,
    onClick: () => {
      void downloadPreview()
    }
  }

  const edit = h(
    NUpload,
    {
      ref: uploadRef,
      abstract: true,
      accept: 'image/*',
      showFileList: false,
      customRequest: handleEdit
    },
    {
      default: () =>
        h(NIcon, {
          class: 'n-base-icon',
          innerHTML: editIcon,
          title: '替换图片',
          onClick: () => uploadRef.value?.openOpenFileDialog()
        })
    }
  )

  const remove = h(NIcon, {
    class: 'n-base-icon',
    innerHTML: DeleteSvg,
    title: '删除图片',
    onClick: () => {
      void handleDelete()
    }
  })

  return [
    nodes.rotateCounterclockwise,
    nodes.rotateClockwise,
    nodes.resizeToOriginalSize,
    nodes.zoomOut,
    nodes.zoomIn,
    download,
    edit,
    remove,
    nodes.close
  ]
}

onMounted(() => {
  void getList()
  const element = view.value
  if (!element) return
  viewWidth.value = element.clientWidth
  viewHeight.value = element.clientHeight
  resizeObserver = new ResizeObserver(() => {
    viewWidth.value = element.clientWidth
    viewHeight.value = element.clientHeight
  })
  resizeObserver.observe(element)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="view"
    class="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto rounded border py-1 [contain:layout_paint] [overflow-anchor:none]"
    @scroll.passive="onScroll"
  >
    <div class="pointer-events-none w-px" :style="{ height: totalHeight + 'px' }"></div>
    <div
      class="absolute top-0 right-0 left-0 grid justify-center gap-[12px] [will-change:transform]"
      :style="{
        transform: `translate3d(0, ${range.offset}px, 0)`,
        gridTemplateColumns: `repeat(${cols}, ${imgWidth}px)`
      }"
    >
      <n-image-group :render-toolbar="renderToolbar">
        <n-tooltip v-for="item in visibleItems" :key="item.id" trigger="hover">
          <template #trigger>
            <n-image
              alt="加载失败"
              class="rounded-lg p-0.5"
              object-fit="cover"
              :width="imgWidth"
              :height="imgHeight"
              :img-props="{
                style: 'width: 130px; height: 130px; object-fit: cover; display: block; border-radius: 6px;'
              }"
              :src="withAccessToken(imageThumbnailUrl(item.id))"
            >
              <template #placeholder>
                <PhoebeLoader :size="126" />
              </template>
              <template #error>
                <PhoebeLoader :size="96" still />
              </template>
            </n-image>
          </template>
          {{ item.rejectReason || '未填写拒绝原因' }}
        </n-tooltip>
      </n-image-group>
    </div>

    <div
      v-if="!loading && photos.length === 0"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white"
    >
      <n-empty description="暂无未通过投稿" class="py-10">
        <template #icon>
          <img :src="phoebe" alt="" class="size-[72px] object-contain" />
        </template>
        <template #extra>
          <RouterLink :to="{ name: 'studio' }">
            <n-button text type="primary">去上传图片</n-button>
          </RouterLink>
        </template>
      </n-empty>
    </div>
  </div>
</template>
