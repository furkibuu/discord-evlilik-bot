const { ActivityType } = require("discord.js");
const client = require("..");


client.on("ready", () => {

client.user.setActivity({type: ActivityType.Playing, name:`furkibu_ tarafından yapıldı`});
client.user.setStatus("idle");
console.log("Bot aktif.")
})