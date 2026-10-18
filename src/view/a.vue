<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'

/* ===== 写死的配置 ===== */
const ITEM_W = 120
const ITEM_H = 120
const GAP = 12
const PAD = 16
const BUFFER_ROWS = 2

/* ===== 数据 ===== */
const photos = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  url: `https://picsum.photos/seed/${i}/240/240`,
}))

/* ===== 状态 ===== */
const viewport = useTemplateRef<HTMLDivElement>('viewport')
const scrollTop = ref(0)
const viewW = ref(0)
const viewH = ref(0)

/* ===== 一行几列 ===== */
const cols = computed(() => {
  const avail = viewW.value - PAD * 2
  if (avail <= 0) return 1
  return Math.max(1, Math.floor((avail + GAP) / (ITEM_W + GAP)))
})

const rowHeight = ITEM_H + GAP
const rows = computed(() => Math.ceil(photos.length / cols.value))
const totalHeight = computed(() =>
  rows.value === 0 ? 0 : PAD * 2 + rows.value * rowHeight - GAP
)

/* ===== 核心：scrollTop → 渲染区间 ===== */
const range = computed(() => {
  const firstRow = Math.max(0, Math.floor((scrollTop.value - PAD) / rowHeight))
  const lastRow  = Math.max(0, Math.floor((scrollTop.value + viewH.value - PAD) / rowHeight))

  const startRow = Math.max(0, firstRow - BUFFER_ROWS)
  const endRow   = Math.min(rows.value - 1, lastRow + BUFFER_ROWS)

  const start = Math.max(0, startRow * cols.value)
  const end   = Math.min(photos.length, (endRow + 1) * cols.value)

  return { start, end, offsetY: startRow * rowHeight }
})

const visibleItems = computed(() => {
  const { start, end } = range.value
  const out: { index: number; url: string }[] = []
  for (let i = start; i < end; i++) {
    const photo = photos[i]
    if (!photo) break
    out.push({ index: i, url: photo.url })
  }
  return out
})

/* ===== 滚动节流 ===== */
let pending = false
function onScroll() {
  if (pending) return
  pending = true
  requestAnimationFrame(() => {
    pending = false
    if (viewport.value) scrollTop.value = viewport.value.scrollTop
  })
}

/* ===== 初始化尺寸 ===== */
let ro: ResizeObserver | null = null

onMounted(() => {
  const el = viewport.value
  if (!el) return
  viewW.value = el.clientWidth
  viewH.value = el.clientHeight
  ro = new ResizeObserver(() => {
    viewW.value = el.clientWidth
    viewH.value = el.clientHeight
  })
  ro.observe(el)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})


</script>

<template>
  <div class="bar">
    共 <b>{{ photos.length }}</b> 张图 · 当前真实 DOM 卡片 <b>{{ visibleItems.length }}</b> 个
  </div>

  <div ref="viewport" class="viewport" @scroll.passive="onScroll">
    <!-- 幽灵：撑滚动条 -->
    <div class="phantom" :style="{ height: totalHeight + 'px' }"></div>

    <!-- 可见内容 -->
    <div class="content" :style="{
      gridTemplateColumns: `repeat(${cols}, ${ITEM_W}px)`,
      columnGap: `${GAP}px`,
      rowGap: `${GAP}px`,
      padding: `${PAD}px`,
      transform: `translate3d(0, ${range.offsetY}px, 0)`,
    }">
      <div
        v-for="it in visibleItems"
        :key="it.index"
        class="cell"
        :style="{ height: `${ITEM_H}px` }"
      >
        <img :src="it.url" loading="lazy" decoding="async" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewport {
  position: relative;
  max-height: 80%;
  margin: 0 auto;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  background: #fff;
  contain: layout paint;    /* 隔离布局绘制 */
  overflow-anchor: none;    /* 关掉滚动锚定 */
}
.phantom { width: 1px; pointer-events: none; }
.content {
  position: absolute; top: 0; left: 0; right: 0;
  display: grid;
  justify-content: center;
  will-change: transform;
}
.cell {
  border-radius: 8px;
  overflow: hidden;
  background: #eef0f2;
}
.cell img { display: block; width: 100%; height: 100%; object-fit: cover; }
</style>