// ============================================================
// Vite 配置文件
// Vite 是"构建工具 + 开发服务器"，负责把 Vue 文件编译成浏览器能
// 运行的代码。这里只需要告诉它：项目里用到了 Vue 插件。
// 更多配置（改端口、打包路径等）以后需要时再查官方文档添加。
// ============================================================
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],          // 启用 .vue 单文件组件编译
})
