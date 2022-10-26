module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  'plugins': [
    'react',
    'react-hooks',
    'jsx-a11y',
    '@typescript-eslint'
  ],
  'parser': '@typescript-eslint/parser', // 使用ts-eslint规则,详情https://typescript-eslint.io/rules/
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'globals': {
    'NodeJS': 'readonly'
  },
  /**
   * "off" 或 0 - 关闭规则
   * "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出),
   * "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
   */
  'rules': {
    'react/jsx-max-props-per-line': [1, { 'maximum': 1, 'when': 'multiline' }],
    'react/jsx-first-prop-new-line': [1, 'multiline-multiprop'],
    'react/jsx-wrap-multilines': [1, {
      'declaration': 'parens-new-line',
      'assignment': 'parens-new-line',
      'return': 'parens-new-line',
      'arrow': 'parens-new-line',
      'condition': 'parens-new-line',
      'logical': 'parens-new-line',
      'prop': 'parens-new-line'
    }],
    'accessor-pairs': 1, // getter与setter必须同时存在
    'arrow-spacing': [1, { // 箭头前后加空格
      'before': true,
      'after': true
    }],
    'block-spacing': [1, 'always'], // 标记块前后需加空格
    'brace-style': [1, '1tbs', { // 函数()与{}不许换行
      'allowSingleLine': true
    }],
    'comma-dangle': [1, 'only-multiline'], // 允许最后一个属性无逗号
    'comma-spacing': [1, { // 在逗号前后不允许有空格
      'before': false,
      'after': true
    }],
    'curly': [1, 'multi-line'], // 花括号行内可省略，块级必须加花括号
    'dot-location': [1, 'property'], // 在点之前和之后强制换行
    'eol-last': 1, // 在文件末尾要求或禁止换行
    'eqeqeq': [2, 'allow-null'], // 使用全等
    'indent': [1, 2, { // 缩进规则，2空格，switchcase后 1个空格
      'SwitchCase': 1
    }],
    'key-spacing': [1, { // 键间距
      'beforeColon': false, // 不允许在对象文字中的键和冒号之间使用空格，a: 1 而不是 a : 1
      'afterColon': true // 键值后需要空格a: 1, 而不是a:1
    }],
    'keyword-spacing': [1, { // 关键字前后都要空格 if() {} else {}
      'before': true,
      'after': true
    }],
    'new-parens': 1, // 不带参数（新括号）调用构造函数时需要括号
    'operator-linebreak': [1, 'after', { // 对操作员实施一致的换行符样式
      'overrides': {
        '?': 'before', // 三元运算换行时，第一行为条件语句，第二行以?开头，第三行以:开头
        ':': 'before'
      }
    }],
    'quotes': [1, 'single', { // 强制使用引号，双引号或单引号（引号）的一致使用
      'avoidEscape': true,
      'allowTemplateLiterals': true
    }],
    'semi': [1, 'never'], // 不用分号
    'semi-spacing': [1, { // 在分号之前和之后加强间距
      'before': false,
      'after': true
    }],
    'object-curly-spacing': [1, // 大括号间距, 两边必有空格
      'always',
      {
        'objectsInObjects': false,
        'arraysInObjects': true
      }],
    'spaced-line-comment': [0, 'always'], // 注释后面需加一个空格
    'space-before-blocks': [1, 'always'], // 要求或禁止在块前加空格
    'space-before-function-paren': [1, 'never'], // 函数括号前需要或不允许空格，
    'space-in-parens': [1, 'never'], // 禁止或在括号内使用空格，
    'space-infix-ops': 1, // 要求在中缀运算符之间加空格
    'space-unary-ops': [1, { // 一元运算符之前或之后需要空格或不允许空格
      'words': true,
      'nonwords': false
    }],
    'spaced-comment': [1, 'always', { // 要求或不允许以空格（制表符或制表符）开头的注释
      'markers': ['global', 'globals', 'eslint', 'eslint-disable', '*package', '!', ',', ' ']
    }],
    'template-curly-spacing': [1, 'always'], // 在模板字符串中强制使用间距
    'use-isnan': 2, // isNaN()检查时需要调用NaN
    'valid-typeof': 2, // 强制比较typeof表达式与有效字符串
    'wrap-iife': [1, 'any'], // 要求将IIFE包裹起来
    'yield-star-spacing': [1, 'both'], // 强制间距围绕*在yield*表达式
    'yoda': [1, 'never'], // 要求或禁止Yoda条件
    'prefer-const': 1, // 不改变的变量建议使用const
    'array-bracket-newline': [1, 'consistent'], // 要求数组开始结束符格式一致
    'array-bracket-spacing': [1, 'never'], // 禁止在方括号内两侧加空格
    'array-callback-return': 1, // 回调函数必须写return
    'arrow-body-style': [1, 'as-needed', { // 箭头函数简略写法
      'requireReturnForObjectLiteral': true
    }],
    'computed-property-spacing': [1, 'always'], // 计算属性括号内需要一个或多个空格
    'default-case': 0, // 要求switch语句必须有default
    'for-direction': 1, // 禁止死循环
    'function-paren-newline': 1, // 函数圆括号内，除了函数，否则不允许换行
    'getter-return': 1, // get必须有返回
    'global-require': 0, // 防止require同步加载挂掉问题，必须在头部使用
    'implicit-arrow-linebreak': 1, // 在箭头函数体之前不允许换行
    'lines-between-class-members': 1, // class内函数需要空行
    'newline-after-var': 1, // 声明后必须换行
    'func-call-spacing': [1, 'never'], // 禁止函数名称和调用它的左括号之间的空格, function a() {} ，a与括号之间无空格
    'multiline-ternary': [1, 'always-multiline'], // 如果表达式跨越多行，则在三元表达式的操作数之间强制执行换行符
    'one-var': [1, { // 强制变量在函数中一起声明或一起声明
      'initialized': 'never'
    }],
    'no-unused-vars': 1, // 禁止未使用变量
    'no-console': 0, // 警告console
    'no-debugger': 1, // 禁止使用debugger
    'no-array-constructor': 1, // 禁止使用Array构造函数,统一使用[]
    'no-class-assign': 1, // 禁止修改类声明的变量
    'no-cond-assign': 1, // 在条件语句中禁止赋值运算符
    'no-const-assign': 2, // 禁止修改使用const声明的变量
    'no-delete-var': 2, // 禁止删除变量
    'no-dupe-args': 2, // 禁止在function定义中使用重复的参数
    'no-dupe-class-members': 2, // 禁止使用重复名称
    'no-dupe-keys': 2, // 禁止在对象文字中使用重复键
    'no-duplicate-case': 2, // 禁止重复case
    'no-empty-character-class': 1, // 禁止在正则表达式中使用空字符类,用转义字符代替
    'no-empty-pattern': 1, // 禁止使用空的销毁模式
    'no-extra-bind': 1, // 禁止不必要的功能绑定
    'no-extra-boolean-cast': 1, // 禁止不必要的布尔类型转换
    'no-extra-parens': [1, 'functions'], // 禁止不必要的括号
    'no-fallthrough': 1, // 禁止案例陈述失败
    'no-floating-decimal': 1, // 禁止浮动小数
    'no-func-assign': 2, // 禁止重新分配function声明
    'no-irregular-whitespace': 1, // 禁止不规则空格
    'no-label-var': 2, // 禁止使用标签作为变量名
    'no-labels': [2, { // break并continue禁止多重循环
      'allowLoop': false,
      'allowSwitch': false
    }],
    'no-lone-blocks': 2, // 禁止不必要的嵌套块
    'no-mixed-spaces-and-tabs': 1, // 不允许同时使用缩进的空格和制表符进行缩进
    'no-multi-spaces': 1, // 禁止多个空格
    'no-multi-str': 2, // 禁止多行字符串, es6语法(``)可以
    'no-multiple-empty-lines': [1, { // 最多一行空行
      'max': 1
    }],
    'no-regex-spaces': 1, // 禁止在正则表达式文字中使用多个空格
    'no-return-assign': [2, 'except-parens'], // 禁止在return语句中进行赋值
    'no-self-compare': 2, // 禁止自我比较 a === a
    'no-sequences': 2, // 禁止使用逗号运算符
    'no-shadow-restricted-names': 2, // 禁止对一些关键字或者保留字进行赋值操作，比如NaN、Infinity、undefined、eval、arguments等
    'no-sparse-arrays': 1, // 禁止稀疏数组
    'no-throw-literal': 1, // 限制可以作为异常抛出的内容
    'no-this-before-super': 1, // super()执行后调用this
    'no-trailing-spaces': 1, // 在行尾禁止尾随空格
    'no-undef': 2, // 禁止未声明的变量
    'no-undef-init': 0, // 禁止初始化为未定义
    'no-unexpected-multiline': 2, // 禁止混淆多行表达式
    'no-unmodified-loop-condition': 2, // 禁止未经修改的循环条件
    'no-unneeded-ternary': [1, { // 存在更简单的选择时禁止三元运算符
      'defaultAssignment': false
    }],
    'no-unsafe-finally': 2, // 禁止以finally块为单位的控制流语句
    'no-useless-call': 1, // 禁止不必要的.call()和.apply()
    'no-useless-computed-key': 1, // 禁止在对象上使用不必要的计算属性键
    'no-useless-constructor': 1, // 禁止不必要的构造函数
    'no-useless-concat': 1, // 禁止不必要的连接符
    'no-whitespace-before-property': 1, // 禁止在属性前使用空格
    'no-with': 2, // 禁止with
    'no-var': 1, // 禁止使用var
    'no-alert': 1, // 禁止使用alert
    'no-bitwise': 1, // 禁止使用按位运算符
    'no-duplicate-imports': 1, // import同一模块需在同行编写
    'no-empty-function': 0, // 允许空函数
    'no-negated-condition': 0, // 禁止无效的反向判断
    'no-return-await': 0, // async函数中禁止return await
    'no-undefined': 0, // 禁止使用undefined，用null替代
    'no-case-declarations': 0, // case里可以执行逻辑
  }
}
