<script setup lang="ts">
  import { login } from '@/api/auth';
  import type { LoginRequest } from '@/api/types';
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
  import { handleError, ref, type Ref } from 'vue';
  import { toast } from '@/utils/toast'
const accountRule = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/;
const passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{6,33}$/;
let loading = ref(false);
let form:Ref<LoginRequest> = ref({
    username: '',
    password: '',
    encrypted: false
});

function accountValid (accountVal:string){
    return accountRule.test(accountVal);
}

function passwordValid (passwordVal:string){
    return passwordRule.test(passwordVal);
}

function handleSubmit(){
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

    login(form.value).then((res)=>{
        toast.success('登录成功啦')
        console.log('@@@@@@@',res)
    }).catch((error)=>{
        toast.error('用户名或密码错误');
    }).finally(()=>{
        loading.value = false;
    })


}



 
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
        <Button variant="outline" class="w-full">
          如果你还没有账号，那就去注册一个吧
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style>
    
</style>