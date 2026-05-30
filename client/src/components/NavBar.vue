<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
</script>
<template>
  <nav class="navbar">
    <div class="nav-inner">
      <div class="brand" @click="router.push('/')">微博</div>
      <div class="links">
        <router-link to="/" active-class="active">首页</router-link>
        <router-link v-if="auth.isLoggedIn" to="/publish" active-class="active">发布</router-link>
        <router-link v-if="auth.isLoggedIn" :to="`/profile/${auth.user?.id}`" active-class="active">我的</router-link>
      </div>
      <div class="actions">
        <button v-if="!auth.isLoggedIn" class="btn" @click="router.push('/login')">登录</button>
        <template v-else>
          <span class="uname">{{ auth.user?.nickname }}</span>
          <button class="btn-outline" @click="auth.logout();router.push('/')">退出</button>
        </template>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.navbar { position:fixed;top:0;left:0;right:0;z-index:1000;background:#fff;border-bottom:1px solid #e8e8e8; }
.nav-inner { max-width:620px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 16px;height:52px; }
.brand { font-size:18px;font-weight:700;color:#ff8200;cursor:pointer; }
.links { display:flex;gap:2px; }
.links a { padding:5px 14px;border-radius:18px;color:#555;font-size:13px;text-decoration:none;transition:.2s; }
.links a:hover { background:#f5f5f5; }
.links a.active { background:#fff3e6;color:#ff8200;font-weight:600; }
.actions { display:flex;align-items:center;gap:8px; }
.uname { font-size:12px;color:#666;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.btn { padding:5px 16px;border:none;border-radius:18px;background:#ff8200;color:#fff;font-size:12px; }
.btn-outline { padding:5px 14px;border:1px solid #ddd;border-radius:18px;background:#fff;color:#999;font-size:12px; }
.btn-outline:hover { border-color:#ff4d4f;color:#ff4d4f; }
</style>
