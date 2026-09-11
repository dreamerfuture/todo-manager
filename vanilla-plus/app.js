const KEY = 'todo_plus'
let todos = JSON.parse(localStorage.getItem(KEY) || '[]')
let filter = 'all'
let editing = null
let keyword = ''
let sortBy = 'default'

const save = () => localStorage.setItem(KEY, JSON.stringify(todos))
const today = () => new Date().toISOString().slice(0, 10)
const over = (t) => !t.done && t.due && t.due < today()
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function render() {

  const rank = { 高: 0, 中: 1, 低: 2 }
  let shown = todos.filter((t) => filter === 'all' || (filter === 'active' ? !t.done : t.done))
  if (keyword) shown = shown.filter((t) => t.title.includes(keyword))
  if (sortBy === 'priority') shown = [...shown].sort((a, b) => rank[a.priority] - rank[b.priority])
  if (sortBy === 'due') shown = [...shown].sort((a, b) => (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31'))

  document.getElementById('list').innerHTML = shown.map((t) => `<li class="todo-item ${t.done ? 'done' : ''}" data-id="${t.id}">${
    editing === t.id
      ? `<input class="input edit-title" data-f="title" value="${esc(t.title)}">
         <select class="input edit-sel" data-f="priority">${['高', '中', '低'].map((p) => `<option ${p === t.priority ? 'selected' : ''}>${p}</option>`).join('')}</select>

         <input class="input" type="date" data-f="due" value="${t.due}">
         <div class="ops"><button class="btn-mini ok" data-a="save">保存</button><button class="btn-mini" data-a="cancel">取消</button></div>`

      : `<input type="checkbox" data-a="toggle" ${t.done ? 'checked' : ''}>
         <span class="title ${t.done ? 'line' : ''}">${esc(t.title)}</span>
         <span class="tag" data-p="${t.priority}">${t.priority}</span>
         ${t.due ? `<span class="due ${over(t) ? 'over' : ''}">📅 ${t.due}</span>` : ''}

         <div class="ops"><button class="btn-mini" data-a="edit">编辑</button><button class="btn-mini danger" data-a="del">删除</button></div>`

  }</li>`).join('')

  document.getElementById('empty').style.display = shown.length ? 'none' : 'block'

  const done = todos.filter((t) => t.done).length
  const percent = todos.length ? Math.round(done / todos.length * 100) : 0
  document.getElementById('sTotal').textContent = todos.length
  document.getElementById('sDone').textContent = done
  document.getElementById('sActive').textContent = todos.length - done
  document.getElementById('sPercent').textContent = percent + '%'
  document.getElementById('bar').style.width = percent + '%'
  document.getElementById('date').textContent = today()

  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.f === filter))
}

function add() {
  const el = document.getElementById('t')
  const title = el.value.trim()
  if (!title) return tip('任务内容不能为空', true)
  if (todos.some((t) => t.title === title)) return tip('已有相同任务，不要重复添加', true)

  todos.unshift({ id: Date.now(), title, priority: document.getElementById('p').value, due: document.getElementById('d').value, done: false })
  el.value = ''
  document.getElementById('d').value = ''
  tip('添加成功 ✔', false)
  save(); render()
}

function setFilter(f) { filter = f; render() }

function setKeyword(v) { keyword = v.trim(); render() }

function setSort(v) { sortBy = v; render() }

function clearDone() {
  if (!confirm('确定清空所有已完成任务吗？')) return
  todos = todos.filter((t) => !t.done)
  save(); render()
}

function tip(msg, isError) {
  const el = document.getElementById('tip')
  el.textContent = msg
  el.className = isError ? 'tip error' : 'tip'
  setTimeout(() => { el.textContent = '' }, 2000)
}

document.getElementById('list').addEventListener('click', (e) => {
  const li = e.target.closest('li')
  if (!li) return
  const t = todos.find((x) => x.id == li.dataset.id)
  const a = e.target.dataset.a

  if (a === 'toggle') { t.done = !t.done; save(); render() }
  if (a === 'del') { todos = todos.filter((x) => x !== t); save(); render() }
  if (a === 'edit') { editing = t.id; render() }
  if (a === 'cancel') { editing = null; render() }
  if (a === 'save') {
    const v = (f) => li.querySelector(`[data-f="${f}"]`).value
    const title = v('title').trim()
    if (!title) return tip('任务内容不能为空', true)
    t.title = title; t.priority = v('priority'); t.due = v('due')
    editing = null; save(); render()
  }
})

document.querySelector('.tabs').addEventListener('click', (e) => {
  const b = e.target.closest('.tab')
  if (b) setFilter(b.dataset.f)
})

render()
