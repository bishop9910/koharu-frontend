<script setup lang="ts">
import { computed } from 'vue'
import AlbumManager from '@/components/album/AlbumManager.vue'
import ImageUploadPanel from '@/components/studio/ImageUploadPanel.vue'
import TagManager from '@/components/studio/TagManager.vue'
import { hasRole, Role } from '@/enums/role'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const canManageTags = computed(() => hasRole(userStore.role, Role.MODERATOR))
</script>

<template>
  <div class="h-full max-w-4xl overflow-y-auto">
    <div class="mb-8">
      <h2 class="text-xl font-semibold">创作中心</h2>
      <p class="mt-1 text-sm text-gray-500">
        上传图片、创建和管理图库，审核员及以上还可以维护标签。
      </p>
    </div>

    <div class="space-y-10">
      <ImageUploadPanel />

      <div class="border-t pt-8">
        <AlbumManager />
      </div>

      <div v-if="canManageTags" class="border-t pt-8">
        <TagManager />
      </div>
    </div>
  </div>
</template>
