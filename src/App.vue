<!-- App.vue -->
<script setup lang="ts">
import APITestLayout from './components/layout/APITestLayout.vue';
import UITestLayout from './components/layout/UITestLayout.vue';
import LoginView from './view/LoginView.vue';
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

</script>

<template>
 
   
<Toaster />
<LoginView/>

  
</template>