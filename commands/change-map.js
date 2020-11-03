const gcontact = require('../inc/gcontact');
const moment = require('moment-timezone');
const timemachine = require('../inc/timemachine');

module.exports = {
    name: 'change-map',
    description: 'Change map of the given raid ; Usage : `!change-map <raid-id> <map-name>`',
    args: true,
    guildOnly: true,
    execute(message, args) {
        let sql_ = `SELECT g.*, s.timezone, s.notifications, s.raid_chan FROM bot_oo_ds.guild_list as g
INNER JOIN bot_oo_ds.bot_setup as s
ON g.discord_id = s.discord_id
WHERE g.discord_id = ${message.guild.id}`;
        message.mysql.query(sql_ + ' LIMIT 1;', (err, result) => {
            if (err) {
                message.channel.send('An error occured 😫 sry');
                return;
            }

            if (result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined) {
                message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                return;
            }

            if(args.length <= 1){
                message.channel.send('Missing arguments, try `!help ' + this.name + '` for help');
                return;
            }

            const Guild_ = result[0];

            const newMap = args[1];

            let currentTms = Math.floor((+ new Date())/1000);


            let sqlSearch = "SELECT * FROM bot_oo_ds.raid_list as rl WHERE rl.owner = ? AND rl.name = ? AND rl.tms_s >= ? LIMIT 1";
            let inserts = [Guild_.id, args[0], currentTms];
            sqlSearch = message.mysql_.format(sqlSearch, inserts);


            //*
            message.mysql.query(sqlSearch, (err, result) => {
                if (err) {
                    message.channel.send('An error occured 😫 sry');
                    return;
                }

                if (result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined) {
                    message.channel.send('Raid does not exists or is already done');
                    return;
                }

                const r_ = result[0];

                let momentDate = moment.unix(r_.tms_s);

                let raidDate = momentDate.toDate();


                let dOut = 'on ' + momentDate.tz(Guild_.timezone).format('yyyy-MM-DD @ HH:mm') + ' (' + Guild_.timezone + ')';

                let chanDate = dOut;

                if(timemachine.isToday(raidDate)){
                    dOut = 'today';
                }

                let messageTxt = 'Hi ! __' + Guild_.gtag + '__\'s raid scheduled ' + dOut + ' map was updated to __' + newMap + '__.';

                message.guild.channels.get(Guild_.raid_chan).send('Raid scheduled ' + chanDate + ' map was updated to __' + newMap + '__.');

                message.guild.channels.get(Guild_.raid_chan).fetchMessage(r_.message_id)
                    .then(async oldMess => {
                        gcontact.contactAll(oldMess, messageTxt)
                    })
                ;

                let sql = "UPDATE bot_oo_ds.raid_list SET map = ? WHERE id = ?";
                let inserts = [newMap, r_.id];
                sql = message.mysql_.format(sql, inserts);
                message.mysql.query(sql, function (err, result) {
                    if(err) {
                        message.channel.send('An, error occured while updating the raid message id ...');
                        return;
                    }
                });

            });

        });
    },
};