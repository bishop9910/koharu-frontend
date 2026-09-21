<script setup lang="ts">
  import { getPublicKey, login } from '@/api/auth';
  import type { LoginRequest, LoginResponse } from '@/api/types';
  import type { TokenPair } from '@/stores/auth';
  import { Button } from '@/components/ui/button'
  import {
        Card,
        CardAction,
        CardContent,
        CardDescription,
        CardFooter,
        CardHeader,
        CardTitle,
  } from '@/components/ui/card'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { handleError, onMounted, ref, type Ref } from 'vue';
  import { toast } from '@/utils/toast'
  import { useAuthStore } from '@/stores/auth';
  import router from '@/router';
  import forge from 'node-forge';

  const accountRule = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/;
  const passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{6,33}$/;
  let loading = ref(false);
  let form:Ref<LoginRequest> = ref({
      username: '',
      password: '',
      encrypted: false
  });
  let formEncrypt:LoginRequest = {
      username: '',
      password: '',
      encrypted: true
  };


  let authStore = useAuthStore();

  const encryptPassword = (password:string)=>{
    getPublicKey().then((res)=>{
      let publicKey = forge.pki.publicKeyFromPem(res.publicKey);
      const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
        md: forge.md.sha256.create()
      });
      formEncrypt.password = forge.util.encode64(encrypted);
      formEncrypt.username = form.value.username;
    }).catch((error)=>{
      toast.error(error);
      loading.value = false;
    })
  }
  function accountValid (accountVal:string){
      return accountRule.test(accountVal);
  }

  function passwordValid (passwordVal:string){
      return passwordRule.test(passwordVal);
  }
  

  async function handleSubmit(){
      if(loading.value){return}

      loading.value = true;

      if(!accountValid(form.value.username)){
          loading.value = false;
          toast.warning('账号2到16位，中文、字母、数字、下划线');
          return;
      }

      if(!passwordValid(form.value.password)){
          loading.value = false;
          toast.warning('6到18位，必须同时包含字母和数字');
          return;
      }

      encryptPassword(form.value.password);
      console.log(formEncrypt)

      login(formEncrypt).then((res:LoginResponse)=>{
          toast.success('登录成功啦');
          console.log(formEncrypt)
          let pair:TokenPair = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken
          }
          authStore.setTokens(pair);


      }).catch((error)=>{
          toast.error('用户名或密码错误');
      }).finally(()=>{
          loading.value = false;
      })

  }
  onMounted(()=>{
        if(authStore.isLogin){
          toast.success('欢迎回来');
        }
      })



 
</script>

<template>
  <div class="flex justify-center items-start min-h-screen pt-32">
    <Card class="w-full max-w-sm ">
      <CardHeader>
        <CardTitle>登录你的账号</CardTitle>
        <CardDescription>
          你可以使用你的账号登录
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
            <Label for="username">账号</Label>
            <Input id="username" type="text" autocomplete="off" placeholder="请输入账号" v-model="form.username"/>
          </div>
          <div class="flex flex-col space-y-1.5">
            <div class="flex items-center">
              <Label for="password">密码</Label>
              <a
                href="#"
                class="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </a>
            </div>
            <Input id="password" type="password" autocomplete="new-password" placeholder="请输入密码" v-model="form.password"/>
          </div>
          </div>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col gap-2">
        <Button class="w-full" @click = 'handleSubmit'>
          登录
        </Button>
          <router-link
            to="/registe"
            class="block w-full text-center py-2.5 mt-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            如果你还没有账号，那就去注册一个吧
          </router-link>
      </CardFooter>
    </Card>
  </div>
</template>

<style>
    
</style>