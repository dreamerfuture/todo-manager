<template>
  <!-- 新增任务卡片：表单区域 -->
  <section class="card input-card">
    <h2>＋ 新建任务</h2>

    <!-- v-model 双向绑定：
         用户在输入框打字 → title 变量自动更新；
         title 变量被代码修改 → 输入框自动显示新值。
         @keyup.enter 表示按回车键时触发 submit() -->
    <div class="row">
      <input
        ref="titleInput"
        v-model="title"
        type="text"
        class="input title-input"
        placeholder="要做什么？（必填）"
        @keyup.enter="submit"
      />
      <select v-model="priority" class="input sel" title="优先级">
        <option value="高">🔴 高优先级</option>
        <option value="中">🟠 中优先级</option>
        <option value="低">🟢 低优先级</option>
      </select>
      <!-- type="date" 是浏览器自带的日期选择控件 -->
      <input v-model="due" type="date" class="input date" title="截止日期（可选）" />
      <button class="btn btn-primary" @click="submit">添加</button>
    </div>

    <!-- 校验提示：成功绿色、失败红色。v-if 控制是否显示 -->
    <p v-if="tip" class="tip" :class="{ error: isError }">{{ tip }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useTodos } from '../store/todos'

// 从 store 解构出"添加任务"方法。
// 注意：虽然每个组件都调 useTodos()，但拿到的是同一个模块单例。
const { addTodo } = useTodos()

// ---- 三个表单字段的响应式变量（初始值） ----
const title = ref('')
const priority = ref('中')
const due = ref('')

// ref(null)：用来"抓住"输入框 DOM，稍后让它重新获得焦点
const titleInput = ref(null)

// 提示文字 与 是否错误（决定文字颜色）
const tip = ref('')
const isError = ref(false)

function submit() {
  // 真正的校验放在 store 里（集中管理），这里只负责展示结果
  const err = addTodo({ title: title.value, priority: priority.value, due: due.value })

  if (err) {
    // 校验失败：显示红色错误信息
    tip.value = err
    isError.value = true
    return
  }

  // 添加成功：清空表单、显示成功提示、让输入框重新获得焦点
  title.value = ''
  due.value = ''
  tip.value = '添加成功 ✔'
  isError.value = false
  titleInput.value?.focus()   // 可选链 ?. ：输入框存在才调用

  // 2 秒后自动清掉成功提示，避免一直挂在页面上
  window.setTimeout(() => {
    if (!isError.value) tip.value = ''
  }, 2000)
}
</script>

<!-- scoped 样式只影响本组件 -->
<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(30, 45, 61, 0.06);
}
.input-card h2 { font-size: 16px; color: #1f2d3d; margin-bottom: 14px; }
.row { display: flex; gap: 10px; flex-wrap: wrap; }

.input {
  padding: 10px 12px;
  border: 1px solid #d5dbe4;
  border-radius: 8px;
  font-size: 14px;
  outline: none;               /* 去掉浏览器默认的聚焦黑框 */
}
.input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }

.title-input { flex: 1; min-width: 180px; }   /* 标题输入框尽量占满剩余宽度 */
.sel { width: 128px; }
.date { width: 150px; }

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  transition: background 0.2s;
}
.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }

.tip { margin-top: 10px; font-size: 13px; color: #16a34a; }
.tip.error { color: #dc2626; }
</style>
