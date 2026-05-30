<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { postsAPI } from '../api';
import PostCard from '../components/PostCard.vue';

const auth = useAuthStore();
const posts = ref([]);
const loading = ref(true);
const page = ref(1);
const hasMore = ref(true);

async function fetch(reset) {
  if (reset) { page.value = 1; posts.value = []; hasMore.value = true; }
  try {
    loading.value = true;
    const { data } = await postsAPI.getList({ page: page.value });
    const list = data.posts.map(p => ({ ...p, isLiked: auth.isLoggedIn && p.likes?.includes(auth.user.id) }));
    posts.value = reset ? list : [...posts.value, ...list];
    hasMore.value = data.pagination.page < data.pagination.totalPages;
  } catch {} finally { loading.value = false; }
}

function loadMore() { if (!hasMore.value) return; page.value++; fetch(false); }
function onUpdate(p) { const i = posts.value.findIndex(x => x.id === p.id); if (i >= 0) { if (p._deleted) posts.value.splice(i, 1); else posts.value[i] = p; } }

function onScroll() { if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 200) loadMore(); }
onMounted(() => { fetch(true); window.addEventListener('scroll', onScroll); });
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>
<template>
  <div>
    <div v-if="loading&&posts.length===0" style="text-align:center;padding:60px;color:#999;">加载中...</div>
    <PostCard v-for="p in posts" :key="p.id" :post="p" @update:post="onUpdate" />
    <div v-if="posts.length>0&&!hasMore" style="text-align:center;padding:16px;color:#ccc;">— 没有更多了 —</div>
    <div v-if="posts.length===0&&!loading" style="text-align:center;padding:60px;color:#999;">还没有微博，快去发布吧</div>
  </div>
</template>
