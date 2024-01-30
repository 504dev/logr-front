module.exports = {
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    parser: '@babel/eslint-parser',
    babelOptions: {
      parserOpts: {
        plugins: ["jsx"]
      }
    }
  },
  rules: {
    'vue/multi-word-component-names': 'off'
  }
}
