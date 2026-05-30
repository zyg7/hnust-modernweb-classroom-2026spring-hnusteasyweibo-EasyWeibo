<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { postsAPI, uploadAPI } from '../api';

const router = useRouter();
const content = ref('');
const images = ref([]);
const error = ref('');
const uploading = ref(false);
const publishing = ref(false);

async function onFile(e) {
  for (const f of Array.from(e.target.files)) {
    if (images.value.length >= 9) { error.value = '最多9张'; break; }
    if (f.size > 5*1024*1024) { error.value = '图片不能超过5MB'; continue; }
    uploading.value = true;
    try { const fd = new FormData(); fd.append('image', f); const { data } = await uploadAPI.uploadImage(fd); images.value.push(data.url); }
    catch { error.value = '上传失败'; }
    finally { uploading.value = false; }
  }
  e.target.value = '';
}

function removeImg(i) { images.value.splice(i, 1); }

async function publish() {
  if (!content.value.trim()) { error.value = '请输入内容'; return; }
  publishing.value = true;
  try { await postsAPI.create({ content: content.value, images: images.value }); router.push('/'); }
  catch (err) { error.value = err.response?.data?.message || '发布失败'; }
  finally { publishing.value = false; }
}
</script>
<template>
  <div class="page">
    <div class="card">
      <h3>发布微博</h3>
      <textarea v-model="content" placeholder="分享新鲜事..." rows="5" maxlength="2000"></textarea>
      <div v-if="images.length" class="preview">
        <div v-for="(img,i) in images" :key="i" class="prev-item">
          <img :src="'http://localhost:3001'+img" />
          <button @click="removeImg(i)">&#10005;</button>
        </div>
      </div>
      <div v-if="error" class="err">{{ error }}</div>
      <div class="bar">
        <label class="tool"><input type="file" accept="image/*" multiple @change="onFile" hidden />&#128247;</label>
        <button class="btn-pub" @click="publish" :disabled="publishing||uploading">{{ publishing?'发布中...':'发布' }}</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.page { padding-top:16px; }
.card { background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.06); }
h3 { margin:0 0 12px;font-size:16px; }
textarea { width:100%;padding:10px;border:1px solid #e8e8e8;border-radius:8px;font-size:14px;resize:vertical;outline:none;box-sizing:border-box; }
textarea:focus { border-color:#ff8200; }
.preview { display:flex;flex-wrap:wrap;gap:6px;margin-top:10px; }
.prev-item { position:relative;width:64px;height:64px;border-radius:5px;overflow:hidden; }
.prev-item img { width:100%;height:100%;object-fit:cover; }
.prev-item button { position:absolute;top:1px;right:1px;width:18px;height:18px;border-radius:50%;border:none;background:rgba(0,0,0,.5);color:#fff;font-size:10px;cursor:pointer; }
.err { color:#ff4d4f;font-size:12px;padding:6px 10px;background:#fff2f0;border-radius:5px;margin-top:10px; }
.bar { display:flex;justify-content:space-between;align-items:center;margin-top:14px; }
.tool { cursor:pointer;font-size:18px; }
.btn-pub { padding:9px 28px;background:#ff8200;color:#fff;border:none;border-radius:18px;font-weight:600; }
.btn-pub:disabled { background:#ccc; }
</style>
