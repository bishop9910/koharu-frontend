<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
      <div class="mb-8 text-center">
        <RouterLink to="/" class="mb-5 inline-flex items-center gap-2">
          <span class="grid size-9 place-items-center rounded-lg bg-gray-900 text-sm font-bold text-white">
            K
          </span>
          <span class="text-lg font-semibold tracking-tight">Koharu</span>
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-800">{{ title }}</h1>
        <p class="mt-2 text-sm text-gray-500">{{ subtitle }}</p>
      </div>

      <slot />

      <div class="mt-8 text-center text-sm text-gray-500">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
