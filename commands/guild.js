module.exports = {
    name: 'guild',
    guildOnly: true,
    description: 'Get info about your guild',
    execute(message, args) {
        let sql_ = `SELECT g.*, s.timezone, s.notifications, s.raid_chan FROM bot_oo_ds.guild_list as g
INNER JOIN bot_oo_ds.bot_setup as s
ON g.discord_id = s.discord_id
WHERE g.discord_id = ${message.guild.id}`;
        message.mysql.query(sql_ + ' LIMIT 1;', (err, result) => {
            if(err) {
                message.channel.send('An error occured 😫 sry');
                return;
            }

            if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                return;
            }

            let text = '';

            text += `Registed as \`${result[0].name} [${result[0].gtag}]\` 😎\n`;

            let chan = message.guild.channels.get(result[0].raid_chan);

            if(chan === undefined || chan.name === undefined){
                chan = 'unknown';
            } else {
                chan = chan.toString();
            }

            text += `Timezone : ${result[0].timezone}\n`;
            text += `Discord ID : ${result[0].discord_id}\n`;
            text += `Raid Chan : ${chan}\n`;
            let notificationStr = 'no';
            if(result[0].notifications === 1 || result[0].notifications === '1'){
                notificationStr = 'yes';
            }
            text += `Notification : ${notificationStr}\n`;

            message.channel.send(text);
        });
    },
};