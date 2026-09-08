<template>
  <!-- 任务列表卡片 -->
  <section class="card list-card">
    <div class="list-head">
      <h2>📝 任务列表</h2>

      <!-- 三个筛选标签：点击切换 filter 的值 -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: filter === tab.key }"
          @click="filter = tab.key"
        >
          {{ tab.label }}（{{ tabCount(tab.key) }}）
        </button>
      </div>

      <button v-if="hasDone" class="btn-clear" @click="handleClear">清空已完成</button>
    </div>

    <!-- 空状态：筛选结果为空时提示 -->
    <p v-if="filtered.length === 0" class="empty">这里空空如也，添加一个任务吧 ✨</p>

    <!-- 任务列表：把"数据"传给 TodoItem，把"操作"用事件收回来 -->
    <ul v-else class="todo-list">
      <!--
        :todo="todo"          把任务对象作为 prop 传给子组件（父→子 传数据）
        @toggle/@remove/@save 监听子组件 emit 的事件（子→父 通知操作）
        $event 就是子组件 emit 时带上来的参数（这里是任务的 id）
      -->
      <TodoItem
        v-for="todo in filtered"
        :key="todo.id"
        :todo="todo"
        @toggle="toggleTodo($event)"
        @remove="removeTodo($event)"
        @save="handleSave"
      />
    </ul>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTodos } from '../store/todos'
import TodoItem from './TodoItem.vue'

// 从 store 取出数据和所有操作方法
const { state, toggleTodo, removeTodo, updateTodo, clearCompleted } = useTodos()

// ---- 筛选功能 ----
// filter：当前选中的筛选条件。ref 的值被模板点击按钮修改
const filter = ref('all')          // 'all' 全部 | 'active' 进行中 | 'done' 已完成
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'done', label: '已完成' },
]

// 每个状态下各有多少条（用于标签上的数字）
const counts = computed(() => ({
  all: state.todos.length,
  active: state.todos.filter((t) => !t.completed).length,
  done: state.todos.filter((t) => t.completed).length,
}))
function tabCount(key) {
  return counts.value[key] ?? 0
}

// 当前应该显示哪些任务：按 filter 过滤（注意保持原有顺序：新的在前）
const filtered = computed(() => {
  if (filter.value === 'active') return state.todos.filter((t) => !t.completed)
  if (filter.value === 'done') return state.todos.filter((t) => t.completed)
  return state.todos
})

const hasDone = computed(() => counts.value.done > 0)

// ---- 事件处理（子组件只负责"报告发生了什么"，具体改数据在这里） ----
function handleSave(payload) {
  // payload = { id, title, priority, due }（来自 TodoItem 的编辑保存）
  const title = (payload.title || '').trim()
  if (!title) {
    alert('任务内容不能为空')
    return
  }
  updateTodo(payload.id, { title, priority: payload.priority, due: payload.due })
}

function handleClear() {
  if (confirm('确定清空所有已完成任务吗？')) {
    clearCompleted()
  }
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(30, 45, 61, 0.06);
}

.list-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.list-head h2 { font-size: 16px; color: #1f2d3d; }

.tabs {
  display: flex;
  gap: 6px;
  margin-left: auto;   /* 把标签组推到右边 */
}
.tab {
  padding: 6px 12px;
  border: 1px solid #e1e6ee;
  border-radius: 16px;
  background: #fff;
  font-size: 13px;
  color: #5b6b7f;
  transition: all 0.2s;
}
.tab.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }

.btn-clear {
  border: none;
  background: none;
  color: #dc2626;
  font-size: 13px;
}
.btn-clear:hover { text-decoration: underline; }

.empty {
  text-align: center;
  color: #a0aab8;
  padding: 32px 0;
  font-size: 14px;
}

.todo-list { list-style: none; }   /* 去掉 <ul> 自带的圆点 */
</style>
