import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
import outputManifest from 'rollup-plugin-output-manifest'
import { babel } from '@rollup/plugin-babel'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const isDev = process.env.NODE_ENV === 'dev'

export default {
  input: './src/client/index.tsx',
  output: {
    dir: 'dist/bundle',
    entryFileNames: isDev ? 'bundle.js' : 'bundle.[hash].js',
    format: 'esm'
  },
  plugins: [
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions,
      exclude: '**/node_modules/**'
    }),
    nodeResolve({
      extensions
    }),
    !isDev ? terser() : undefined,
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    outputManifest({
      publicPath: '/bundle/'
    })
  ]
}