<template>
  <n-layout  style="height: 100vh;width: 100vw; background-color: aqua;">
    <n-layout-header bordered style="height: 7vh; padding: 24px; width: 100wh; background-color: black;" >
        顶部导航
    </n-layout-header>
    <n-layout has-sider = true style="height: 93vh; background-color: brown;">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        show-trigger
        native-scrollbar
        style = "width: 22vh; background-color: brown;"
      >
      <div style="padding: 24px;">Logo</div>
      </n-layout-sider>
      <n-layout-content content-style="padding: 24px;" native-scrollbar style = "width: 78vh; background-color: chocolate;">
          主内容区域
      </n-layout-content>
    </n-layout>  
  </n-layout>
</template>

<script setup lang="ts">

</script>