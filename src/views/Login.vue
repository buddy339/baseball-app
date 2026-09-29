<template>
  <div class="login-page">
    <h2>棒球学院登录</h2>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="email" name="email" label="邮箱" placeholder="请输入邮箱" />
        <van-field v-model="password" type="password" name="password" label="密码" placeholder="请输入密码" />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">登录</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { login, getUserInfo } from '../api/auth';
import { useUserStore } from '../store/user';
import { supabase } from '../supabase';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();

const onSubmit = async () => {
  loading.value = true;
  // 1. 执行认证登录
  const { data: authData, error: authError } = await login(email.value, password.value);
  
  if (authError) {
    loading.value = false;
    return showToast('登录失败：' + authError.message);
  }

  // 2. 认证成功后，去 users 表查角色
  const { data: profile, error: profileError } = await getUserInfo(authData.user.id);
  
  if (profileError || !profile) {
    loading.value = false;
    return showToast('未找到用户角色信息，请联系管理员');
  }

  // 3. 存入 Pinia
  let displayName = profile.email.split('@')[0]; // 默认用邮箱前缀
  
  // 如果是家长，去 parents 表查真实姓名
  if (profile.role === 'parent') {
    const { data: parentData } = await supabase
      .from('parents')
      .select('name')
      .eq('user_id', profile.id)
      .single();
    if (parentData && parentData.name) {
      displayName = parentData.name; // 变成“张爸爸”
    }
  }

    userStore.setUser({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: displayName // 存入真实姓名
  });
  loading.value = false;
  showToast('登录成功');
  router.push('/'); // 跳回首页
};
</script>

<style scoped>
.login-page { padding: 40px 20px; min-height: 100vh; color: #fff; }
.login-page h2 { text-align: center; margin-bottom: 30px; color: #fff; }
</style>