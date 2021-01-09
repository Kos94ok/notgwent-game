module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'linebreak-style': ['error', 'unix'],
		'no-tabs': 'off',
		'no-trailing-spaces': 'off',
		'object-curly-spacing': 'off',
		'no-case-declarations': 'off',
		'space-before-function-paren': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/member-delimiter-style': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-member-accessibility': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
	},
}
