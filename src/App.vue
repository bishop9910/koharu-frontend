<!-- App.vue -->
<script setup lang="ts">
import APITestLayout from './components/layout/APITestLayout.vue';
import UITestLayout from './components/layout/UITestLayout.vue';
import LoginView from './view/LoginView.vue';
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';
import UserView from './view/UserView.vue';
import RegisteView from './view/RegisteView.vue';

</script>

<template>
 
   
<Toaster />

<LoginView></LoginView>

  
</template>