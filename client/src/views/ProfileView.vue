<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { postsAPI, uploadAPI, authAPI } from '../api';
import PostCard from '../components/PostCard.vue';

const route = useRoute(); const router = useRouter(); const auth = useAuthStore();
const profile = ref(null); const posts = ref([]); const loading = ref(true);
const isOwner = computed(() => !route.params.userId || auth.user?.id === route.params.userId);
const targetId = computed(() => route.params.userId || auth.user?.id);

const editing = ref(false); const editName = ref(''); const editBio = ref(''); const editErr = ref(''); const saving = ref(false);

async function load() {
  if (!targetId.value) { router.push('/login'); return; }
  loading.value = true;
  try {
    const { data } = await postsAPI.getUserPosts(targetId.value);
    posts.value = data.posts.map(p => ({ ...p, isLiked: auth.isLoggedIn && p.likes?.includes(auth.user.id) }));
    profile.value = data.user;
  } catch {} finally { loading.value = false; }
}
onMounted(load);
watch(() => route.params.userId, load);
watch(() => auth.user?.id, () => { if (!route.params.userId) load(); });

async function onAvatar(e) {
  const f = e.target.files?.[0]; if (!f) return;
  const fd = new FormData(); fd.append('image', f);
  const { data } = await uploadAPI.uploadImage(fd);
  const url = 'http://localhost:3001' + data.url;
  await authAPI.updateProfile({ avatar: url });
  profile.value.avatar = url; auth.user.avatar = url;
  localStorage.setItem('user', JSON.stringify(auth.user));
  e.target.value = '';
}

function startEdit() { editName.value = profile.value?.nickname||''; editBio.value = profile.value?.bio||''; editErr.value=''; editing.value = true; }
async function save() {
  if (!editName.value.trim()) { editErr.value='昵称不能为空'; return; }
  saving.value = true;
  try {
    await authAPI.updateProfile({ nickname: editName.value.trim(), bio: editBio.value.trim() });
    profile.value.nickname = editName.value.trim(); profile.value.bio = editBio.value.trim();
    auth.user.nickname = editName.value.trim(); auth.user.bio = editBio.value.trim();
    localStorage.setItem('user', JSON.stringify(auth.user));
    editing.value = false;
  } catch (e) { editErr.value = e.response?.data?.message||'保存失败'; }
  finally { saving.value = false; }
}
function onUpdate(p) { const i = posts.value.findIndex(x => x.id === p.id); if (i >= 0) { if (p._deleted) posts.value.splice(i,1); else posts.value[i] = p; } }
</script>
<template>
  <div>
    <div v-if="loading" style="text-align:center;padding:80px;color:#999;">加载中...</div>
    <template v-else>
      <div class="header">
        <div class="ava" @click="isOwner && $refs.aviInput.click()">
          <img v-if="profile?.avatar" :src="profile.avatar" /><span v-else>{{ (profile?.nickname||'?')[0] }}</span>
          <div v-if="isOwner" class="ava-overlay">&#128247;</div>
          <input v-if="isOwner" ref="aviInput" type="file" accept="image/*" hidden @change="onAvatar" />
        </div>
        <div class="info">
          <template v-if="!editing">
            <h2>{{ profile?.nickname }}</h2>
            <p class="uname">@{{ profile?.username }}</p>
            <p v-if="profile?.bio" class="bio">{{ profile.bio }}</p>
            <p class="joined">加入于 {{ new Date(profile?.createdAt).toLocaleDateString() }}</p>
            <button v-if="isOwner" class="btn-edit" @click="startEdit">编辑资料</button>
          </template>
          <template v-else>
            <div class="edit-f"><label>昵称</label><input v-model="editName" /></div>
            <div class="edit-f"><label>简介</label><textarea v-model="editBio" rows="2"></textarea></div>
            <div v-if="editErr" class="edit-err">{{ editErr }}</div>
            <div class="edit-btns"><button class="btn-save" @click="save" :disabled="saving">保存</button><button class="btn-cancel" @click="editing=false">取消</button></div>
          </template>
        </div>
      </div>
      <div class="stats">{{ posts.length }} 条微博</div>
      <PostCard v-for="p in posts" :key="p.id" :post="p" @update:post="onUpdate" />
      <div v-if="posts.length===0" style="text-align:center;padding:40px;color:#999;">还没有发布过微博</div>
    </template>
  </div>
</template>
<style scoped>
.header { display:flex;gap:14px;background:#fff;border-radius:12px;padding:20px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.06); }
.ava { width:68px;height:68px;border-radius:50%;overflow:hidden;background:#ff8200;position:relative;flex-shrink:0;display:flex;align-items:center;justify-content:center; }
.ava img { width:100%;height:100%;object-fit:cover; }
.ava span { color:#fff;font-size:26px;font-weight:600; }
.ava-overlay { position:absolute;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;opacity:0;transition:.2s;border-radius:50%;font-size:18px; }
.ava:hover .ava-overlay { opacity:1; }
.info { flex:1;min-width:0; }
h2 { font-size:18px;margin:0 0 2px; }
.uname { font-size:12px;color:#999;margin:0 0 6px; }
.bio { font-size:13px;color:#666;margin:0 0 4px; }
.joined { font-size:11px;color:#bbb;margin:0 0 8px; }
.btn-edit { padding:4px 14px;border:1px solid #ff8200;border-radius:14px;background:#fff;color:#ff8200;font-size:12px; }
.edit-f { display:flex;flex-direction:column;gap:3px;margin-bottom:8px; }
.edit-f label { font-size:11px;color:#999; }
.edit-f input,.edit-f textarea { padding:6px 8px;border:1px solid #e0e0e0;border-radius:5px;font-size:13px;outline:none;resize:none; }
.edit-f input:focus,.edit-f textarea:focus { border-color:#ff8200; }
.edit-err { color:#ff4d4f;font-size:11px;margin-bottom:6px; }
.edit-btns { display:flex;gap:6px; }
.btn-save { padding:5px 16px;background:#ff8200;color:#fff;border:none;border-radius:14px;font-size:12px; }
.btn-save:disabled { background:#ccc; }
.btn-cancel { padding:5px 14px;background:#f5f5f5;border:none;border-radius:14px;font-size:12px;color:#666; }
.stats { padding:10px 20px;background:#fff;border-radius:10px;margin-bottom:10px;font-size:13px;color:#666;box-shadow:0 1px 3px rgba(0,0,0,.06); }
</style>
