<script setup lang="ts">
  import { getPublicKey, login } from '@/api/auth';
  import type { LoginRequest, LoginResponse, UserBaseInfo } from '@/api/types';
  import type { TokenPair } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import { handleError, onMounted, ref, type Ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import forge from 'node-forge';
  import type { ExecException } from 'child_process';
  import { Role } from '@/enums/role';
  import { useUserStore } from '@/stores/user';
  import { useMessage} from 'naive-ui'

  const accountRule = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/;
  const passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_\-+=.,?/~`|\\{}\[\]:;"'<>\s]{6,33}$/;
  const loading = ref(false);
  const router = useRouter();
  const username: Ref<string> = ref("");
  const password: Ref<string> = ref("");
  const message = useMessage();

  const formEncrypt: Ref<LoginRequest> = ref({
    username: '',
    password: '',
    encrypted: true
  });

  const userInfo: Ref<UserBaseInfo> = ref({
    id: '',
    username: '',
    email: '',
    role : Role.USER
  })

  const authStore = useAuthStore();
  const userStore = useUserStore();

  const encryptPassword = async (form: Ref<LoginRequest>, username: string, password: string) => {
    try {
      const publicKeyData = await getPublicKey();
      const publicKey = forge.pki.publicKeyFromPem(publicKeyData.publicKey);
      const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
        md: forge.md.sha256.create()
      });
      form.value.username = username;
      form.value.password = forge.util.encode64(encrypted);
    } catch(error: any){
      message.error(`[Error]: ${error}`);
      loading.value = false;
    }
  }

  function accountValid (accountVal:string){
    return accountRule.test(accountVal);
  }

  function passwordValid (passwordVal:string){
    return passwordRule.test(passwordVal);
  }


  async function handleSubmit(){
    if(loading.value) return
    loading.value = true;

    if(!accountValid(username.value)){
      loading.value = false;
      message.warning('账号2到16位，中文、字母、数字、下划线');
      return;
    }

    if(!passwordValid(password.value)){
      loading.value = false;
      message.warning('6到18位，必须同时包含字母和数字');
      return;
    }

    await encryptPassword(formEncrypt, username.value, password.value);

    login(formEncrypt.value).then((res: LoginResponse) => {
      message.success('登录成功啦');
      const pair: TokenPair = {
        accessToken: res.accessToken,
        refreshToken: res.refreshToken
      };
      userInfo.value = {
        id: res.user.id,
        username: res.user.username,
        email: res.user.email,
        role: res.user.role
      }
      userStore.setUserInfo(userInfo.value);
      authStore.setTokens(pair);
      router.push('/home');
    }).catch((error) => {
      message.error(`[Error]: ${error}`);
    }).finally(() => {
      loading.value = false;
    })
  }

  function handleRegister(){
    router.push("/registe");
  }
  
  onMounted(() => {
    if(authStore.isLogin){
      message.success('欢迎回来');
      router.push('/home');
    }
  })
</script>

<template>
  <div class="min-h-screen w-full flex justify-center items-start pt-[15vh] bg-gray-50">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5  ">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-gray-800">欢迎登录</h1>
          <p class="mt-2 text-sm text-gray-500">请输入您的账号信息以继续</p>
        </div>
        <n-form
          label-placement="left"
          label-width="0"
          require-mark-placement="left"
        >
          <n-form-item path="username">
            <n-input
              v-model:value="username"
              placeholder="请输入账号 / 手机号"
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
          <n-form-item path="password">
            <n-input
              v-model:value="password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码"
              size="large"
              class="w-full"
              @keyup.enter="handleSubmit"
            >
              <template #prefix>
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
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
            class="mt-4"
            @click="handleSubmit"
          >
            登 录
          </n-button>
        </n-form>
        <div class="mt-8 text-center text-sm text-gray-500">
          还没有账号？
          <n-button text type="primary" @click="handleRegister">立即注册</n-button>
        </div>
      </div>
    </div>
</template>

<style>
    
</style>