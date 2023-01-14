const { CommandInteraction } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Pong!',
    permission: 'ADMINISTRATOR',
    /**
     * @param { CommandInteraction } interaction
     */
    execute (interaction) {
        interaction.reply({ content: 'PONG' })
    }
}