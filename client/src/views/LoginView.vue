<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const isReg = ref(false);
const username = ref(''); const password = ref(''); const confirm = ref(''); const nickname = ref('');
const error = ref(''); const loading = ref(false);

async function submit() {
  error.value = '';
  if (!username.value || !password.value) { error.value = '请填写用户名和密码'; return; }
  if (isReg.value && password.value !== confirm.value) { error.value = '密码不一致'; return; }
  loading.value = true;
  try {
    if (isReg.value) await auth.register(username.value, password.value, nickname.value || username.value);
    else await auth.login(username.value, password.value);
    router.push(route.query.redirect || '/');
  } catch (e) { error.value = e.response?.data?.message || '操作失败'; }
  finally { loading.value = false; }
}
</script>
<template>
  <div class="page">
    <div class="card">
      <h2>{{ isReg ? '注册' : '登录' }}</h2>
      <form @submit.prevent="submit">
        <div class="fg"><label>用户名</label><input v-model="username" placeholder="请输入用户名" /></div>
        <div class="fg"><label>密码</label><input v-model="password" type="password" placeholder="请输入密码" /></div>
        <template v-if="isReg">
          <div class="fg"><label>确认密码</label><input v-model="confirm" type="password" placeholder="再次输入密码" /></div>
          <div class="fg"><label>昵称</label><input v-model="nickname" placeholder="给自己取个昵称" /></div>
        </template>
        <div v-if="error" class="err">{{ error }}</div>
        <button type="submit" class="btn-submit" :disabled="loading">{{ loading?'处理中...':isReg?'注册':'登录' }}</button>
      </form>
      <div class="foot">{{ isReg?'已有账号？':'没有账号？' }}<a href="#" @click.prevent="isReg=!isReg">{{ isReg?'去登录':'去注册' }}</a></div>
    </div>
  </div>
</template>
<style scoped>
.page { display:flex;justify-content:center;padding-top:40px; }
.card { background:#fff;border-radius:14px;padding:30px;width:100%;max-width:380px;box-shadow:0 2px 12px rgba(0,0,0,.08); }
h2 { text-align:center;margin:0 0 24px;font-size:20px; }
.fg { display:flex;flex-direction:column;gap:4px;margin-bottom:14px; }
.fg label { font-size:12px;color:#666; }
.fg input { padding:10px 12px;border:1px solid #ddd;border-radius:7px;font-size:14px;outline:none; }
.fg input:focus { border-color:#ff8200; }
.err { color:#ff4d4f;font-size:12px;padding:6px 10px;background:#fff2f0;border-radius:5px;margin-bottom:12px; }
.btn-submit { width:100%;padding:11px;background:#ff8200;color:#fff;border:none;border-radius:7px;font-size:15px;font-weight:600; margin-top:4px; }
.btn-submit:disabled { background:#ccc; }
.foot { text-align:center;margin-top:16px;font-size:12px;color:#999; }
.foot a { color:#ff8200;margin-left:4px; }
</style>
