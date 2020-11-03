const moment = require('moment-timezone');
const namator =  require('../inc/namator');

module.exports = {
    name: 'info-raid',
    guildOnly: true,
    args: true,
    description: 'Get info about a raid',
    execute(message, args) {
        let sql_ = `SELECT g.*, s.timezone, s.notifications, s.raid_chan FROM bot_oo_ds.guild_list as g
INNER JOIN bot_oo_ds.bot_setup as s
ON g.discord_id = s.discord_id
WHERE g.discord_id = ${message.guild.id}` ;
        message.mysql.query( sql_ + ' LIMIT 1;', (err, result) => {
            if(err) {
                message.channel.send('An error occured 😫 sry');
                return;
            }

            if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                return;
            }

            const Guild_ = result[0];

            let sqlSearch = "SELECT * FROM bot_oo_ds.raid_list as rl WHERE rl.owner = ? AND rl.name = ? LIMIT 1";
            let inserts = [Guild_.id, args[0]];
            sqlSearch = message.mysql_.format(sqlSearch, inserts);

            message.mysql.query(sqlSearch, (err, result) => {
                if(err) {
                    message.channel.send('An error occured 😫 sry');
                    return;
                }

                if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                    message.channel.send('No incoming raid guild');
                    return;
                }

                result.forEach(r_ => {


                    let momentDate = moment.unix(r_.tms_s);
                    let dOut = momentDate.tz(Guild_.timezone).format('yyyy-MM-DD @ HH:mm') + ' (' + Guild_.timezone + ')';
                    message.channel.send(`Raid "${r_.name}"\n${dOut}\nOn ${r_.map}\n${r_.comment}`);

                    if(r_.canceled === 1 || r_.canceled === '1'){
                        message.channel.send(`__**Raid was CANCELED**__`);
                    }

                    message.guild.channels.get(Guild_.raid_chan).fetchMessage(r_.message_id)
                        .then(async oldMess => {
                            const reactionsArray = oldMess.reactions.array();
                            let output = [];
                            for (const reactionItem of reactionsArray) {
                                await reactionItem.fetchUsers();//populate the user array
                                if (reactionItem._emoji !== undefined) {
                                    output[reactionItem._emoji.name] = reactionItem.users.array();
                                }
                            }

                            let messageOutput = '';
                            let totalPlayer = 0;
                            for (const className in output) {
                                console.log(className);
                                if(className !== 'X' && className !== 'x' && className !== 'null' && className !== '❌'){
                                    let cName = namator.capFirst(className);
                                    let count = output[className].length;
                                    totalPlayer += count;
                                    const em_ = message.guild.emojis.find(emoji => emoji.name === className);
                                    let txt_ = `${em_} **${cName}** - ${count} :\n`;
                                    for (const userEntity of output[className]){
                                        if(userEntity.username !== undefined){
                                            //txt_ += `${userEntity.username}#${userEntity.discriminator} - <@${userEntity.id}>` ;
                                            //txt_ += `${userEntity.username}#${userEntity.discriminator}\n` ;
                                            txt_ += `${userEntity.username} *#${userEntity.discriminator}*\n` ;
                                        }
                                    }
                                    messageOutput += txt_ + '\n';
                                }
                            }

                            message.channel.send(messageOutput);

                            message.channel.send(`Total of **${totalPlayer}** players.`);
                        });

                });


            });

        });
    },
};