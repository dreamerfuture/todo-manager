/* ============================================================
   个人待办事项管理器 —— 原生 JavaScript 版
   ------------------------------------------------------------
   这个文件的全部逻辑都围绕一个循环：

       数据（todos 数组） → render() 渲染界面 → 用户操作 → 修改数据
                                              ↑                    ↓
                                              └──── save() 存本地 ←┘

   记住这个循环，你就读懂了整个项目：
   - 界面永远由数据"画"出来（render）
   - 用户点击时不直接改 HTML，而是改数据，然后重新 render()
   - 每次改完数据顺手 save() 到 localStorage
   ============================================================ */

/* ---------------- 1. 数据层 ---------------- */

const STORAGE_KEY = 'todo_manager_plain'  // localStorage 的键名

// 从本地读取任务；没有存档就返回示例数据
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)      // JSON 字符串 → 数组
  } catch (e) {
    console.warn('读取本地数据失败，使用示例数据', e)
  }
  return [
    { id: 1, title: '学习 HTML 基础标签', priority: '高', due: '', done: true, createdAt: '2026-09-07' },
    { id: 2, title: '完成 CSS 盒子模型练习', priority: '中', due: '2026-09-10', done: false, createdAt: '2026-09-08' },
    { id: 3, title: '用原生 JS 写一个待办清单', priority: '低', due: '', done: false, createdAt: '2026-09-09' }
  ]
}

// 把数据写回本地（每次修改数据后都要调用）
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

// 全局状态：任务数组、当前筛选、正在编辑的任务 id
let todos = loadTodos()
let filter = 'all'        // all（全部）| active（进行中）| done（已完成）
let editingId = null      // 为 null 表示当前没有任务处于编辑状态

/* ---------------- 2. 小工具函数 ---------------- */

// 今天的日期字符串，如 '2026-09-09'
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// 是否逾期：未完成 + 有截止日期 + 日期早于今天
function isOverdue(todo) {
  return !todo.done && !!todo.due && todo.due < todayStr()
}

// 转义 HTML 特殊字符：防止任务标题里写了 <script> 之类破坏页面（也避免标签被当代码执行）
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]))
}

// 优先级 → 颜色
const PRIORITY_COLOR = { 高: '#dc2626', 中: '#f59e0b', 低: '#16a34a' }

/* ---------------- 3. 渲染层：把数据画成界面 ---------------- */

// 根据当前筛选条件，取出要显示的任务
function getShownTodos() {
  if (filter === 'active') return todos.filter((t) => !t.done)
  if (filter === 'done') return todos.filter((t) => t.done)
  return todos
}

// 渲染"单条任务的浏览状态"（返回一段 li 的 HTML 字符串）
function viewRowHtml(todo) {
  const overdueClass = isOverdue(todo) ? ' overdue' : ''
  const doneClass = todo.done ? ' done' : ''
  const lineClass = todo.done ? ' line' : ''
  return `
    <li class="todo-item${doneClass}" data-id="${todo.id}">
      <label class="check">
        <input type="checkbox" data-act="toggle" ${todo.done ? 'checked' : ''} />
      </label>
      <span class="title${lineClass}">${escapeHtml(todo.title)}</span>
      <span class="tag" style="background:${PRIORITY_COLOR[todo.priority] || '#94a3b8'}">${todo.priority}</span>
      ${todo.due ? `<span class="due${overdueClass}">📅 ${todo.due}</span>` : ''}
      <div class="ops">
        <button class="btn-mini" data-act="edit">编辑</button>
        <button class="btn-mini danger" data-act="del">删除</button>
      </div>
    </li>`
}

// 渲染"单条任务的编辑状态"（输入框 + 下拉框 + 日期）
function editRowHtml(todo) {
  return `
    <li class="todo-item" data-id="${todo.id}">
      <input class="input edit-title" data-field="title" value="${escapeHtml(todo.title)}" />
      <select class="input edit-sel" data-field="priority">
        <option value="高" ${todo.priority === '高' ? 'selected' : ''}>高</option>
        <option value="中" ${todo.priority === '中' ? 'selected' : ''}>中</option>
        <option value="低" ${todo.priority === '低' ? 'selected' : ''}>低</option>
      </select>
      <input type="date" class="input edit-date" data-field="due" value="${todo.due || ''}" />
      <div class="ops">
        <button class="btn-mini ok" data-act="save">保存</button>
        <button class="btn-mini" data-act="cancel">取消</button>
      </div>
    </li>`
}

// 渲染列表
function renderList() {
  const list = document.querySelector('#list')
  const shown = getShownTodos()

  // 没有任务时显示空状态
  document.querySelector('#empty').style.display = shown.length === 0 ? 'block' : 'none'

  // 用 map 把每条任务转成 HTML 字符串，再交给 innerHTML 一次性写入
  list.innerHTML = shown
    .map((todo) => (todo.id === editingId ? editRowHtml(todo) : viewRowHtml(todo)))
    .join('')
}

// 渲染统计信息与进度条
function renderStats() {
  const total = todos.length
  const done = todos.filter((t) => t.done).length
  const active = total - done
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  document.querySelector('#statTotal').textContent = total
  document.querySelector('#statDone').textContent = done
  document.querySelector('#statActive').textContent = active
  document.querySelector('#statPercent').textContent = percent + '%'
  document.querySelector('#progressFill').style.width = percent + '%'

  document.querySelector('#countAll').textContent = total
  document.querySelector('#countDone').textContent = done
  document.querySelector('#countActive').textContent = active
}

// 渲染筛选按钮的选中样式
function renderTabs() {
  document.querySelectorAll('.tab').forEach((btn) => {
    // classList.toggle(类名, 条件)：条件为真就加上这个类，否则移除
    btn.classList.toggle('active', btn.dataset.filter === filter)
  })
}

// 总渲染：数据一变就调用它，界面自动与数据保持一致
function render() {
  renderStats()
  renderTabs()
  renderList()
}

/* ---------------- 4. 业务操作：改数据 → 存本地 → 重新渲染 ---------------- */

// 显示提示文字（成功=绿，失败=红）；2 秒后自动消失
let tipTimer = null
function showTip(message, isError) {
  const tip = document.querySelector('#tip')
  tip.textContent = message
  tip.className = isError ? 'tip error' : 'tip'
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => { tip.textContent = '' }, 2000)
}

// 新增任务（含表单校验）
function addTodo() {
  const titleInput = document.querySelector('#titleInput')
  const title = titleInput.value.trim()               // trim() 去掉首尾空格

  if (!title) { showTip('任务内容不能为空', true); return }          // 校验①：必填
  if (todos.some((t) => t.title === title)) {                        // 校验②：查重
    showTip('已有相同任务，不要重复添加', true)
    return
  }

  todos.unshift({                                     // unshift：新任务放到最前面
    id: Date.now(),                                   // 用时间戳当唯一 id
    title: title,
    priority: document.querySelector('#priorityInput').value,
    due: document.querySelector('#dueInput').value,
    done: false,
    createdAt: todayStr()
  })

  titleInput.value = ''                               // 清空输入框
  document.querySelector('#dueInput').value = ''
  titleInput.focus()
  showTip('添加成功 ✔', false)

  saveTodos()
  render()
}

// 勾选 / 取消完成
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (!todo) return
  todo.done = !todo.done
  saveTodos()
  render()
}

// 删除单条
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id)
  if (editingId === id) editingId = null
  saveTodos()
  render()
}

// 清空所有已完成
function clearDone() {
  if (!todos.some((t) => t.done)) { showTip('没有已完成的任务', true); return }
  if (!confirm('确定清空所有已完成任务吗？')) return
  todos = todos.filter((t) => !t.done)
  saveTodos()
  render()
}

// 进入编辑状态
function startEdit(id) {
  editingId = id
  render()                                  // 重新渲染时该条会变成输入框
}

// 取消编辑
function cancelEdit() {
  editingId = null
  render()
}

// 保存编辑：从正在编辑的那一行里读出三个字段
function saveEdit(id) {
  const row = document.querySelector(`li[data-id="${id}"]`)
  if (!row) return
  const title = row.querySelector('[data-field="title"]').value.trim()
  if (!title) { showTip('任务内容不能为空', true); return }

  const todo = todos.find((t) => t.id === id)
  if (todo) {
    todo.title = title
    todo.priority = row.querySelector('[data-field="priority"]').value
    todo.due = row.querySelector('[data-field="due"]').value
  }
  editingId = null
  saveTodos()
  render()
}

// 切换筛选条件
function setFilter(value) {
  filter = value
  render()
}

/* ---------------- 5. 绑定事件（用户操作 → 调用上面的函数） ---------------- */

// 新增：点击按钮
document.querySelector('#addBtn').addEventListener('click', addTodo)

// 新增：在标题输入框按回车
document.querySelector('#titleInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo()
})

// 列表区域：用"事件委托"只绑定一次，同时处理勾选/删除/编辑/保存/取消
document.querySelector('#list').addEventListener('click', (e) => {
  const li = e.target.closest('li')          // 找到被点击元素所在的 li
  if (!li) return
  const id = Number(li.dataset.id)           // dataset 读取 data-id（字符串要转数字）
  const act = e.target.dataset.act           // 点击的是哪个按钮

  if (act === 'toggle') toggleTodo(id)
  else if (act === 'del') deleteTodo(id)
  else if (act === 'edit') startEdit(id)
  else if (act === 'save') saveEdit(id)
  else if (act === 'cancel') cancelEdit()
})

// 勾选框用的是 change 事件（不是 click）
document.querySelector('#list').addEventListener('change', (e) => {
  if (e.target.dataset.act !== 'toggle') return
  const li = e.target.closest('li')
  if (li) toggleTodo(Number(li.dataset.id))
})

// 编辑状态下：输入框按回车=保存，按 Esc=取消
document.querySelector('#list').addEventListener('keydown', (e) => {
  const li = e.target.closest('li')
  if (!li) return
  const id = Number(li.dataset.id)
  if (e.key === 'Enter') saveEdit(id)
  if (e.key === 'Escape') cancelEdit()
})

// 筛选标签
document.querySelector('.tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab')
  if (btn) setFilter(btn.dataset.filter)
})

// 清空已完成
document.querySelector('#clearDoneBtn').addEventListener('click', clearDone)

/* ---------------- 6. 启动 ---------------- */
render()   // 页面第一次渲染：把数据画到界面上
