const { CommandInteraction, MessageEmbed } = require('discord.js');
const { mainColor } = require('../../config.json');

module.exports = {
    name: 'clear',
    description: 'Deletes a specified amount of messages.',
    permission: 'MANAGE_MESSAGES',
    options: [
        {
            name: 'amount',
            description: 'Amount of messages to delete.',
            type: 'NUMBER',
            required: true
        },
        {
            name: 'user',
            description: 'Target a specific user.',
            type: "USER",
            required: false
        }
    ],
    /**
     * 
     * @param { CommandInteraction } interaction 
     */
    async execute (interaction) {
        const { channel, options } = interaction;

        const amount = options.getNumber('amount');
        const targetUser = options.getMember('user');

        const messages = await channel.messages.fetch();

        const responseEmbed = new MessageEmbed()
        .setColor(mainColor);

        if (targetUser) {
            let i = 0;
            const filteredMsgs = [];
            (messages).filter((m) => {
                if (m.author.id === targetUser.id && amount > i) {
                    filteredMsgs.push(m);
                    i++;
                }
            });

            await channel.bulkDelete(filteredMsgs, true).then(messages => {
                responseEmbed.setDescription(`🧹 Cleared ${messages.size} messages from ${targetUser}.`);
                interaction.reply({ embeds: [responseEmbed] });
            });
        } else {
            await channel.bulkDelete(amount, true).then(messages => {
                responseEmbed.setDescription(`🧹 Cleared ${messages.size} messages.`);
                interaction.reply({ embeds: [responseEmbed] });
            });
        }
    }
}