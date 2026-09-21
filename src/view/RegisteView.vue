<script setup lang="ts">
    import type { NewUserRequest } from '@/api/types';
    import { newUser } from '@/api/users';
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
    import { Role } from '@/enums/role';
    import { ref, type Ref } from 'vue';
    import { toast } from 'vue-sonner';
    
    let isloading = ref(false);
    let form:Ref<NewUserRequest> = ref({
      username: '',
      email: '',
      password: '',
      bio: '',
      encrypted: true,
      role:Role.USER
    });
    const accountRule = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,16}$/;
    const passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{6,33}$/;

    function accountValid (accountVal:string){
      return accountRule.test(accountVal);
    }

    function passwordValid (passwordVal:string){
      return passwordRule.test(passwordVal);
    }

    function handRegiste(){
        if(isloading.value){return};

        isloading.value = true;

        if(!accountValid(form.value.username)){
            toast.warning('账号2到16位，中文、字母、数字、下划线');
            return;
        }
        if(!passwordValid(form.value.password)){
            toast.warning('6到18位，必须同时包含字母和数字');
            return;
        }
        
    }
</script>

<template>
  <div class="flex justify-center items-start min-h-screen pt-32">
    <Card class="w-full max-w-sm mt-20">
      <CardHeader>
        <CardTitle>注册你的账号</CardTitle>
        <CardDescription>
          你可以直接写给账号名和密码注册
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
            <Label for="username">账号</Label>
            <Input id="username" type="text" autocomplete="off" placeholder="请输入账号" v-model="form.username" />
          </div>
          <div class="flex flex-col space-y-1.5">
            <div class="flex items-center">
              <Label for="password">密码</Label>
            </div>
            <Input id="password" type="password" autocomplete="new-password" placeholder="请输入密码" v-model="form.password"/>
          </div>
          </div>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col gap-2">
        <Button class="w-full" @click = 'handRegiste'>
            注册
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
