<script setup lang="ts">
import { getPublicKey } from '@/api/auth';
import type { ChangePasswordRequest } from '@/api/types';
import { changePassword } from '@/api/users';
import { useDialog, useMessage } from 'naive-ui';
import { h, ref, type Ref } from 'vue';
import forge from 'node-forge';

const message = useMessage()
const passwordRule = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_\-+=.,?/~`|\\{}\[\]:;"'<>\s]{6,33}$/;
const formEncrypt: Ref<ChangePasswordRequest> = ref({
  oldPassword: '',
  newPassword: '',
  encrypted: true
});
const show = ref(false)
const oldPassword = ref('')
const newPassword = ref('')

const loading = ref(false)
function passwordValid (passwordVal:string){
  return passwordRule.test(passwordVal);
}
const encryptPassword = async (form: Ref<ChangePasswordRequest>, username: string, password: string) => {
    try {
      const publicKeyData = await getPublicKey();
      const publicKey = forge.pki.publicKeyFromPem(publicKeyData.publicKey);
      const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
        md: forge.md.sha256.create()
      });
      form.value.oldPassword = forge.util.encode64(encrypted);
      form.value.newPassword = forge.util.encode64(encrypted);
    } catch(error: any){
      message.error(`[Error]: ${error}`);
      loading.value = false;
    }
  }
async function handleSubmit(){
  if(loading.value) return
  loading.value = true;
  if(!passwordValid(newPassword.value)){
    loading.value = false;
    message.warning('6到18位，必须同时包含字母和数字');
    return;
  }
  if(!passwordValid(oldPassword.value)){
    loading.value = false;
    message.warning('6到18位，必须同时包含字母和数字');
    return;
  }
  await encryptPassword(formEncrypt, oldPassword.value, newPassword.value);
  try{
    await changePassword(formEncrypt.value)
    message.success('提交成功')
    loading.value = false
  }catch(err){
    message.error(`Error${err}`)
    loading.value = false
  }

}
</script>
<template>
  <h1 class="font-black text-2xl">当前账号已设置登录密码</h1>
  <img src="../assets/password.png" alt="" class="w-80">
  <n-modal 
  :style="{ width: '500px' }"
  v-model:show="show" 
  close-on-esc="true"
  preset="card"
  >
    <n-card
      title="请输入新的密码"
      :bordered="false"
      size="large"
      aria-modal="true"
    >
    <n-form>
      <n-form-item path="password">
        <n-input
          v-model:value="oldPassword"
          type="password"
          show-password-on="click"
          placeholder="请先输入久密码"
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
      <n-form-item path="password">
        <n-input
          v-model:value="newPassword"
          type="password"
          show-password-on="click"
          placeholder="请输入新密码"
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
      <n-button
            type="primary"
            block
            strong
            size="large"
            :loading="loading"
            class="mt-4"
            @click="handleSubmit"
          >提交新密码</n-button>
    </n-form>
    </n-card>
  </n-modal>
  <div>
    <n-button @click = 'show = true' type="info" size="large">修改密码</n-button>
  </div>
</template>