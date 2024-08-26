const {Client, GatewayIntentBits, Collection} = require("discord.js");
const {readdirSync} = require("fs");
const IncludedIntents = Object.entries(GatewayIntentBits).reduce((t, [, V]) => t | V, 0);
const client = new Client({ intents: IncludedIntents});
const {app} = require("./config.json");


client.login(app.TOKEN).catch(err => {console.log("Tokeni kontrol ediniz.")});


client.slashCommands = new Collection();
module.exports = client;


readdirSync('./handlers').forEach((handler) => {
    require(`./handlers/${handler}`)(client)
  });
