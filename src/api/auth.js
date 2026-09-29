import { supabase } from '../supabase'

// 登录
export const login = (email, password) => {
  return supabase.auth.signInWithPassword({ email, password })
}

// 退出
export const logout = () => {
  return supabase.auth.signOut()
}

// 获取当前用户的角色信息（从我们刚建的 users 表里查）
export const getUserInfo = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}