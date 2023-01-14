const { Client, MessageEmbed } = require('discord.js')
const Twit = require('twit')
const quotes = require('../../quotes.json')

module.exports = {
    name: 'ready',
    once: 'true',
    /**
     * @param { Client } client
     */
    execute (client) {
        console.log('Bot is online!')
        client.user.setActivity('Hello!', { type: 'WATCHING' })

        ///////////////////
        // TWITTER EVENT //
        ///////////////////

        const tweetDest = '[TWITTER DISCORD CHANNEL ID]'
        const T = new Twit ({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            timeout_ms: 60 * 1000,
            strictSSL: true,
        })

        // Create a stream and insert ID's of users to follow.
        const stream = T.stream('statuses/filter', {
            follow: [
                '[TWITTER USER ID]',
            ],  
        })

        stream.on('tweet', tweet => {
            if (tweet.user.screen_name === '[TWITTER USERNAME]' && tweet.in_reply_to_status_id === null) {
                const twitterMessage = `<@&[DISCORD ROLE ID TO MENTION]> [User] just tweeted here: https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
                client.channels.cache.get(tweetDest).send(twitterMessage)
                return false
            } 
        })

        ////////////
        // QUOTES //
        ////////////

        setInterval(function(){ 
            const songs = ['[ENTER SONG NAMES FROM quotes.json]']
            const quoteDest = '[QUOTES DISCORD CHANNEL ID]'
            let songFromArr = songs[Math.floor(Math.random() * songs.length)]
            let songFromJSON = quotes[songFromArr][Math.floor(Math.random() * quotes[songFromArr].length)]
            let quote = songFromJSON.quote
            let author = songFromJSON.author

            var date = new Date();
            if(date.getHours() === 8 && date.getMinutes() === 0){ // Check if the time is 8:00 am
                client.channels.cache.get(quoteDest).send(`"${quote}" - *${songFromArr}, ${author}*`)
            }
        }, 60000); // Repeat every 60000 milliseconds (1 minute)
    }
}