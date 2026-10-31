<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useMessage } from 'naive-ui';
import { deleteUser } from '@/api/users';
import { useRouter } from 'vue-router';

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()
const load:Ref<boolean> = ref(false)
async function handleDelet() {
  const id = userStore.userId
  if(!id){
    message.error('Error找不到用户')
    return
  }
  if(load.value){
    message.error('操作过于频繁，请稍后重试')
    return
  }
  try{
    load.value = true
    await deleteUser({id})
    message.success('删除成功')
    load.value = false
    setTimeout(() => {
      router.push('/login')
    }, 300);
  }catch(err){
    load.value = false
    message.error(`Error${err}`)
  }

}

const value:Ref<boolean> = ref(false)
</script>
<template>
  <h1 class="font-black text-2xl">删除你的账号的注意事项</h1>
  <br>
  <div class="font-medium">
    您确认您是本koharu账号的所有人且自愿删除本账号。在您选择删除前请注意：<br>
        1. 账号删除后将无法登录koharu产品，koharu产品内所有的使用数据均将无法找回。<br>
        2. 您通过该账号获得的相关服务的充值额度、会员籍等视为您自行放弃，将无法继续使用。<br>
        <br>
        您理解并同意，在删除申请提交后，您的账号会被立即下线，如您反悔，请在申请删除后7天内重新登录，此时将会自动恢复账号，如您在7天内未选择恢复，原koharu账号及前述数据和服务将被完全清空，且其绑定信息（如手机、邮箱）将被解绑，该解绑信息仍可被使用注册新的koharu账号，但koharu无法协助您重新恢复原账号及前述数据和服务。<br>
        <br>
        在koharu账号删除期间，如有发现该账号涉及违反法律法规、用户协议或存在被盗风险的，koharu有权暂停您的账号删除程序。</div>
        <br>
        <n-checkbox v-model:checked="value">
          <div class="font-light">我确认以上信息，申请删除当前账号。</div>
        </n-checkbox>
        <n-button @click="handleDelet" type="error" size="large" :disabled="!value">删除账号</n-button>
</template>