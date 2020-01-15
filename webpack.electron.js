const path = require("path");
const merge = require('webpack-merge');
const {IgnorePlugin} = require('webpack');
const {
  coffeeRule,
  sqlRule,
  stylusRule,
  resolve
} = require('./loaders');

const modifyConfig = (cfg)=>{

  cfg.module.rules = [
    ...cfg.module.rules,
    coffeeRule,
    sqlRule,
    stylusRule
  ];

  cfg.resolve = merge(cfg.resolve, resolve);
  console.log(cfg);
  return cfg
}

module.exports = modifyConfig;
