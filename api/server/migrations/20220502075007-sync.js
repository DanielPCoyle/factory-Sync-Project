'use strict';
    const {initUp,initDown,initMigration} = require('factory-sync/migrations')
    module.exports = {
      up:initUp(initMigration('20220502075007')),
      down:initDown(initMigration('20220502075007'))
    };