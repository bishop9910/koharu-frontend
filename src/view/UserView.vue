<script setup lang="ts">
  import { h, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { uploadImage } from '@/api/image';
  import type { UploadCustomRequestOptions } from 'naive-ui/es/upload';
  import { useAuthStore } from '@/stores/auth';
  import { useMessage } from 'naive-ui';

  const authStore = useAuthStore();
  const userStore = useUserStore();
  const router = useRouter();
  const message = useMessage();
  const menuOptions = [
  { label: '资料', key: 'me' },
  { label: '密码', key: 'password' },
  { 
    label: '我的投稿', 
    children: [
      {
        label: '已过审',
        key: 'approved'
      },
      {
        label: '待过审',
        key: 'pending'
      },
      {
        label: '未过审',
        key: 'rejected'
      }
    ]
  },
  { 
    label: '我的头像', 
    children: [
      {
        label: '已过审',
        key: 'approvedAvators'
      },
      {
        label: '待过审',
        key: 'pendingAvators'
      },
      {
        label: '未过审',
        key: 'rejectedAvators'
      }
    ]
  },
  { label: '删除账号', key: 'deleteUser' }

  ]

  function handleSelect1(){
    router.push('/profile')
  }
  
  function handleSelect2(){
    userStore.logout();
    router.push('/login');
  }

  function handleUpdate(key:string){
    router.push(`/profile/${key}`);
  }

  onMounted(()=>{
    if(!authStore.isLogin){
      message.success('请去登录');
      router.push('/login');
    }
  })
</script>

<template>
  <n-layout class="h-screen w-full" content-class="h-full flex flex-col overflow-hidden bg-gray-50">
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
                      <div class="font-bold text-gray-800">{{ userStore.userInfo?.username }}</div>
                      <div class="text-xs text-gray-500">{{ userStore.userInfo?.email}}</div>
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
    <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-6xl w-full mx-auto flex gap-6 h-full">
            <div class="rounded-xl overflow-hidden shadow-sm bg-white h-fit flex-shrink-0">
                <n-layout-sider
                    bordered
                    :width="200"
                    :collapsible="false"
                    content-class="bg-white"
                    >
                    <n-menu mode="vertical" :options="menuOptions" @update:value="handleUpdate"/>
                </n-layout-sider>
            </div>

            <div class="flex-1 bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                <div class="p-6 flex-1 min-h-0 flex flex-col">
                  <n-modal-provider>
                    <router-view></router-view>
                  </n-modal-provider>
                </div>
            </div>

        </div>
    </div>
  </n-layout>
</template>
