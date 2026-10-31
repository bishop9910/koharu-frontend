<script setup lang="ts">
import { getApprovedImageList, getDownLink } from '@/api/image';
import { cloneVNode, computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useMessage} from 'naive-ui'
import type { image } from '@/api/types';
import feibiqiubi from '@/view/feibiqiubi.vue'
import phoebeLoader from '@/view/phoebe-loader.vue'
const view = ref<HTMLDivElement>();
const view_w = ref(0);
const view_h = ref(0);
const scrollTop = ref(0);
const buffer:number = 3;
const message = useMessage();
const img_w = 130;
const img_h = 130;
const gap = 12;
const pad = 16;
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'; 
const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));
let ro: ResizeObserver | null = null;
const photos = ref<image[]>([]);
// const photos = Array.from({ length: 10000 }, (_, i) => ({
//   id: i,
//   url: `https://picsum.photos/seed/${i}/240/240`,
// }))

let page = 1;
const limit = 90;
async function getList(){
  try{
    while(1){
      const temp = await getApprovedImageList({page, limit});
      if(temp.data.length == 0)break;
      photos.value.push(...temp.data);
      page++;
      await sleep(100);
    }
  }catch(error){
    message.error(`[Error]: ${error}`);
  }
}

const rowHeight = img_h + gap;
const colsWidth = img_w + gap;

const cols = computed<number>(()=>{
  const avail = view_w.value - pad * 2;
  if (avail <= 0) return 1;
  return Math.max(1, Math.floor((avail + gap) / colsWidth))
})

const rows = computed(()=>{
  return Math.ceil(photos.value.length / cols.value)
})

// const renderToolbar = ({nodes}:any)=>{
//   const originNext = nodes.next.props.onClick;

//   const next = cloneVNode(nodes.next)
//   next.props={
//     ...next.props,
//     onClick:(e:any)=>{
//       console.log(activeIndex.value)
//       if(originNext){
//         originNext(e)
//       }
//     }
//   }
//   return[nodes.prev, next, nodes.rotateCounterclockwise, nodes.rotateClockwise, nodes.resizeToOriginalSize, nodes.zoomOut, nodes.zoomIn, nodes.download, nodes.close]
// }

const activeIndex =ref(0);

const totalHeight = computed(()=>{
  if (rows.value <= 0) return 0;
  return rows.value * rowHeight - gap
})

const range = computed(()=>{
  const firstRow = Math.max(0,Math.floor(scrollTop.value / rowHeight));
  const lastRow  = Math.max(0,Math.floor((scrollTop.value + view_h.value)/rowHeight));
  const startrow = Math.max(0, firstRow - buffer);
  const endrow = Math.min(Math.max(0, rows.value -1) , lastRow + buffer);
  const start = Math.min(photos.value.length, Math.max(0, startrow * cols.value));
  const end = Math.min(photos.value.length, Math.max(start, (endrow + 1) * cols.value));
  return {start, end, offset: startrow * rowHeight}
})
const visibleItems = computed(()=>{
  const {start, end} = range.value;
  const item: { index: string; url: string }[] = [];
  for(let i = start; i < end; i++){
    const photo = photos.value[i];
    if (!photo) break;
    item.push({ index: photo.id, url: photo.thumbnailPath})
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

function getPreviewSrc(){
  const el = document.querySelector<HTMLImageElement>('.n-image-preview-container img.n-image-preview')
  return el?.getAttribute('src') ?? ''
}

function getPreviewId(){
  return getPreviewSrc().match(/\/images\/([^/?#]+)\//)?.[1] 
}

async function downLoad(){
  const src = await getDownLink(getPreviewId()??'')
  const link = document.createElement('a')
  link.href = src.downloadUrl
  link.download = 'koharu'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


const renderToolbar = ({nodes}:any)=>{
  const download = cloneVNode(nodes.download)
  download.props={
    ...download.props,
    onClick: ()=>{
      downLoad()
    }
  }
  return[nodes.rotateCounterclockwise, nodes.rotateClockwise, nodes.resizeToOriginalSize, nodes.zoomOut, nodes.zoomIn, download, nodes.close]
}

onMounted(()=>{
  getList();
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
    class="overflow-y-auto overflow-x-hidden [contain:layout_paint] [overflow-anchor:none]  min-h-0 relative border rounded h-[90%] py-1"
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
        :render-toolbar="renderToolbar"
      >
        <n-image
          alt="加载失败"
          class="p-0.5 rounded-1g"
          v-for="item in visibleItems"
          :key="item.index"
          object-fit = 'cover'
          :width="130"
          :height="130"
          :img-props="{
            style: 'width: 130px; height: 130px; object-fit: cover; display: block; border-radius: 6px;'
          }"
          :src="`${BASE_URL}/images/${item.index}/thumbnail`"
        >
          <template #placeholder>
            <phoebe-loader :size="126" />
          </template>
          <template #error>
            <n-spin
              :rotate="false"
              :size="126"
            >
              <template #icon>
                <feibiqiubi />
              </template>
            </n-spin>
          </template>
        </n-image>
      </n-image-group>
    </div>

  </div>
</template>