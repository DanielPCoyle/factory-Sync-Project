const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const {config} = require('dotenv');
const env = process.env.NODE_ENV || 'local';
const appDir = path.dirname(require.main.filename).replace("/api","/");
if (fs.existsSync('.env.'+process.env.NODE_ENV)) {
  config({ path: '.env.'+process.env.NODE_ENV })
}else{
    config()
}

const initModelsPath = path.resolve(appDir+(process.env.MODELS_DIR ?? "./api/server/models")+"/init-models");
console.log("MODELS PATH:::",initModelsPath)
const initModels = require(initModelsPath);

let settings = require(appDir + '/config/config')[env];
console.log(settings)
settings = {...settings,...{    
  retry: {
    match: [/Deadlock/i],
    max: 3, // Maximum rety 3 times
    backoffBase: 1000, // Initial backoff duration in ms. Default: 100,
    backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
  },
}}

let sequelize;
if (typeof(settings.use_env_variable) !== "undefined") {
  sequelize = new Sequelize(process.env[settings.use_env_variable], settings);
} else {
  sequelize = new Sequelize(settings.database, settings.username, settings.password, settings);
}

const db = initModels(sequelize);
module.exports = {
  DB:db,
  sequelize
};