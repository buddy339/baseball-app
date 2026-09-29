import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 存储用户信息 { id, email, role, name }
  const userInfo = ref(null)
  const isLoggedIn = ref(false)

  const setUser = (info) => {
    userInfo.value = info
    isLoggedIn.value = true
  }

  const logout = () => {
    userInfo.value = null
    isLoggedIn.value = false
  }

  return { userInfo, isLoggedIn, setUser, logout }
})