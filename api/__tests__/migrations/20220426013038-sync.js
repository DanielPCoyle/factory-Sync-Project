'use strict';
    const {initUp,initDown,initMigration} = require('../../services/migrations')
    module.exports = {
      up:initUp(initMigration('20220426013038')),
      down:initDown(initMigration('20220426013038'))
    };