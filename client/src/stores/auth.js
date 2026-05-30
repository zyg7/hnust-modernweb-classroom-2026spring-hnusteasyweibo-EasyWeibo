import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '../api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref(localStorage.getItem('token') || '');
  const isLoggedIn = computed(() => !!token.value);

  async function login(username, password) {
    const { data } = await authAPI.login({ username, password });
    token.value = data.token; user.value = data.user;
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
  }
  async function register(username, password, nickname) {
    const { data } = await authAPI.register({ username, password, nickname });
    token.value = data.token; user.value = data.user;
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
  }
  function logout() { token.value = ''; user.value = null; localStorage.removeItem('token'); localStorage.removeItem('user'); }
  return { user, token, isLoggedIn, login, register, logout };
});
