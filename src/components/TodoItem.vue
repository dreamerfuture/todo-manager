<template>
  <!-- 单条任务（渲染在 <li> 里的组件也要包一层 li？不需要：
       这里直接用 <li> 作为根元素，正好充当列表项） -->
  <li class="todo-item" :class="{ done: todo.completed }">
    <!-- ① 勾选框：点击切换完成状态
         :checked 根据数据决定是否打勾（单向显示）
         @change 变化时通知父组件（用 $emit 触发 toggle 事件，参数是 id） -->
    <label class="check" :title="todo.completed ? '点击设为未完成' : '点击标记完成'">
      <input type="checkbox" :checked="todo.completed" @change="$emit('toggle', todo.id)" />
    </label>

    <!-- ② 浏览模式（不编辑时显示） -->
    <template v-if="!editing">
      <span class="title" :class="{ line: todo.completed }">{{ todo.title }}</span>
      <span class="tag" :style="{ background: pColor[todo.priority] || '#94a3b8' }">
        {{ todo.priority }}
      </span>
      <span v-if="todo.due" class="due" :class="{ overdue }">📅 {{ todo.due }}</span>

      <div class="ops">
        <button class="btn-mini" @click="startEdit">编辑</button>
        <button class="btn-mini danger" @click="$emit('remove', todo.id)">删除</button>
      </div>
    </template>

    <!-- ③ 编辑模式：行内变成输入框 + 下拉框 + 日期 -->
    <template v-else>
      <input v-model="editForm.title" class="input edit-title" placeholder="任务内容"
        @keyup.enter="save" @keyup.esc="cancel" />
      <select v-model="editForm.priority" class="input edit-sel">
        <option value="高">高</option>
        <option value="中">中</option>
        <option value="低">低</option>
      </select>
      <input v-model="editForm.due" type="date" class="input edit-date" />
      <div class="ops">
        <button class="btn-mini ok" @click="save">保存</button>
        <button class="btn-mini" @click="cancel">取消</button>
      </div>
    </template>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue'
// 工具函数也可以从 store 单独导出给组件用（它不依赖 state）
import { isOverdue as checkOverdue } from '../store/todos'

// defineProps：声明"父组件会传给我哪些属性"（这里是单个任务对象）
const props = defineProps({
  todo: { type: Object, required: true },
})

// defineEmits：声明"我可能会通知父组件哪些事件"
// 后面 $emit('toggle', ...) 等都要在清单里，便于排查
const emit = defineEmits(['toggle', 'remove', 'save'])

// ---- 编辑状态 ----
const editing = ref(false)                 // 是否处于编辑模式
const editForm = ref({ title: '', priority: '中', due: '' })  // 编辑框的临时值

// 是否逾期（只读展示，computed 依赖 todo.due）
const overdue = computed(() => checkOverdue(props.todo))

// 优先级 → 颜色（映射表：对象用键取值）
const pColor = { 高: '#dc2626', 中: '#f59e0b', 低: '#16a34a' }

function startEdit() {
  // 进入编辑前，把当前值拷贝到 editForm（不能直接改 props）
  editForm.value = { title: props.todo.title, priority: props.todo.priority, due: props.todo.due }
  editing.value = true
}

function save() {
  const title = (editForm.value.title || '').trim()
  if (!title) {
    alert('任务内容不能为空')
    return
  }
  // 把修改结果"上报"给父组件，由父组件调用 store 真正保存
  emit('save', { id: props.todo.id, title, priority: editForm.value.priority, due: editForm.value.due })
  editing.value = false
}

function cancel() {
  editing.value = false   // 只是放弃编辑，不改数据
}
</script>

<style scoped>
/* 单条任务的布局：勾选框 + 内容 + 右侧按钮，一行排开 */
.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #edf0f5;
  margin-bottom: 8px;
  transition: all 0.2s;
}
.todo-item:hover { border-color: #c7d4e6; background: #fafcff; }
/* 已完成任务的整行样式（配合 :class="{ done }"） */
.todo-item.done { background: #f6f8fb; }

.check input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #16a34a;   /* 让复选框显示绿色 */
}

.title {
  font-size: 15px;
  color: #1f2d3d;
  word-break: break-all;   /* 超长文字换行 */
}
/* 完成的文字：划线 + 变灰 */
.line { text-decoration: line-through; color: #9aa7b8; }

.tag {
  flex-shrink: 0;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}
.due { flex-shrink: 0; font-size: 13px; color: #7a8699; }
.due.overdue { color: #dc2626; font-weight: 600; }   /* 逾期标红加粗 */

.ops { margin-left: auto; display: flex; gap: 8px; flex-shrink: 0; }
.btn-mini {
  border: none;
  background: none;
  color: #3b82f6;
  font-size: 13px;
  padding: 4px 6px;
  border-radius: 6px;
}
.btn-mini:hover { background: #eaf2fe; }
.btn-mini.danger { color: #dc2626; }
.btn-mini.danger:hover { background: #feecec; }
.btn-mini.ok { color: #16a34a; }
.btn-mini.ok:hover { background: #e7f7ec; }

/* 编辑模式里的控件 */
.input {
  padding: 7px 10px;
  border: 1px solid #d5dbe4;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.input:focus { border-color: #3b82f6; }
.edit-title { flex: 1; min-width: 160px; }
.edit-sel { width: 76px; }
.edit-date { width: 150px; }
</style>
