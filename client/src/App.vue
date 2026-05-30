<script setup>
import NavBar from './components/NavBar.vue';
</script>
<template>
  <div id="app-container">
    <NavBar />
    <main class="main-content"><router-view /></main>
  </div>
</template>
<style scoped>
#app-container { min-height:100vh; background:#f5f5f5; }
.main-content { max-width:620px; margin:0 auto; padding:70px 16px 40px; }
</style>
