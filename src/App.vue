<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
onMounted(() => {
  document.documentElement.classList.add('van-theme-dark'); // 开启深色模式
});
</script>

<style>
body {
  background-color: #0d1117;
  color: #c9d1d9;
  margin: 0;
  font-family: sans-serif;
}
</style>