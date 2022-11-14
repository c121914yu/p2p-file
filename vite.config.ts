import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp'
import antdStyles from './src/styles/antd.cjs'
import path from 'path'

function resolve(url) {
  return path.resolve(__dirname, url)
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './')

  return {
    mode,
    server: {
      port: 4000,
      host: '0.0.0.0',
      // open: true,
      proxy: {
        '/api': {
          target: 'https://open.ahapocket.cn',
          changeOrigin: true,
        }
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    base: mode === 'development' ? './' : `${ env.VITE_APP_ROOT }`, // 生产环境要绝对路径，否则子应用无法找到
    build: {
      assetsDir: './'
    },
    resolve: { // 配置路径别名
      alias: {
        '@': resolve('./src'),
      },
    },
    css: { // css配置
      // 开启 css 的 SourceMap
      devSourcemap: true,
      preprocessorOptions: {
        scss: { // 全局scss注入
          additionalData: `
            @use "@/styles/index.scss" as *;
          `
        },
        less: { // 自定义antd样式
          javascriptEnabled: true,
          modifyVars: antdStyles,
        },
      }
    },
    plugins: [
      react(),
      vitePluginImp({
        libList: [
          {
            libName: 'antd',
            style: (name) => `antd/es/${ name }/style`,
          },
        ],
      })
    ],
  }
})
