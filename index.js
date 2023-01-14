const { Client, Collection } = require('discord.js');
const client = new Client({ intents: 32767 }); 
require('dotenv').config();

require('./handlers/events')(client);
require('./handlers/commands')(client);

client.commands = new Collection();

client.login(process.env.TOKEN);
