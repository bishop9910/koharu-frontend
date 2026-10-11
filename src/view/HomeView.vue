<script setup lang="ts">
  import { h } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';

  const useStore = useUserStore();
  const router = useRouter();
  const menuOptions = [
  { label: '首页', key: 'a' },
  { label: '设置', key: 'b' }
  ]

  function handleSelect1(){
    router.push('/profile')
  }
  
  function handleSelect2(){
    useStore.logout();
    router.push('/login');
  }

  function handleUpdate(key:any){
    console.log(key);
    router.push(`/home/${key}`);
  }
</script>

<template>
  <n-layout class="h-screen w-full" content-class="h-full flex flex-col overflow-hidden">
    <n-layout-header class="h-16 flex-shrink-0 border-b px-6 flex items-center z-10">
        <n-layout content-class="flex justify-between items-center" >
          <div>
              <n-avatar
                size="medium"
                src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
              />
          </div>
          <div>
              <n-popover 
                trigger="hover" 
                placement="bottom-end" 
                :show-arrow="false" 
                style="padding: 0; border-radius: 8px;"
              >
                <template #trigger>
                  <n-avatar round src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" class="cursor-pointer" />
                </template>
                <div class="w-[240px]">
                  <div class="bg-[#e0eff9] p-4 flex items-center gap-3">
                    <n-avatar round src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
                    <div>
                      <div class="font-bold text-gray-800">{{ useStore.userInfo?.username }}</div>
                      <div class="text-xs text-gray-500">{{useStore.userInfo?.email}}</div>
                    </div>
                  </div>
                  <div class="py-2">
                    <div class="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100" @click="handleSelect1">个人中心</div>
                    <div class="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100" @click="handleSelect2">退出登录</div>
                  </div>
                </div>
              </n-popover>
          </div>
        </n-layout>
    </n-layout-header>
    <n-layout has-sider class="flex-1 min-h-0">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :width="240"
        :collapsed-width="64"
        show-trigger
        class="h-full"
      >
      <n-menu  mode="vertical" :options="menuOptions" @update:value = 'handleUpdate'/>
      </n-layout-sider>
      <n-layout class="min-w-0" content-class="h-full flex flex-col overflow-hidden">

        <n-layout-content
          class="flex-1 min-h-0"
          content-class="p-6 overflow-y-auto"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">全部文件</h2>
            <div class="space-x-2">
              <button class="px-4 py-2 border rounded hover:bg-gray-100">本地上传</button>
              <button class="px-4 py-2 border rounded hover:bg-gray-100">新建文件夹</button>
            </div>
          </div>
          <router-view></router-view>
        </n-layout-content>

      </n-layout>
    </n-layout>
  </n-layout>
</template>
