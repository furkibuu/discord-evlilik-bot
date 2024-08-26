const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require("orio.db")
module.exports = {
    name: 'boşan',
    description: "Evliliğinizi sona erdirmenize yardımcı olur",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,

    run: async (client, interaction) => {
        const userMarried = db.get(`evli_${interaction.user.id}`);

        if (!userMarried) {
            interaction.reply({ content: `> **Evli değilsiniz.**`, ephemeral: true });
            return;
        }

        const partnerID = db.get(`evli_${interaction.user.id}`);
        const partner = await client.users.fetch(partnerID);

        
        const divorceConfirmationMessage = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}, ${partner.username} ile boşanmak istiyor`, iconURL: partner.displayAvatarURL({ dynamic: true }) })
            .setDescription(` **Boşanmayı kabul ediyor musunuz?**`)
            .setColor("Random");

    
        const acceptButton = new ButtonBuilder()
            .setCustomId("boşanmayıKabulEt")
            .setLabel("Kabul Et")
            .setStyle(ButtonStyle.Success);

        const declineButton = new ButtonBuilder()
            .setCustomId("boşanmayıReddet")
            .setLabel("Reddet")
            .setStyle(ButtonStyle.Danger)
    

        const row = new ActionRowBuilder().addComponents(acceptButton, declineButton);

 
        const message = await interaction.reply({ embeds: [divorceConfirmationMessage], components: [row], fetchReply: true });
        
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (i) => {
            if (i.customId === "boşanmayıKabulEt") {
               
                db.delete(`evli_${interaction.user.id}`);
                db.delete(`evli_${partner.id}`);
                db.delete(`${partner.id}_evlilikZamanı`);
                db.delete(`${interaction.user.id}_evlilikZamanı`);

                
                const successMessage = new EmbedBuilder()
                    .setAuthor({ name: `${interaction.user.username} ve ${partner.username} artık boşandı.`, iconURL: partner.displayAvatarURL({ dynamic: true }) })
                    .setColor("Green")
                    .setDescription(` **Resmi olarak boşandınız.**`)
                    .setTimestamp()
                    .setThumbnail(`https://i.imgur.com/z0NATW1.png`);

                
                await i.update({ embeds: [successMessage], components: [] });
            } else if (i.customId === "boşanmayıReddet") {
             const declineMessage = new EmbedBuilder()
                    .setAuthor({ name: `${partner.username} boşanmayı reddetti.`, iconURL: partner.displayAvatarURL({ dynamic: true }) })
                    .setColor("Red")
                    .setDescription(` **${partner.username} evliliği sürdürmek istiyor.**`)
                    .setTimestamp()
                    .setThumbnail(`https://i.imgur.com/wO5E8WE.png`);

                
                await i.update({ embeds: [declineMessage], components: [] });
            }
        });

        collector.on("end", async () => {
        
            const disableButtons = row.components.map(button => button.setDisabled(true));
            const disabledRow = new ActionRowBuilder().addComponents(disableButtons);
            await interaction.editReply({ components: [disabledRow] });
        });
    }
};
