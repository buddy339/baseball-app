<template>
 <!-- 1. 新增：未登录时的后备提示，防止白屏 -->
  <div v-if="!userStore.userInfo" class="login-prompt">
    <h2>未登录或角色加载中...</h2>
    <p>请先登录获取角色权限</p >
    <van-button type="primary" block round @click="$router.push('/login')">前往登录</van-button>
  </div>

  <!-- 2. 修改：原来的 v-if 改成 v-else，表示登录成功后展示 -->
  <div class="dashboard" v-else>
    <!-- 顶部问候（根据角色动态显示） -->
    <div class="header">
      <div>
        <h3>欢迎回来，{{ userStore.userInfo.name }} 
          ({{ roleText }})
        </h3>
        <!-- 主管视角提示 -->
        <p v-if="userStore.userInfo.role === 'admin'">今天有 2 场训练课及 1 场对抗赛排程</p >
        <!-- 教练视角提示 -->
        <p v-if="userStore.userInfo.role === 'coach'">今天有 2 场训练课需要您签到</p >
        <!-- 家长视角提示 -->
        <p v-if="userStore.userInfo.role === 'parent'">查看孩子的训练与比赛进度</p >
      </div>
      <div class="avatar"></div>
    </div>

    <!-- ================= 主管视角 ================= -->
    <div v-if="userStore.userInfo.role === 'admin'">
      <div class="kpi-grid">
        <div class="card">
          <p>在册学员总数</p >
          <h2>{{ stats.studentCount }} <span>人</span></h2>
          <small class="green">全校区数据</small>
        </div>
        <div class="card">
          <p>本月消课总计</p >
          <h2>84 <span>课时</span></h2>
          <small>划课率 92%</small>
        </div>
      </div>
      <!-- 主管可见快捷功能 -->
      <div class="section">
        <!-- 主管可见的学员具体信息列表 -->
      <div class="section">
        <p class="section-title">学员课时明细</p >
        
        <!-- 循环展示每一个学员 -->
        <div class="student-item" v-for="player in studentList" :key="player.id">
          <span>{{ player.name }}</span>
          <!-- 自动判断课时：小于等于3节课时显示红色 -->
          <span class="balance" :class="{ 'text-red': (player.hour_accounts?.balance || 0) <= 3 }">
            剩余 {{ player.hour_accounts?.balance || 0 }} 课时
          </span>
        </div>
        
        <!-- 如果数据库里没有学员，显示提示 -->
        <div v-if="studentList.length === 0" style="color:#8b949e; font-size: 12px; text-align:center; padding: 10px;">
          暂无学员数据，请去 Supabase 添加
        </div>
      </div>
        <p class="section-title">快捷功能与管理</p >
        <van-grid :column-num="4" :border="false">
          <van-grid-item icon="checked" text="一键签到" @click="$router.push('/checkin')" />
          <van-grid-item icon="cluster-o" text="比赛布阵" />
          <van-grid-item icon="photo-o" text="生成海报" />
          <van-grid-item icon="add-o" text="新建档案" />
        </van-grid>
      </div>
    </div>

    <!-- ================= 教练视角 ================= -->
    <div v-if="userStore.userInfo.role === 'coach'">
      <div class="section">
        <p class="section-title">我的排课</p >
        <van-button type="primary" block round @click="$router.push('/checkin')">去签到</van-button>
      </div>
    </div>

   <!-- ================= 家长视角 ================= -->
    <div v-if="userStore.userInfo.role === 'parent'">
      <div class="section" v-if="childInfo">
        <p class="section-title">{{ childInfo.name }} 的课时</p >
        <div class="card" style="margin-top: 10px;">
          <p>剩余课时</p >
          <h2 class="red">{{ childInfo.balance }} <span>课时</span></h2>
        </div>
      </div>
      <div class="section" v-else>
        <p class="section-title">暂无孩子信息，请联系管理员</p >
      </div>
    </div>

    <!-- 赛事排程（所有人都能看，但家长只能看通知） -->
    <div class="section">
      <div class="section-title-row">
        <p class="section-title">近期赛事排程</p >
        <span>查看全部</span>
      </div>
      <div class="match-card" v-for="match in matches" :key="match.id">
        <div>
          <h4>{{ match.title }}</h4>
          <p>{{ formatDate(match.match_date) }} | {{ match.location }}</p >
        </div>
        <van-tag color="#2b3a4a" text-color="#fff">{{ match.opponent }}</van-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const stats = ref({ studentCount: 0, warningCount: 0 });
const matches = ref([]);
const childInfo = ref(null); // 用来存储孩子的姓名和课时
const studentList = ref([]); // 用来存储学员明细数据

// 动态计算角色名称
const roleText = computed(() => {
  const map = { admin: '校区主管', coach: '教练', parent: '家长' };
  return map[userStore.userInfo.role] || '用户';
});

onMounted(async () => {
  if (!userStore.userInfo) return; // 防止未登录时报错
  // 获取学员列表及他们的课时余额（关联 hour_accounts 表）
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .select('id, name, hour_accounts (balance)');
  
  if (playerError) {
    console.error('❌ 查询学员明细失败：', playerError);
  } else if (playerData) {
    studentList.value = playerData;
    stats.value.studentCount = playerData.length; // 用实际数组长度作为总数
  }

  // 如果是家长，查询孩子信息
  if (userStore.userInfo.role === 'parent') {
    // 1. 先查这个家长在 parents 表中的 id
    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userStore.userInfo.id)
      .single();
    
    if (parent) {
      // 2. 通过关系表查关联的孩子
      const { data: relations } = await supabase
        .from('parent_player_relations')
        .select('player_id, players(name)') // 关联 players 表拿名字
        .eq('parent_id', parent.id);
        
      if (relations && relations.length > 0) {
        const playerId = relations[0].player_id;
        const playerName = relations[0].players.name;
        
        // 3. 查这个孩子的课时余额
        const { data: account } = await supabase
          .from('hour_accounts')
          .select('balance')
          .eq('player_id', playerId)
          .single();
        
        childInfo.value = {
          name: playerName,
          balance: account ? account.balance : 0
        };
      }
    }
  }

  // 获取比赛排程
  const { data } = await supabase.from('matches').select('*').order('match_date', { ascending: true }).limit(3);
  matches.value = data || [];
});

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.getMonth()+1}月${date.getDate()}日 ${date.getHours()}:00`;
};
</script>

<style scoped>
.dashboard { padding: 16px; padding-bottom: 80px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h3 { margin: 0 0 4px 0; font-size: 18px; color: #fff; }
.header p { margin: 0; font-size: 12px; color: #8b949e; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #e67e22; }

.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.card { background: #1c2128; padding: 16px 12px; border-radius: 8px; border: 1px solid #30363d; }
.card h2 { margin: 8px 0; font-size: 24px; color: #fff; }
.card h2 span { font-size: 12px; color: #8b949e; font-weight: normal; }
.card p { font-size: 12px; color: #8b949e; margin: 0; }
.card small { font-size: 10px; }
.green { color: #2ea043; }
.red { color: #f85149; }

.section { margin-top: 20px; background: #1c2128; padding: 16px; border-radius: 8px; border: 1px solid #30363d; }
.section-title { font-size: 14px; color: #fff; margin: 0 0 12px 0; font-weight: bold; }
.section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-title-row span { font-size: 12px; color: #58a6ff; }
/* 学员列表条目样式 */
.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #30363d;
  font-size: 14px;
  color: #c9d1d9;
}
.student-item:last-child {
  border-bottom: none;
}

/* 课时余额默认是绿色 */
.student-item .balance {
  color: #2ea043; 
  font-weight: bold;
}

/* 如果课时 <= 3，Vue 会自动给它加上这个类名，变成红色 */
.student-item .text-red {
  color: #f85149; 
}

.match-card { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #30363d; }
.match-card:last-child { border-bottom: none; }
.match-card h4 { margin: 0 0 4px 0; font-size: 14px; color: #fff; }
.match-card p { margin: 0; font-size: 12px; color: #8b949e; }
.login-prompt {
  padding: 60px 20px;
  text-align: center;
  color: #fff;
}
.login-prompt h2 { margin-bottom: 10px; }
.login-prompt p { color: #8b949e; margin-bottom: 30px; font-size: 14px; }
</style>