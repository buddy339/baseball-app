<template>
  <div class="checkin-page">
    <van-nav-bar title="一键签到" left-text="返回" left-arrow @click-left="$router.back()" />
    <div class="info-box">
      <h3>今日训练课</h3>
      <p>点击下方按钮完成签到，系统将自动扣除课时。</p >
    </div>
    <div style="padding: 20px;">
      <van-button type="primary" block round disabled>签到功能开发中...</van-button>
    </div>
  </div>
</template>

<script setup>
// 后续在这里实现签到扣课时逻辑
</script>

<style scoped>
.checkin-page { min-height: 100vh; }
.info-box { padding: 20px; color: #fff; }
.info-box p { font-size: 12px; color: #8b949e; }
</style>