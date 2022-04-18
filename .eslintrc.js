 module.exports = {
  root: true,

  parser: '@typescript-eslint/parser', // 指定ESLint解析器

  extends: [
    'plugin:@typescript-eslint/recommended',
    "prettier"
  ],
  "plugins": [
    "prettier"
  ],

  rules: {
    quotes: ['error', 'single'], //强制使用单引号
    semi: ['error', 'never'], //强制不使用分号结尾
    'comma-dangle': ['error', 'always-multiline'], // 逗号结束
    'no-param-reassign': 'error', // 禁止对 function 的参数进行重新赋值
    'prettier/prettier': 'error', // prettier
    'prefer-rest-params': 0,

    '@typescript-eslint/no-explicit-any': 0, // 禁用 any 类型
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-non-null-assertion': 0, // 是否禁用非空断言
  },
}
