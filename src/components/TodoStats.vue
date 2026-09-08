<template>
  <!-- 统计卡片：总数 / 已完成 / 进行中 / 完成率 -->
  <section class="card stats-card">
    <h2>📊 完成进度</h2>

    <div class="stats-row">
      <!-- 四个统计小方块：v-for 遍历 statsList（见 script） -->
      <div class="stat" v-for="s in statsList" :key="s.label">
        <b :style="{ color: s.color }">{{ s.value }}</b>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <!-- 进度条：宽度 = 完成率百分比（:style 动态绑定） -->
    <div class="progress">
      <div class="progress-fill" :style="{ width: stats.percent + '%' }"></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTodos } from '../store/todos'

// 只需要"读"数据，所以只解构 state
const { state } = useTodos()

// computed 依赖 state：任务一变，这里自动重新计算
// 这是"派生数据"——不需要手动同步，界面永远是对的
const stats = computed(() => {
  const total = state.todos.length
  const done = state.todos.filter((t) => t.completed).length   // filter: 筛出已完成的
  return {
    total,
    done,
    active: total - done,
    // 防止除零：total 为 0 时直接给 0%
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  }
})

// 把统计值整理成"数组形式"，方便模板里用 v-for 渲染
const statsList = computed(() => [
  { label: '全部任务', value: stats.value.total, color: '#3b82f6' },
  { label: '已完成', value: stats.value.done, color: '#16a34a' },
  { label: '进行中', value: stats.value.active, color: '#f59e0b' },
  { label: '完成率', value: stats.value.percent + '%', color: '#8b5cf6' },
])
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(30, 45, 61, 0.06);
}
.stats-card h2 { font-size: 16px; color: #1f2d3d; margin-bottom: 14px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat {
  background: #f6f8fb;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.stat b { display: block; font-size: 24px; }
.stat span { font-size: 12px; color: #7a8699; }

.progress {
  height: 8px;
  background: #e8ecf2;
  border-radius: 4px;
  margin-top: 16px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #22c55e);
  border-radius: 4px;
  transition: width 0.4s;   /* 变化时平滑过渡 */
}
</style>
