import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/json-refactor.umd.js',
      format: 'umd',
      name: 'jsonRefactor',
      sourcemap: true,
    },
    {
      file: 'dist/json-refactor.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    babel(),
  ],
}