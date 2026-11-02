<script setup lang="ts">
import { NDialogProvider, NMessageProvider } from 'naive-ui'
</script>

<template>
  <n-message-provider>
    <n-dialog-provider>
      <router-view />
    </n-dialog-provider>
  </n-message-provider>
</template>
