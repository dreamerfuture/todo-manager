// ============================================================
// 任务数据仓库（store）—— 整个项目的"数据中心"，请最先读它
// ------------------------------------------------------------
// 作用：
//   1. reactive() 创建一个全局共享的响应式数据对象 state
//   2. 提供"增删改查"等操作函数（组件只调用这些函数）
//   3. watch() 监听 state，数据一变就自动存入 localStorage
//
// 关键原理：
//   JS 模块（本文件）只会被 import 加载一次，所以所有组件拿到
//   的 state 都是【同一个对象】。一个组件改了它，其它组件界面
//   会通过响应式系统自动刷新 —— 这就是"全局共享状态"。
// ============================================================

import { reactive, watch } from 'vue'

// 存到 localStorage 时使用的键名（相当于"存档文件名"）
const STORAGE_KEY = 'todo_manager_data'

// ---------- 1. 默认数据（第一次打开、还没有存档时使用） ----------
// 每条任务的结构：{ id, title, priority, due, completed, createdAt }
//   id        唯一编号
//   title     任务内容
//   priority  优先级：'高' | '中' | '低'
//   due       截止日期 'YYYY-MM-DD'，可留空 '' 表示没有截止日期
//   completed 是否已完成
//   createdAt 创建日期（仅用于参考）
const defaultTodos = [
  { id: 1, title: '学习 Vue 3 基础语法', priority: '高', due: '', completed: false, createdAt: '2026-09-20' },
  { id: 2, title: '用 Vite 新建项目并跑起来', priority: '中', due: '2026-09-22', completed: true, createdAt: '2026-09-20' },
  { id: 3, title: '写环境配置文档', priority: '低', due: '2026-09-25', completed: false, createdAt: '2026-09-20' },
]

// ---------- 2. 读取 localStorage 里的存档 ----------
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)   // 取存档字符串
    if (saved) {                                      // 有存档才解析
      const parsed = JSON.parse(saved)
      return {
        todos: parsed.todos || defaultTodos,
        nextId: parsed.nextId || 4,   // 下一个新任务的编号（从 4 开始）
      }
    }
  } catch (e) {
    // 存档损坏等异常时不能崩溃，退回默认数据
    console.warn('读取存档失败，改用默认数据', e)
  }
  return { todos: defaultTodos, nextId: 4 }
}

// ---------- 3. 创建全局响应式状态（数据 + 一个自增计数器） ----------
// reactive：让普通对象变成"响应式"——任何属性被修改，用到它的
// 界面都会自动更新。这是 Vue 3 的核心机制。
const state = reactive(loadData())

// ---------- 4. 深度监听：数据一变，自动写回 localStorage ----------
// watch(要监听的东西, 变化后执行的函数, 选项)
// deep: true 表示"深层监听"——数组里某个任务的 completed 被改了
// 也能感知到（否则只能感知 state 本身被替换）。
watch(
  state,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)

// ---------- 5. 小工具函数 ----------
// 返回今天的日期字符串，如 '2026-09-21'
// toISOString() 得到 UTC 时间，slice(0,10) 截出 'YYYY-MM-DD'
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// 判断任务是否逾期：未完成 且 有截止日期 且 截止日期早于今天
// 用 export 导出，组件里可以直接 import 使用
export function isOverdue(todo) {
  return !todo.completed && !!todo.due && todo.due < todayStr()
}

// ---------- 6. 对外提供的操作方法（"增删改查"） ----------
// 组件通过 useTodos() 拿这组函数；返回 '' 表示成功，
// 返回其它字符串表示失败原因（方便界面直接提示用户）。
export function useTodos() {
  // 【增】添加任务
  function addTodo({ title, priority = '中', due = '' }) {
    title = (title || '').trim()            // 去掉首尾空格（空串也处理）
    if (!title) return '任务内容不能为空'    // 表单校验：必填
    // some(): 只要数组里有一个满足条件就返回 true —— 查重
    const duplicated = state.todos.some((t) => t.title === title)
    if (duplicated) return '已有相同任务，不要重复添加'
    // unshift() 插入到数组最前面 → 新任务显示在列表最上方
    state.todos.unshift({
      id: state.nextId++,                   // 用当前计数并自增，保证不重复
      title,
      priority,
      due,
      completed: false,
      createdAt: todayStr(),
    })
    return ''                               // '' = 成功
  }

  // 【改①】切换完成状态（勾选框用）
  function toggleTodo(id) {
    const todo = state.todos.find((t) => t.id === id)   // find: 找到第一个 id 匹配的
    if (todo) todo.completed = !todo.completed          // 取反
  }

  // 【改②】编辑任务（只更新传入的字段）
  function updateTodo(id, fields) {
    const idx = state.todos.findIndex((t) => t.id === id)
    if (idx !== -1) {
      // 展开旧对象，再用新字段覆盖 → 得到一个新对象替换进去
      state.todos[idx] = { ...state.todos[idx], ...fields }
    }
  }

  // 【删】删除单个任务
  function removeTodo(id) {
    const idx = state.todos.findIndex((t) => t.id === id)
    if (idx !== -1) state.todos.splice(idx, 1)          // splice: 从 idx 删除 1 个
  }

  // 【删】一键清空已完成任务
  function clearCompleted() {
    state.todos = state.todos.filter((t) => !t.completed)  // 只保留未完成的
  }

  // 把"状态 + 方法"打包返回，组件解构使用：
  //   const { state, addTodo } = useTodos()
  return { state, addTodo, toggleTodo, updateTodo, removeTodo, clearCompleted, todayStr }
}
