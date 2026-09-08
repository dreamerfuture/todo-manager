<template>
  <!-- ========================================================
       根组件：整个页面的"骨架"
       布局：顶部标题栏 → 中部三个功能卡片（新增/统计/列表）
       ======================================================== -->
  <div class="app">
    <header class="app-header">
      <h1>✅ 个人待办事项管理器</h1>
      <span class="today">{{ today }}</span>
    </header>

    <main class="app-main">
      <!-- 三个子组件就像三块积木，在这里拼起来。
           注意：TodoInput/TodoStats/TodoList 内部会自己从 store
           读取/修改数据，所以这里不需要给它们传数据 -->
      <TodoInput />
      <TodoStats />
      <TodoList />
    </main>

    <footer class="app-footer">
      数据保存在浏览器本地（localStorage），清除浏览器数据会全部丢失
    </footer>
  </div>
</template>

<script setup>
// <script setup> 是 Vue 3 推荐的组合式 API 写法
// 这里 import 的组件，模板里可以直接用（无需手动注册）
import { computed } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoStats from './components/TodoStats.vue'
import TodoList from './components/TodoList.vue'

// computed：根据其它数据"计算"出新值，并且自动跟随更新
const today = computed(() =>
  new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })
)
</script>

<!-- scoped：这个 <style> 只作用于当前组件，不会影响其它组件 -->
<style scoped>
.app {
  max-width: 720px;        /* 页面最宽 720px，内容居中 */
  margin: 0 auto;
  padding: 24px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;               /* 子元素之间的间距 */
}

.app-header {
  display: flex;
  justify-content: space-between;   /* 标题靠左、日期靠右 */
  align-items: center;
  padding: 8px 4px;
}
.app-header h1 { font-size: 24px; color: #1f2d3d; }
.today { font-size: 14px; color: #7a8699; }

.app-footer {
  text-align: center;
  font-size: 12px;
  color: #a0aab8;
  margin-top: 8px;
}
</style>
