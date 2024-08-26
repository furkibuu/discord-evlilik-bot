const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType } = require('discord.js');
const db = require("orio.db")
module.exports = {
    name: 'evlen',
    description: "Evlilik teklifi yapmak için komut",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'kullanıcı',
            description: 'Etiketleyeceğiniz kullanıcı.',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],

    run: async (client, interaction) => {
        const user = interaction.options.get('kullanıcı')?.user || interaction.user;
    interaction.deferReply()
        const userAlreadyMarried = db.get(`evli_${interaction.user.id}`);
    
        if (userAlreadyMarried) {
            interaction.reply({ content: `> **Üzgünüm! Zaten evlisiniz.**`, ephemeral: true });
            return;
        }

        const targetAlreadyMarried = db.get(`evli_${user.id}`);
        if (targetAlreadyMarried) {
            interaction.reply({ content: `> **Etiketlediğiniz kişi zaten evli.**`, ephemeral: true });
            return;
        }

        const marriageProposalMessage = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}, ${user.username}'a evlilik teklifi etti`, iconURL: user.avatarURL({ dynamic: true }) })
            .setDescription(` **${user.username} evlilik teklifini kabul edecek mi?**`)
            .setColor("Random");

        const acceptButton = new ButtonBuilder()
            .setCustomId("kabul")
            
            .setLabel("Kabul Et")
            .setStyle(2);

        const declineButton = new ButtonBuilder()
            .setCustomId("reddet")
            .setLabel("Reddet")
            .setStyle(2)
            

        const row = new ActionRowBuilder().setComponents(acceptButton, declineButton);

        const acceptedButton = new ButtonBuilder()
            .setCustomId("kabul")
            .setLabel("Kabul Edildi")
            .setStyle(2)
            .setDisabled(true);

        const declinedButton = new ButtonBuilder()
            .setCustomId("reddet")
            .setLabel("Reddedildi")
            .setStyle(2)
            .setDisabled(true);

        const row2 = new ActionRowBuilder().setComponents(acceptedButton, declinedButton);

        interaction.editReply({ embeds: [marriageProposalMessage], components: [row] }).then(async msg => {
            let filter = (i) => i.user.id === user.id;
            let collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on("collect", async (i) => {
                if (i.customId === "kabul") {
                   
                    db.set(`evli_${interaction.user.id}`, user.id);
                    db.set(`evli_${user.id}`, interaction.user.id);
                    db.set(`${user.id}_evlilikTarihi`, Math.round(Date.now() / 1000));
                    db.set(`${interaction.user.id}_evlilikTarihi`, Math.round(Date.now() / 1000));
               
                  
                    const successMessage = new EmbedBuilder()
                        .setAuthor({ name: `${interaction.user.username} ve ${user.username} Mutluluklar`, iconURL: user.avatarURL({ dynamic: true }) })
                        .setColor("Green")
                        .setDescription(`**Tebrikler, başarılı bir şekilde evlendiniz!** \n <:kalp_anime:1129124451204726855> **\`${interaction.user.username}\` ve \`${user.username}\` Evlendi**`)
                        .setTimestamp()
                        .setThumbnail(`https://i.pinimg.com/originals/b7/a5/8e/b7a58eb9a86fe8bc0e026f46a0afa62d.gif`);

                    
                    msg.edit({ embeds: [successMessage], components: [row2] });
                } else if (i.customId === "reddet") {
                  
                    const declineMessage = new EmbedBuilder()
                        .setAuthor({ name: `${interaction.user.username}, üzgünüm ama teklifin reddedildi`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                        .setColor("Red")
                        .setDescription(`**Teklifin ${user.username} tarafından reddedildi!**`)
                        .setTimestamp()
                        .setThumbnail(`https://i.pinimg.com/736x/65/32/d3/6532d3288f3b7a54a5ab714407f0a34e.jpg`);

                    
                    msg.edit({ embeds: [declineMessage], components: [row2] });
                }

                
                i.deferUpdate();
            });
        })
    }
};
