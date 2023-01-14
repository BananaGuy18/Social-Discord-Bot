const { CommandInteraction, MessageEmbed } = require('discord.js')
const ms = require('ms')
const { mainColor } = require('../../config.json');

module.exports = {
    name: 'cvote',
    description: 'Create a new vote',
    permission: 'ADMINISTRATOR',
    options: [
        {
            name: 'title',
            description: 'Title of the vote',
            type: 'STRING',
            required: true
        },
        {
            name: 'endtime',
            description: 'How long the poll will run for (hours)',
            type: 'INTEGER',
            required: true
        },
        {
            name: 'optionone',
            description: 'Specify option one',
            type: 'STRING',
            required: false
        },
        {
            name: 'optiontwo',
            description: 'Specify option two',
            type: 'STRING',
            required: false
        },
    ],
    /**
     * @param { CommandInteraction } interaction
     */
    async execute (interaction,  client, args) {
        const [title, multiplevotes, endtime, optionone, optiontwo] = args
        const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(`1️⃣ ${optionone}\n\n2️⃣ ${optiontwo}\n`)
        .setColor(mainColor)
        .setFooter({ text: `This vote will in ${endtime} hours.` })

        interaction.deleteReply()

        let msgEmbed = await interaction.channel.send({ embeds: [embed] })
        await msgEmbed.react('1️⃣')
        await msgEmbed.react('2️⃣')

        let time = ms(`${endtime}h`)

        const filter = (reaction, user) => {
            return (reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣') && user.id != client.user.id
        };
    
        const collector = msgEmbed.createReactionCollector({ filter, time: time });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            console.log(reaction)

            reaction.message.reactions.cache.map(x => {
                if(x._emoji.name != reaction._emoji.name && x.users.cache.has(user.id)) x.users.remove(user.id)
            })
        });

        collector.on('end', collected => {
            const reactions = msgEmbed.reactions.cache
            let opOne = reactions.get('1️⃣')
            let opTwo = reactions.get('2️⃣')
            let countOne = opOne.count - 1
            let countTwo = opTwo.count - 1

            let totalVotes = countOne + countTwo
            let opOnePer = Math.round((countOne / totalVotes) * 100)
            let opTwoPer = Math.round((countTwo / totalVotes) * 100)
            let barOne = []
            let barTwo = []
            
            for (n = 0; n<20; n++) {
                if (opOnePer<(n+1)*5) {
                    barOne.push('░')
                } else {
                    barOne.push('▓')
                }
            }
            
            for (n = 0; n<20; n++) {
                if (opTwoPer<(n+1)*5) {
                    barTwo.push('░')
                } else {
                    barTwo.push('▓')
                }
            }

            if (countOne > countTwo) {
                const winnerOne = new MessageEmbed()
                .setTitle(title)
                .setDescription(`1️⃣ ${optionone}\n\n${barOne.join('')} ${opOnePer}% (**${countOne} votes**)\n\n2️⃣ ${optiontwo}\n\n${barTwo.join('')} ${opTwoPer}% (${countTwo} votes)`)
                .setColor(mainColor)

                interaction.channel.send({ embeds: [winnerOne] })
            } else if (countOne < countTwo) {
                const winnerTwo = new MessageEmbed()
                .setTitle(title)
                .setDescription(`1️⃣ ${optionone}\n\n${barOne.join('')} ${opOnePer}% (${countOne} votes)\n\n2️⃣ ${optiontwo}\n\n${barTwo.join('')} ${opTwoPer}% (**${countTwo} votes**)`)
                .setColor(mainColor)

                interaction.channel.send({ embeds: [winnerTwo] })
            } else {
                const tie = new MessageEmbed()
                .setTitle(title)
                .setDescription(`1️⃣ ${optionone}\n\n${barOne.join('')} ${opOnePer}% (**${countOne} votes**)\n\n2️⃣ ${optiontwo}\n\n${barTwo.join('')} ${opTwoPer}% (**${countTwo} votes**)`)
                .setColor(mainColor)
                .setFooter({ text: `Tie!` })

                interaction.channel.send({ embeds: [tie] })
            }
        });

        
    }
}