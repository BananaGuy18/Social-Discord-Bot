const { events } = require('../validation/eventNames');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const ascii = require('ascii-table');

module.exports = async (client) => {
    const table = new ascii('Events Loaded');

    (await PG(`${process.cwd()}/events/*/*.js`)).map(async (file) => {
        const event = require(file);

        if (!events.includes(event.name) || !event.name) {
            const L = file.split('/');
            table.addRow(`${event.name || 'MISSING'}`, `❌ Event name is either invalid or missing: ${L[6] + `/` + L[7]}`);
            return
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }

        table.addRow(event.name, '✔ SUCCESS')
    });

    console.log(table.toString());
}
