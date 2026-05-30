<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { postsAPI } from '../api';
import PostCard from '../components/PostCard.vue';

const route = useRoute(); const router = useRouter(); const auth = useAuthStore();
const post = ref(null); const comments = ref([]); const commentContent = ref(''); const loading = ref(true); const submitting = ref(false);

onMounted(async () => {
  try {
    const { data } = await postsAPI.getDetail(route.params.id);
    post.value = { ...data, isLiked: auth.isLoggedIn && data.likes?.includes(auth.user.id) };
    comments.value = (data.comments||[]).reverse();
  } catch {} finally { loading.value = false; }
});

async function addComment() {
  if (!commentContent.value.trim()) return;
  if (!auth.isLoggedIn) { router.push('/login'); return; }
  submitting.value = true;
  try {
    const { data } = await postsAPI.addComment(post.value.id, { content: commentContent.value });
    comments.value.unshift(data.comment); post.value.commentCount = (post.value.commentCount||0) + 1;
    commentContent.value = '';
  } catch {} finally { submitting.value = false; }
}

async function deleteComment(cid) {
  if (!confirm('确定删除？')) return;
  await postsAPI.deleteComment(post.value.id, cid);
  comments.value = comments.value.filter(c => c.id !== cid);
  post.value.commentCount = Math.max(0, (post.value.commentCount||0) - 1);
}
function onUpdate(p) { if (p._deleted) router.push('/'); else post.value = p; }
function fmt(d) { const m = Math.floor((new Date()-new Date(d))/60000); if (m<1) return '刚刚'; if (m<60) return `${m}分钟前`; const h=Math.floor(m/60); if (h<24) return `${h}小时前`; return new Date(d).toLocaleDateString(); }
</script>
<template>
  <div>
    <div v-if="loading" style="text-align:center;padding:80px;color:#999;">加载中...</div>
    <template v-else-if="post">
      <PostCard :post="post" @update:post="onUpdate"/>
      <div class="comments">
        <h4>评论 ({{ comments.length }})</h4>
        <div v-if="auth.isLoggedIn" class="input-area">
          <textarea v-model="commentContent" placeholder="写评论..." rows="2" maxlength="500"/>
          <button class="btn-cm" @click="addComment" :disabled="submitting||!commentContent.trim()">发表</button>
        </div>
        <div v-else class="hint"><router-link to="/login">登录</router-link>后评论</div>
        <div v-for="c in comments" :key="c.id" class="cm-item">
          <div class="cm-ava"><span>{{ (c.user?.nickname||'?')[0] }}</span></div>
          <div class="cm-body">
            <div class="cm-h"><span class="cm-name">{{ c.user?.nickname }}</span><span class="cm-time">{{ fmt(c.createdAt) }}</span></div>
            <p class="cm-text">{{ c.content }}</p>
            <button v-if="auth.user?.id===c.userId" class="cm-del" @click="deleteComment(c.id)">删除</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<style scoped>
.comments { background:#fff;border-radius:12px;padding:16px;margin-top:10px;box-shadow:0 1px 3px rgba(0,0,0,.06); }
h4 { margin:0 0 12px;font-size:15px;padding-bottom:10px;border-bottom:1px solid #f0f0f0; }
.input-area { margin-bottom:14px; }
.input-area textarea { width:100%;padding:8px;border:1px solid #e0e0e0;border-radius:7px;font-size:13px;resize:none;outline:none;box-sizing:border-box; }
.input-area textarea:focus { border-color:#ff8200; }
.btn-cm { margin-top:6px;padding:6px 18px;background:#ff8200;color:#fff;border:none;border-radius:14px;font-size:12px;float:right; }
.btn-cm:disabled { background:#ccc; }
.hint { text-align:center;padding:12px;font-size:12px;color:#999; }
.hint a { color:#ff8200; }
.cm-item { display:flex;gap:8px;padding:10px 0;border-bottom:1px solid #f5f5f5; }
.cm-ava { width:28px;height:28px;border-radius:50%;background:#ff8200;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.cm-ava span { color:#fff;font-size:12px;font-weight:600; }
.cm-body { flex:1; }
.cm-h { display:flex;align-items:center;gap:6px;margin-bottom:2px; }
.cm-name { font-size:12px;font-weight:600;color:#333; }
.cm-time { font-size:10px;color:#bbb; }
.cm-text { font-size:13px;color:#444;margin:0;word-break:break-word; }
.cm-del { background:none;border:none;color:#ccc;font-size:10px;padding:1px 4px; }
.cm-del:hover { color:#ff4d4f; }
</style>
