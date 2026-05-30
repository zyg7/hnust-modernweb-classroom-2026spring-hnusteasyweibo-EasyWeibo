import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import PublishView from '../views/PublishView.vue';
import ProfileView from '../views/ProfileView.vue';
import PostDetailView from '../views/PostDetailView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/publish', name: 'publish', component: PublishView, meta: { requiresAuth: true } },
  { path: '/profile/:userId?', name: 'profile', component: ProfileView },
  { path: '/post/:id', name: 'postDetail', component: PostDetailView },
];

const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) next({ name: 'login', query: { redirect: to.fullPath } });
  else next();
});

export default router;
