module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module"
    },
    env: {
        es6: true,
        browser: true,
        jest: true
    },
    rules: {
        "prettier/prettier": "error",
        "no-unused-vars": 2,
        "no-undef": 2,
        "no-console": 0,
        "eqeqeq": 2,
        "guard-for-in": 2,
        "no-extend-native": 2,
        "wrap-iife": 2,
        "new-cap": 2,
        "no-caller": 2,
        "no-multi-str": 0,
        "dot-notation": 0,
        "semi": [2, "always"],
        "strict": [2, "global"],
        "valid-jsdoc": 0,
        "no-irregular-whitespace": 1,
        "no-multi-spaces": 2,
        "one-var": [2, "never"],
        "constructor-super": 2,
        "no-this-before-super": 2,
        "no-var": 2,
        "prefer-const": 1,
        "no-const-assign": 2,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-member-accessibility": 0,
        "indent": ["error", 2]
    },
    globals: {
        require: false,
        module: false,
        exports: false
    }
}
