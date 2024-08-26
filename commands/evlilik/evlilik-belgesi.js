const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType } = require('discord.js');
const db = require("orio.db")
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
    name: 'evlilik-belgesi',
    description: "Evlilik belgenizi gösterir",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'kullanıcı',
            description: 'Kullanıcının evlilik durumu.',
            type: ApplicationCommandOptionType.User
        }
    ],

    run: async (client, interaction) => {
        const user = interaction.options.get('kullanıcı')?.user || interaction.user;

        let deleteButton = new ButtonBuilder()
            .setCustomId("sil")
            .setEmoji("🗑️")
            .setStyle(2)
            .setLabel("Sil");
        
        let row = new ActionRowBuilder()
            .addComponents(deleteButton);

        let evlilikZamanı = db.get(`${user.id}_evlilikZamanı`);
        let evli = db.fetch(`evli_${user.id}`);
        if(!evli) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`**\`${user.username}\` evli değil**`)
                .setColor("Red")
            ], ephemeral: true
        });

        let partner = client.users.cache.get(evli);
        if (!partner) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`**Eş bulunamadı**`)
                .setColor("Red")
            ], ephemeral: true
        });

        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');
            
        try {
            
            const userAvatarResponse = await axios.get(user.displayAvatarURL({ extension: "png", size: 1024 }), { responseType: 'arraybuffer' });
            const userAvatar = await loadImage(userAvatarResponse.data);

            const partnerAvatarResponse = await axios.get(partner.displayAvatarURL({ extension: "png", size: 1024 }), { responseType: 'arraybuffer' });
            const partnerAvatar = await loadImage(partnerAvatarResponse.data);

            const ringImageResponse = await axios.get('https://upload.wikimedia.org/wikipedia/commons/c/c2/Coeur.svg', { responseType: 'arraybuffer' }); // Uygun bir yüzük resmi URL'si ile değiştirin
            const ringImage = await loadImage(ringImageResponse.data);
           
          
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

           
            ctx.drawImage(userAvatar, 100, 50, 200, 200);
            ctx.drawImage(partnerAvatar, 500, 50, 200, 200);

            ctx.drawImage(ringImage, 350, 100, 100, 100);

         
            ctx.fillStyle = '#000000';
            ctx.font = '28px sans-serif';
            ctx.fillText(`${user.username} & ${partner.username}`, 275, 300);

            ctx.font = '20px sans-serif';
            ctx.fillText(`Evlilik Tarihi: ${new Date(evlilikZamanı * 1000).toLocaleDateString()}`, 275, 350);

         
            const attachment = canvas.toBuffer();
            const attachmentName = 'evlilik-belgesi.png';

           
            let embed = new EmbedBuilder()
                .setAuthor({ name: `Evlilik Bilgisi`, iconURL: user.avatarURL({ dynamic: true }) })
                .setDescription(`
                    :ring: **\`${user.username}\`, \`${partner.username}\` ile evli**
                     **Evlilik Tarihi: <t:${evlilikZamanı}> (<t:${evlilikZamanı}:R>)**
                `)
                .setFooter({ text: `Mutluluklar dilerim :)` })
                .setColor("Random")
                .setImage("attachment://evlilik-belgesi.png")
                .setTimestamp();

            interaction.reply({ embeds: [embed], files: [{ attachment, name: attachmentName }], components: [row] }).then(msg => {
                let filter = i => i.user.id === interaction.user.id;

                let collector = msg.createMessageComponentCollector({ filter, time: 60000 });
                collector.on("collect", async (i) => {
                    if (i.customId === "sil") {
                        msg.delete();
                    }
                });
            });
        } catch (error) {
            console.error('Evlilik belgesi oluşturulurken hata oluştu:', error);
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`**Evlilik belgesi oluşturulurken bir hata oluştu**`)
                    .setColor("Red")
                ], ephemeral: true
            });
        }
    }
};
