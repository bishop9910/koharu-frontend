<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import phoebe from '@/assets/phoebe.png'
import { createTag, deleteTag, getTags } from '@/api/tags'
import type { Tag } from '@/api/types'
import { hasRole, Role } from '@/enums/role'
import { useUserStore } from '@/stores/user'
import { getErrorMessage } from '@/utils/format'

const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

const tags = ref<Tag[]>([])
const name = ref('')
const loading = ref(false)
const saving = ref(false)

const canCreate = computed(() => hasRole(userStore.role, Role.MODERATOR))
const canDelete = computed(() => hasRole(userStore.role, Role.ADMIN))

async function loadTags() {
  loading.value = true
  try {
    tags.value = await getTags()
  } catch (error) {
    message.error(getErrorMessage(error, '加载标签失败'))
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  const value = name.value.trim()
  if (!value || saving.value) return

  saving.value = true
  try {
    const tag = await createTag(value)
    tags.value = [...tags.value, tag].sort((a, b) => a.name.localeCompare(b.name))
    name.value = ''
    message.success('标签已创建')
  } catch (error) {
    message.error(getErrorMessage(error, '创建标签失败'))
  } finally {
    saving.value = false
  }
}

function handleDelete(tag: Tag) {
  dialog.warning({
    title: '删除标签',
    content: `确定删除“${tag.name}”吗？图库上的该标签也会移除。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteTag(tag.id)
        tags.value = tags.value.filter((item) => item.id !== tag.id)
        message.success('标签已删除')
      } catch (error) {
        message.error(getErrorMessage(error, '删除标签失败'))
      }
    }
  })
}

onMounted(() => {
  void loadTags()
})
</script>

<template>
  <section>
    <div class="mb-4">
      <h3 class="text-base font-semibold">标签管理</h3>
      <p class="mt-1 text-sm text-gray-500">
        审核员及以上可以创建标签，管理员可以删除标签。
      </p>
    </div>

    <div v-if="canCreate" class="mb-4 flex flex-wrap gap-2">
      <n-input
        v-model:value="name"
        class="max-w-xs"
        :maxlength="30"
        placeholder="新标签名称"
        @keyup.enter="handleCreate"
      />
      <n-button type="primary" :loading="saving" :disabled="!name.trim()" @click="handleCreate">
        创建标签
      </n-button>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <n-spin />
    </div>

    <div v-else-if="tags.length" class="flex flex-wrap gap-2">
      <n-tag v-for="tag in tags" :key="tag.id" :bordered="false" size="medium">
        {{ tag.name }}
        <button
          v-if="canDelete"
          type="button"
          class="ml-2 text-gray-400 transition hover:text-red-500"
          @click="handleDelete(tag)"
        >
          ×
        </button>
      </n-tag>
    </div>

    <n-empty v-else description="暂无标签" class="py-8">
      <template #icon>
        <img :src="phoebe" alt="" class="size-14 object-contain" />
      </template>
    </n-empty>
  </section>
</template>
