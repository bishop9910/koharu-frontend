<script setup lang="ts">

</script>

<template>

 b
 <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="i in 20" :key="i" class="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div class="h-32 bg-gray-200 rounded mb-4 flex items-center justify-center text-4xl">📁</div>
              <div class="font-medium">My Pack {{ i }}</div>
              <div class="text-xs text-gray-400 mt-1">2026-09-01</div>
            </div>
          </div>
</template>