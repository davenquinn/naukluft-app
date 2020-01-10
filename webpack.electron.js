const path = require("path");
const merge = require('webpack-merge');
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
  console.log(JSON.stringify(cfg, null, 4))
  return cfg
}

module.exports = modifyConfig;
