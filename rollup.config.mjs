
// // 告诉 rollup 他要打包什么
// export default {
//     // 源代码的入口是哪个文件
//     input: 'dist/main.js',
//     output: {
//         // 输出到哪个文件
//         file: 'dist/dist/main.js',
//         format: 'cjs',
//         sourcemap: true,
//     }
// };



// rollup.config.mjs
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.ts', // 单入口
  output: {
    file: 'dist.js', // 输出单个 JS 文件
    format: 'cjs', // 最终输出为 CommonJS 格式
    sourcemap: true // 可选：生成源码映射，方便调试
  },
  plugins: [
    resolve(), // 解析 node_modules 依赖
    typescript(), // 编译 TS 为 JS（使用 tsconfig.json 配置）
    commonjs() // 转换 CommonJS 依赖为 ES 模块，确保 Rollup 能处理
  ]
};