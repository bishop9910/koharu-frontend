<script setup lang="ts">
import { cloneVNode, computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMessage, type ImageRenderToolbarProps } from 'naive-ui'
import { getImages, signImageDownload } from '@/api/image'
import { getErrorMessage } from '@/utils/format'
import { imageThumbnailUrl } from '@/utils/media'
import type { ImageItem } from '@/api/types'
import FeibiQiubi from '@/components/feedback/FeibiQiubi.vue'
import PhoebeLoader from '@/components/feedback/PhoebeLoader.vue'

const view = ref<HTMLDivElement>()
const viewWidth = ref(0)
const viewHeight = ref(0)
const scrollTop = ref(0)
const buffer = 3
const message = useMessage()
const imgWidth = 130
const imgHeight = 130
const gap = 12
const pad = 16

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let resizeObserver: ResizeObserver | null = null
const photos = ref<ImageItem[]>([])

let page = 1
const limit = 90

async function getList() {
  try {
    while (true) {
      const result = await getImages({ page, limit })
      if (result.data.length === 0) break
      photos.value.push(...result.data)
      page++
      await sleep(100)
    }
  } catch (error) {
    message.error(getErrorMessage(error))
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
  const items: { id: string; thumbnailPath: string }[] = []
  for (let i = start; i < end; i++) {
    const photo = photos.value[i]
    if (!photo) break
    items.push({ id: photo.id, thumbnailPath: photo.thumbnailPath })
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
  const imageId = getPreviewId()
  if (!imageId) {
    message.warning('未找到当前预览图片')
    return
  }

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
  }
}

const renderToolbar = ({ nodes }: ImageRenderToolbarProps) => {
  const download = cloneVNode(nodes.download)
  download.props = {
    ...download.props,
    onClick: () => {
      void downloadPreview()
    }
  }
  return [
    nodes.rotateCounterclockwise,
    nodes.rotateClockwise,
    nodes.resizeToOriginalSize,
    nodes.zoomOut,
    nodes.zoomIn,
    download,
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
    class="relative h-[90%] min-h-0 overflow-x-hidden overflow-y-auto rounded border py-1 [contain:layout_paint] [overflow-anchor:none]"
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
        <n-image
          v-for="item in visibleItems"
          :key="item.id"
          alt="加载失败"
          class="rounded-lg p-0.5"
          object-fit="cover"
          :width="imgWidth"
          :height="imgHeight"
          :img-props="{
            style: 'width: 130px; height: 130px; object-fit: cover; display: block; border-radius: 6px;'
          }"
          :src="imageThumbnailUrl(item.id)"
        >
          <template #placeholder>
            <PhoebeLoader :size="126" />
          </template>
          <template #error>
            <n-spin :rotate="false" :size="126">
              <template #icon>
                <FeibiQiubi />
              </template>
            </n-spin>
          </template>
        </n-image>
      </n-image-group>
    </div>
  </div>
</template>
