module.exports = {
  "extends": [
    "stylelint-config-standard",                // css 标准规则
    'stylelint-config-recess-order'
  ],
  "plugins": ["stylelint-scss"],                // sass配置
  "rules": {
    "at-rule-no-unknown": null,                 // 忽略sass @报错问题
    "selector-type-no-unknown": null,
    "selector-pseudo-element-no-unknown": null,
    "selector-pseudo-class-no-unknown": null,   // 未知选择器
    "scss/at-rule-no-unknown": true,
    "color-hex-length": "long",                 // 16进制长度
    "string-quotes": "single",                  // 单引号
  }
}