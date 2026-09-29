import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import CheckIn from '../views/CheckIn.vue'
import Login from '../views/Login.vue'
// import { useUserStore } from '../store/user'  <-- 暂时注释掉这行

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/checkin', name: 'CheckIn', component: CheckIn }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 暂时把路由守卫也注释掉
// router.beforeEach((to) => {
//   const userStore = useUserStore();
//   if (!userStore.isLoggedIn && to.name !== 'Login') {
//     return { name: 'Login' };
//   }
// });

export default router