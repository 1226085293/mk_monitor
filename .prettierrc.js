// .prettierrc.js
module.exports = {
    /**
     *  一行最多 120 字符
     */
    printWidth: 120,
    /**
     * 使用 4 个空格缩进
     */
    tabWidth: 4,
    // 不使用缩进符，而使用空格
    useTabs: false,
    // 行尾需要有分号
    semi: true,
    // 使用单引号
    singleQuote: true,
    /**
     * 对象属性的引号使用
     * as-needed 仅在需要的时候使用
     * consistent 有一个属性需要引号，就都需要引号
     * preserve 保留用户输入的情况
     */
    quoteProps: 'as-needed',
    /**
     * 对象属性的尾随逗号,最后一个属性后是否需要加逗号
     * none 末尾没有逗号
     * es5 es5有效的地方保留
     * all 在可能的地方都加上逗号
     */
    trailingComma: 'none',
    /**
     * 字面量对象括号中的空格，默认true
     * true - Example: { foo: bar }
     * false - Example: {foo: bar}
     */
    bracketSpacing: true,
    /**
     * 箭头函数中的括号
     * “avoid” - 在有需要的时候使用. Example: x => x
     * “always” - 一直使用. Example: (x) => x
     */
    arrowParens: 'always',
    // 每个文件格式化的范围是文件的全部内容
    rangeStart: 0,
    rangeEnd: Infinity,
    /**
     * 折行标准 preserve,always
     */
    proseWrap: 'always',
    /**
     * 行末尾标识
     * “auto”,“lf”,“crlf”,“cr”
     */
    endOfLine: 'lf',
    // 格式化内嵌代码
    embeddedLanguageFormatting: 'auto'
};
