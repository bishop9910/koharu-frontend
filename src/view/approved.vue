<script setup lang="ts">
import { deleteImage, downImage, editImage, getApprovedImageList, getDownLink, getUploadImageList, uploadImage } from '@/api/image';
import { cloneVNode, computed, h, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { NIcon, NUpload, useMessage, type UploadCustomRequestOptions} from 'naive-ui'
import type { image} from '@/api/types';
import { piniaTokenProvider } from '@/utils/token-provider';
import EditSvg from '@/icon/Edit.svg?raw'
import DeleteSvg from '@/icon/Delete.svg?raw'

const downloadLoad = ref(false)
const editLoad = ref(false)
const deleteLoad = ref(false)
const EditSvgThin = EditSvg.replace('stroke-width="2"', 'stroke-width="1.4"')
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


let page = 1;
const limit = 90;
const status = 'approved';
async function getList(){
  try{
    while(1){
      const temp = await getUploadImageList({page, limit,status});
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

async function downLoad() {
    const src = await getDownLink(getPreviewId()??'')
    const link = document.createElement('a')
    link.href = src.downloadUrl
    link.download = 'koharu'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

}

async function handleEdit(option:UploadCustomRequestOptions){
    const {file, onFinish, onError} = option;
    const id = getPreviewId();
    if(!id){
      message.error('没有找到当前预览的图片');
      onError();
      return;
    }
    const formdata = new FormData();
    formdata.append('file', file.file!);
    try{
      await editImage(id, formdata);
      onFinish();
      message.success('替换成功');
      setTimeout(() => window.location.reload(), 300);
    }catch(err){
      onError();
      message.error(`Error: ${err}`);
    }
}

const uploadRef = ref<InstanceType<typeof NUpload> | null>(null);

async function deleteimg() {
  const id = getPreviewId()
  if(!id){
    message.error(`Error未找到图片`)
    return
  }
  
  if(deleteLoad.value){
    message.error('操作过于频繁，请稍后重试')
    return
  }
  try{
    await deleteImage(id!)
    message.success('删除成功')
    deleteLoad.value = false
    setTimeout(() => {window.location.reload()}, 300);
  }catch(err){
    message.error(`Error${err}`)
    deleteLoad.value = false
  }
}
const renderToolbar = ({nodes}:any) =>{
  const download = cloneVNode(nodes.download)
  download.props = {
    ...download.props,
    onClick: ()=>{
      try{
        if(downloadLoad.value){
        message.error('操作过于频繁，请稍后重试')
        return
        }
        downloadLoad.value = true
        downLoad()
        downloadLoad.value = false
      }catch(err){
        message.error(`Error${err}`)
        downloadLoad.value = false
      }
    }
  }

  const edit = h(
    NUpload,
    {
      ref: uploadRef,
      abstract: true,          
      accept: 'image/*',
      showFileList: false,
      customRequest: handleEdit,
    },
    {
      default: () => h(NIcon, {
        class: 'n-base-icon',  
        innerHTML: EditSvgThin,    
        title: '替换图片',
        onClick: () => uploadRef.value?.openOpenFileDialog()
      })
    }
  )

  const deleteImgBth = h(NIcon,{
    class: 'n-base-icon',
    innerHTML: DeleteSvg,
    onClick: deleteimg

  })

  return[nodes.rotateCounterclockwise, nodes.rotateClockwise, nodes.resizeToOriginalSize, nodes.zoomOut, nodes.zoomIn, download, edit, deleteImgBth,nodes.close]
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
    class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [contain:layout_paint] [overflow-anchor:none] relative border rounded py-1"
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
          :src="`${BASE_URL}/images/${item.index}/thumbnail?access_token=${piniaTokenProvider.getAccess()}`"
        />
      </n-image-group>
    </div>

  </div>
</template>