const moment = require('moment-timezone');
const defaultStr =  require('../inc/default_str');
const namator =  require('../inc/namator');

module.exports = {
    name: 'add-raid',
    args: true,
    guildOnly: true,
    description: 'Create a new raid `!add-raid <date> <hour> <map> <comment(optional)>`',
    execute(message, args) {
        message.mysql.query('SELECT * FROM bot_oo_ds.bot_setup as gl WHERE gl.discord_id = ' + message.guild.id + ' LIMIT 1;', (err, result) => {
            if(err) {
                message.channel.send('An error occured 😫 sry');
                return;
            }

            if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                return;
            }

            const settingsG_ = result[0];

            if(args.length <= 2) {
                message.channel.send('check the number of arguments 😘');
                return;
            }

            if(args[0].length <= 9) {
                message.channel.send('Date format is invalid use a DD/MM/YYYY representation using leading-zero : `01/01/2020`');
                return;
            }

            if(args[1].length <= 3) {
                message.channel.send('Hour format is invalid use a 4-digits representation using leading-zero : `2100` = 21:00');
                return;
            }

            let parts = args[0].split("/");
            let hour = args[1][0] + args[1][1];
            let minute = args[1][2] + args[1][3];

            let y__ = parts[2];
            let m__ = parts[1];
            let d__  = parts[0];

            const zone = settingsG_.timezone || 'Europe/Paris';
            let s = y__ + '-' + m__ + '-' + d__ + ' ' + hour + ':' + minute;
            let m = moment.tz(s, zone);
            let mR = m.format();

            const tms_o = (+ new Date(mR))/1000;

            const map = args[2];
            const comment = args[3] || "";

            const generatedName = namator.generateName();

            const channelId = settingsG_.raid_chan;

            let raidMessage = `Raid scheduled by <@${message.author.id}>\n` +
                y__ + '-' + m__ + '-' + d__ + ' @ ' + hour + ':' + minute + " (" + settingsG_.timezone + ")\n" + map + "\n" + comment + "\n*react to this message*";

            message.mysql.query('SELECT * FROM bot_oo_ds.guild_list as gl WHERE gl.discord_id = ' + message.guild.id + ' LIMIT 1;', (err, rs2) => {
                if (err) {
                    message.channel.send('An error occured 😫 sry');
                    return;
                }


                if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                    message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                    return;
                }

                const guild__ = rs2[0];

                console.log(guild__);

                let sql2 = "INSERT INTO bot_oo_ds.raid_list (`name`, tms_s, owner, map, comment) VALUES ( ?, ?, ?, ?, ?);";
                let inserts2 = [generatedName, tms_o, guild__.id, map, comment];
                sql2 = message.mysql_.format(sql2, inserts2);
                message.mysql.query(sql2, function (err, result) {
                    if(err) {
                        message.channel.send('Cannot create settings ...');
                        console.log(inserts2, err);
                        return;
                    }
                    message.channel.send('Raid registered !!');

                    const raidId = result.insertId;

                    message.guild.channels.find(chan_ => chan_.id == channelId).send(defaultStr.separator);

                    message.guild.channels.find(chan_ => chan_.id == channelId).send(raidMessage)
                        .then(mess_ => {
                            console.log(mess_.id, raidId);
                            let sql = "UPDATE bot_oo_ds.raid_list SET message_id = ?, `name` = ? WHERE id = ?";
                            let inserts = [mess_.id, generatedName + raidId, raidId];
                            sql = message.mysql_.format(sql, inserts);
                            message.mysql.query(sql, function (err, result) {
                                if(err) {
                                    message.channel.send('An, error occured while updating the raid message id ...');
                                    return;
                                }
                            });
                        });

                });
            });



        });
    },
};