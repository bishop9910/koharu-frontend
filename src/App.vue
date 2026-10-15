<!-- App.vue -->
<script setup lang="ts">
  import APITestLayout from './components/layout/APITestLayout.vue';
  import LoginView from './view/LoginView.vue';
  import 'vue-sonner/style.css';
  import UserView from './view/UserView.vue';
  import RegisteView from './view/RegisteView.vue';
  import { NMessageProvider} from 'naive-ui'
</script>

<template>
  <n-message-provider>
      <router-view/>
  </n-message-provider>
</template>