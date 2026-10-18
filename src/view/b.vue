<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const view = ref<HTMLDivElement>();
const view_w = ref(0);
const view_h = ref(0);
const scrollTop = ref(0);
const buffer:number = 3;

const img_w = 120;
const img_h = 120;
const gap = 12;
const pad = 16;

let ro: ResizeObserver | null = null;
const photos = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  url: `https://picsum.photos/seed/${i}/240/240`,
}))

const rowHeight = img_h + gap;
const colsWidth = img_w + gap;

const cols = computed<number>(()=>{
  const avail = view_w.value - pad * 2;
  if (avail <= 0) return 1;
  return Math.max(1, Math.floor((avail + gap) / colsWidth))
})

const rows = computed(()=>{
  return Math.ceil(photos.length / cols.value)
})

const totalHeight = computed(()=>{
  if (rows.value <= 0) return 0;
  return rows.value * rowHeight - gap
})

const range = computed(()=>{
  const firstRow = Math.max(0,Math.floor(scrollTop.value / rowHeight));
  const lastRow  = Math.max(0,Math.floor((scrollTop.value + view_h.value)/rowHeight));
  const startrow = Math.max(0, firstRow - buffer);
  const endrow = Math.min(Math.max(0, rows.value -1) , lastRow + buffer);
  const start = Math.min(photos.length, Math.max(0, startrow * cols.value));
  const end = Math.min(photos.length, Math.max(start, (endrow + 1) * cols.value));
  return {start, end, offset: startrow * rowHeight}
})
const visibleItems = computed(()=>{
  const {start, end} = range.value;
  const item: { index: number; url: string }[] = [];
  for(let i = start; i < end; i++){
    const photo = photos[i];
    if (!photo) break;
    item.push({ index: i, url: photo.url})
  }
  return item;
})

let padding = false;
function onScroll(){
  if(padding)return
  padding = true;
  requestAnimationFrame(()=>{
    if (view.value) scrollTop.value = view.value.scrollTop;
    padding = false;
  })
}
onMounted(()=>{
  const el = view.value;
  if (!el) return;
  view_w.value = el.clientWidth;
  view_h.value = el.clientHeight;
  ro = new ResizeObserver(() => {
    view_w.value = el.clientWidth;
    view_h.value = el.clientHeight;
  })
  ro.observe(el);
})

onBeforeUnmount(()=>{
  if (ro) ro.disconnect();
})





</script>

<template>
  <div 
    ref="view" 
    class="overflow-y-auto overflow-x-hidden [contain:layout_paint] [overflow-anchor:none]  min-h-0 relative border h-[90%]"
    @scroll.passive="onScroll"
  >
    <div
      class="w-px pointer-events-none" 
      :style="{ height: totalHeight + 'px' }"
    ></div>
    <div
    class="grid justify-center [will-change:transform] absolute gap-[12px]"
    :style="{
      transform: `translate3d(0, ${range.offset}px, 0)`,
      gridTemplateColumns: `repeat(${cols}, ${img_w}px)`,
      top: 0, left: 0,right: 0
    }"
    >
      <n-image-group
      >
        <n-image
          v-for="item in visibleItems"
          :key="item.index"
          object-fit = 'cover'
          width="120px"
          height="120px"
          :src=item.url
        />
      </n-image-group>
    </div>

  </div>
</template>