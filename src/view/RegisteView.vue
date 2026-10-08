<script setup lang="ts">
  import { getPublicKey } from '@/api/auth';
  import type { LoginRequest, NewUserRequest, NewUserResponse, UserBaseInfo } from '@/api/types';
  import { newUser } from '@/api/users';
  import { Button } from '@/components/ui/button';
  import {
      Card,
      CardAction,
      CardContent,  
      CardDescription,
      CardFooter,
      CardHeader,
      CardTitle,
  } from '@/components/ui/card';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Role } from '@/enums/role';
  import { ref, type Ref } from 'vue';
  import { toast } from 'vue-sonner';
  import forge from 'node-forge';
  import { useRouter } from 'vue-router';
  

  const router = useRouter();
  const loading = ref(false);
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
      toast.error(`[Error]: ${error}`);
      loading.value = false;
    }
  }
  
  async function handRegiste(){
    if(loading.value)return;

    loading.value = true;

    if(!accountValid(username.value)){
      toast.warning('账号2到16位，中文、字母、数字、下划线');
      loading.value = false;
      return;
    }
    if(!passwordValid(password.value)){
      toast.warning('6到33位，必须同时包含字母和数字');
      loading.value = false;
      return;
    }

    if(!emailValid(email.value)){
      toast.warning('请输入正确的邮箱');
      loading.value = false;
      return;
    }

    await encryptPassword(formEncrypt, username.value, password.value, email.value, bio.value);

    newUser(formEncrypt.value).then((res: NewUserResponse) => {
      toast.success('注册成功，请去登录');
      router.push('/login')
    }).catch((error) => {
      toast.error(`[Error]: ${error}`);
    }).finally(() => {
      loading.value = false;
    })
      
  }
</script>

<template>
  <div class="flex justify-center items-start min-h-screen pt-15">
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
              <Input id="username" type="text" autocomplete="off" placeholder="请输入账号" v-model="username" />
            </div>
            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center">
                <Label for="password">密码</Label>
              </div>
              <Input id="password" type="password" autocomplete="new-password" placeholder="请输入密码" v-model="password"/>
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="email">邮箱</Label>
              <Input id="email" type="text" autocomplete="off" placeholder="请输入邮箱" v-model="email" />
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="bio">自我介绍（选填）</Label>
              <Input id="bio" type="text" autocomplete="off" placeholder="请输入" v-model="bio" />
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
