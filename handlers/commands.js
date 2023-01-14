const { perms } = require('../validation/permissionNames');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const ascii = require('ascii-table');

/**
 * @param { Client } client
 */

module.exports = async (client) => {
    const table = new ascii('Commands Loaded');

    commandsArray = [];

    (await PG(`${process.cwd()}/commands/*/*.js`)).map(async (file) => {
        const command = require(file);

        if (!command.name)
        return table.addRow(file.split('/')[7], '❌ FAILED', 'Missing a name.');

        if (!command.description)
        return table.addRow(file.split('/')[7], '❌ FAILED', 'Missing a description.');

        if (command.permission) {
            if (perms.includes(command.permission))
            command.defaultPermission = false;
            else
            return table.addRow(file.split('/')[7], '❌ FAILED', 'Permission is invalid.');
        }

        client.commands.set(command.name, command);
        commandsArray.push(command);

        table.addRow(command.name, "✔ SUCCESS");
    });

    console.log(table.toString());

    // PERMISSIONS CHECK

    client.on('ready', async () => {
        const mainGuild = await client.guilds.cache.get('[DISCORD GUILD ID]');

        mainGuild.commands.set(commandsArray).then(async (command) => {
            const roles = (commandName) => {
                const cmdPerms = commandsArray.find((c) => c.name === commandName).permission;
                if (!cmdPerms) return null;

                return mainGuild.roles.cache.filter((r) => r.permissions.has(cmdPerms) && !r.managed).first(10);
            }

            const fullPermissions = command.reduce((accumulator, r) => {
                const role = roles(r.name);
                if (!role) return accumulator;

                const permissions = role.reduce((a, r) => {
                    return [...a, { id: r.id, type: "ROLE", permission: true }]
                }, []);

                return [...accumulator, { id: r.id, permissions }]
            }, []);

            await mainGuild.commands.permissions.set({ fullPermissions });
        });
    });
}