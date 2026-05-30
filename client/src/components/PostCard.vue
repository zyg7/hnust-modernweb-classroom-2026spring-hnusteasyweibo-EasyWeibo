<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { postsAPI } from '../api';

const props = defineProps({ post: Object });
const emit = defineEmits(['update:post']);
const router = useRouter();
const auth = useAuthStore();
const isOwner = computed(() => auth.user?.id === props.post.userId);

function fmt(d) { const m = Math.floor((new Date() - new Date(d)) / 60000); if (m < 1) return '刚刚'; if (m < 60) return `${m}分钟前`; const h = Math.floor(m / 60); if (h < 24) return `${h}小时前`; return new Date(d).toLocaleDateString(); }
async function handleLike() { if (!auth.isLoggedIn) { router.push('/login'); return; } try { const { data } = await postsAPI.like(props.post.id); emit('update:post', { ...props.post, isLiked: data.isLiked, likeCount: data.likeCount }); } catch {} }
async function handleDelete() { if (!confirm('确定删除？')) return; await postsAPI.delete(props.post.id); emit('update:post', { ...props.post, _deleted: true }); }
</script>
<template>
  <div class="card" v-if="!post._deleted">
    <div class="header" @click="router.push('/profile/'+post.userId)">
      <div class="avatar"><img v-if="post.user?.avatar" :src="post.user.avatar" /><span v-else>{{ (post.user?.nickname||'?')[0] }}</span></div>
      <div class="info"><span class="name">{{ post.user?.nickname }}</span><span class="time">{{ fmt(post.createdAt) }}</span></div>
      <button v-if="isOwner" class="del" @click.stop="handleDelete">&#10005;</button>
    </div>
    <div class="body" @click="router.push('/post/'+post.id)">
      <p class="text">{{ post.content }}</p>
      <div v-if="post.images?.length" class="imgs" :class="'grid-'+Math.min(post.images.length,3)">
        <img v-for="(img,i) in post.images" :key="i" :src="'http://localhost:3001'+img" />
      </div>
    </div>
    <div class="actions">
      <button class="act" @click="router.push('/post/'+post.id)">&#128172; {{ post.commentCount||0 }}</button>
      <button class="act" :class="{liked:post.isLiked}" @click="handleLike">{{ post.isLiked?'&#10084;':'&#9825;' }} {{ post.likeCount||0 }}</button>
    </div>
  </div>
</template>
<style scoped>
.card { background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.06); }
.header { display:flex;align-items:center;gap:10px;margin-bottom:10px;cursor:pointer; }
.avatar { width:36px;height:36px;border-radius:50%;overflow:hidden;background:#ff8200;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.avatar img { width:100%;height:100%;object-fit:cover; }
.avatar span { color:#fff;font-size:14px;font-weight:600; }
.info { flex:1;display:flex;flex-direction:column; }
.name { font-size:14px;font-weight:600;color:#333; }
.time { font-size:11px;color:#999; }
.del { background:none;border:none;color:#ccc;font-size:13px;padding:2px 6px; }
.del:hover { color:#ff4d4f; }
.body { cursor:pointer;margin-bottom:10px; }
.text { font-size:15px;line-height:1.6;color:#333;white-space:pre-wrap;word-break:break-word; }
.imgs { display:grid;gap:4px;margin-top:8px;border-radius:6px;overflow:hidden; }
.grid-1 { grid-template-columns:1fr; }
.grid-2 { grid-template-columns:1fr 1fr; }
.grid-3 { grid-template-columns:1fr 1fr 1fr; }
.imgs img { width:100%;aspect-ratio:1;object-fit:cover; }
.actions { display:flex;gap:20px;padding-top:8px;border-top:1px solid #f0f0f0; }
.act { display:flex;align-items:center;gap:3px;background:none;border:none;color:#999;font-size:14px;padding:2px 6px;cursor:pointer; }
.act:hover { color:#666; }
.act.liked { color:#ff4d4f; }
</style>
