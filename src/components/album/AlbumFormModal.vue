<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { createAlbum, updateAlbum } from '@/api/albums'
import { getTags } from '@/api/tags'
import type { AlbumDetail, AlbumSummary, AlbumTag, AlbumVisibility } from '@/api/types'
import { getErrorMessage } from '@/utils/format'

type EditableAlbum = Pick<AlbumSummary, 'id' | 'title' | 'description' | 'visibility' | 'tags'>

const props = defineProps<{
  show: boolean
  album?: EditableAlbum | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: [album: AlbumDetail]
}>()

const message = useMessage()
const title = ref('')
const description = ref('')
const visibility = ref<AlbumVisibility>('public')
const selectedTags = ref<string[]>([])
const tags = ref<AlbumTag[]>([])
const saving = ref(false)

const isEdit = computed(() => Boolean(props.album?.id))
const isPrivate = computed({
  get: () => visibility.value === 'private',
  set: (value: boolean) => {
    visibility.value = value ? 'private' : 'public'
  }
})

async function loadTags() {
  try {
    tags.value = await getTags()
  } catch {
    tags.value = []
  }
}

function resetForm() {
  title.value = props.album?.title ?? ''
  description.value = props.album?.description ?? ''
  visibility.value = props.album?.visibility ?? 'public'
  selectedTags.value = props.album?.tags.map((tag) => tag.name) ?? []
}

function toggleTag(name: string) {
  selectedTags.value = selectedTags.value.includes(name)
    ? selectedTags.value.filter((item) => item !== name)
    : [...selectedTags.value, name]
}

function close() {
  emit('update:show', false)
}

function handleShowChange(value: boolean) {
  emit('update:show', value)
}

async function submit() {
  const albumTitle = title.value.trim()
  if (!albumTitle) {
    message.warning('请输入图库名称')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: albumTitle,
      description: description.value.trim() || undefined,
      visibility: visibility.value,
      tags: selectedTags.value
    }
    const result = isEdit.value && props.album
      ? await updateAlbum(props.album.id, payload)
      : await createAlbum(payload)

    message.success(isEdit.value ? '图库已更新' : '图库已创建')
    emit('saved', result)
    close()
  } catch (error) {
    message.error(getErrorMessage(error, '保存图库失败'))
  } finally {
    saving.value = false
  }
}

watch(
  () => props.show,
  async (show) => {
    if (!show) return
    resetForm()
    await loadTags()
  }
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="isEdit ? '编辑图库' : '创建图库'"
    style="width: 560px; max-width: calc(100vw - 32px)"
    @update:show="handleShowChange"
  >
    <n-form label-placement="top">
      <n-form-item label="名称">
        <n-input v-model:value="title" :maxlength="80" placeholder="给图库起个名字" />
      </n-form-item>

      <n-form-item label="简介">
        <n-input
          v-model:value="description"
          type="textarea"
          :maxlength="500"
          :autosize="{ minRows: 3, maxRows: 5 }"
          placeholder="这个图库收些什么？"
        />
      </n-form-item>

      <n-form-item label="标签">
        <div v-if="tags.length" class="flex flex-wrap gap-2">
          <button
            v-for="tag in tags"
            :key="tag.id"
            type="button"
            class="rounded-full border px-3 py-1 text-xs transition"
            :class="
              selectedTags.includes(tag.name)
                ? 'border-sky-500 bg-sky-50 text-sky-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            "
            @click="toggleTag(tag.name)"
          >
            {{ tag.name }}
          </button>
        </div>
        <span v-else class="text-xs text-gray-400">暂无可用标签</span>
      </n-form-item>

      <n-checkbox v-model:checked="isPrivate">私有图库（仅自己和审核员可见）</n-checkbox>
    </n-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <n-button quaternary @click="close">取消</n-button>
        <n-button type="primary" :loading="saving" @click="submit">
          {{ isEdit ? '保存' : '创建' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>
