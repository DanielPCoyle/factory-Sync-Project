'use strict';
    const {initUp,initDown,initMigration} = require('factory-sync/migrations')
    module.exports = {
      up:initUp(initMigration('20220503105128')),
      down:initDown(initMigration('20220503105128'))
    };