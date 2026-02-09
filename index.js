const utils = require('./lib/utils');
const install = require('./lib/commands/install');
const list = require('./lib/commands/list');
const search = require('./lib/commands/search');
const wizard = require('./lib/commands/wizard');
const doctor = require('./lib/commands/doctor');
const status = require('./lib/commands/status');

// Export utilities and commands programmatically
module.exports = {
    ...utils,
    commands: {
        install,
        list,
        search,
        wizard,
        doctor,
        status
    }
};
