module.exports = {
  env: {
    browser: false,
    es6: true,
    jest: true,
  },
  extends: ["airbnb-base", "plugin:jest/all"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["jest"],
  rules: {
    "max-classes-per-file": "off",
    "no-underscore-dangle": "off",
    "no-console": "off",
    "no-shadow": "off",
    "no-restricted-syntax": ["error", "LabeledStatement", "WithStatement"],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never", // Change the default value of "always" to "never"
      },
    ],
    "jest/require-hook": "off", // Disable the jest/require-hook rule
  },
  overrides: [
    {
      files: ["*.js"],
      excludedFiles: "babel.config.js",
    },
  ],
};
