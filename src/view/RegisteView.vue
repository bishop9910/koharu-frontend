<script setup lang="ts">
  import { getPublicKey } from '@/api/auth';
  import type { LoginRequest, NewUserRequest, NewUserResponse, UserBaseInfo } from '@/api/types';
  import { newUser } from '@/api/users';
  import { Role } from '@/enums/role';
  import { ref, type Ref } from 'vue';
  import forge from 'node-forge';
  import { useRouter } from 'vue-router';
  import { useMessage } from 'naive-ui';
  

  const router = useRouter();
  const loading = ref(false);
  const message = useMessage();
  const formEncrypt:Ref<NewUserRequest> = ref({
    username: '',
    email: '',
    password: '',
    bio: '',
    encrypted: true,
    role:Role.USER
  });
  const username: Ref<string> = ref('');
  const password: Ref<string> = ref('');   
  const email: Ref<string> = ref('');   
  const bio: Ref<string> = ref('');   
  const accountRule = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/;
  const passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_\-+=.,?/~`|\\{}\[\]:;"'<>\s]{6,33}$/;
  const emailRule = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  function accountValid (accountVal: string){
    return accountRule.test(accountVal);
  }

  function passwordValid (passwordVal: string){
    return passwordRule.test(passwordVal);
  }

  function emailValid (emailVal: string){
    return emailRule.test(emailVal);
  }

  const encryptPassword = async (form: Ref<NewUserRequest>, username: string, password: string, email: string, bio: string) => {
    try {
      const publicKeyData = await getPublicKey();
      const publicKey = forge.pki.publicKeyFromPem(publicKeyData.publicKey);
      const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
        md: forge.md.sha256.create()
      });
      form.value.username = username;
      form.value.password = forge.util.encode64(encrypted);
      form.value.email = email;
      form.value.bio = bio;
    } catch(error: any){
      message.error(`[Error]: ${error}`);
      loading.value = false;
    }
  }
  
  async function handleRegiste(){
    if(loading.value)return;

    loading.value = true;

    if(!accountValid(username.value)){
      message.warning('账号2到16位，中文、字母、数字、下划线');
      loading.value = false;
      return;
    }
    if(!passwordValid(password.value)){
      message.warning('6到33位，必须同时包含字母和数字');
      loading.value = false;
      return;
    }

    if(!emailValid(email.value)){
      message.warning('请输入正确的邮箱');
      loading.value = false;
      return;
    }

    await encryptPassword(formEncrypt, username.value, password.value, email.value, bio.value);

    newUser(formEncrypt.value).then((res: NewUserResponse) => {
      message.success('注册成功，请去登录');
      router.push('/login')
    }).catch((error) => {
      message.error(`[Error]: ${error}`);
    }).finally(() => {
      loading.value = false;
    })
      
  }
</script>

<template>
  <div class="min-h-screen w-full flex justify-center items-start pt-[15vh] bg-gray-50">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-gray-800">创建账号</h1>
          <p class="mt-2 text-sm text-gray-500">填写以下信息完成注册</p>
        </div>

        <n-form
          label-placement="left"
          label-width="0"
          require-mark-placement="left"
        >
    
          <n-form-item path="username">
            <n-input
              v-model:value="username"
              placeholder="请输入用户名"
              size="large"
              class="w-full"
            >
              <template #prefix>
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="phone">
            <n-input
              v-model:value="email"
              placeholder="请输入邮箱"
              size="large"
              class="w-full"
            >
              <template #prefix>
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 10.5h3m-3 3h3m-6-3h.008v.008H10.5v-.008z" />
                </svg>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="password">
            <n-input
              v-model:value="password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码 "
              size="large"
              class="w-full"
            >
              <template #prefix>
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="username">
            <n-input
              v-model:value="bio"
              placeholder="请输入自我介绍"
              size="large"
              class="w-full"
              @keyup.enter="handleRegiste"
            >
              <template #prefix>
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </template>
            </n-input>
          </n-form-item>

          <n-button
            type="primary"
            block
            strong
            size="large"
            :loading="loading"
            class="mt-2"
            @click="handleRegiste"
          >
            立即注册
          </n-button>
        </n-form>
      </div>
    </div>
</template>
