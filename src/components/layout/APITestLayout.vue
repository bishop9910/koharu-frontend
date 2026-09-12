<script setup lang="ts">
import { login } from '@/api/auth';
import { onMounted } from 'vue';
onMounted(()=>{
    login({username:"admin",password:"34bd974ac25d931001d06695ec6b54a9",encrypted:false}).then((res)=>{
        console.log(res);
    })
})

</script>

<template>
  
</template>