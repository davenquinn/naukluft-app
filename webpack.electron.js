const path = require("path");
const merge = require('webpack-merge');
const {IgnorePlugin} = require('webpack');
const {
  coffeeRule,
  sqlRule,
  stylusRule,
  resolve
} = require('./loaders');
const {version} = require("electron/package.json");

const modifyConfig = (cfg)=>{

  cfg.module.rules = [
    ...cfg.module.rules,
    coffeeRule,
    sqlRule,
    stylusRule
  ];

  cfg.resolve = merge(cfg.resolve, resolve);

  // Modify javascript rule for typescript
  jsRule = cfg.module.rules[0]
  jsRule.test = /\.(js|jsx|ts|tsx)$/
  jsRule.use.options.presets = [
    ["@babel/preset-env", {modules: false, targets: {electron: version}}],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]

  jsRule.use.options.plugins = [
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-class-properties"
  ]

  console.log(jsRule, JSON.stringify(cfg.module.rules, null, 4));

  return cfg
}

module.exports = modifyConfig;
