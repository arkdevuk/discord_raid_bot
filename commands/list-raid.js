const moment = require('moment-timezone');
const defaultStr =  require('../inc/default_str');
const timemachine =  require('../inc/timemachine');

module.exports = {
    name: 'list-raid',
    guildOnly: true,
    description: 'List registered raid for your guild',
    help: 'Get info about your raid, type `!list-raid` to see all __incoming__ raids.\nUse `!list-raid yes` to list **ALL** raids.',
    execute(message, args) {
        message.mysql.query('SELECT * FROM bot_oo_ds.bot_setup as gl WHERE gl.discord_id = ' + message.guild.id + ' LIMIT 1;', (err, result) => {
            if (err) {
                message.channel.send('An error occured 😫 sry');
                return;
            }

            if (result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined) {
                message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                return;
            }

            const settingsG_ = result[0];

            message.mysql.query('SELECT * FROM bot_oo_ds.guild_list as gl WHERE gl.discord_id = ' + message.guild.id + ' LIMIT 1;', (err, result) => {
                if(err) {
                    message.channel.send('An error occured 😫 sry');
                    return;
                }

                if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                    message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                    return;
                }

                let getPastRaid = false;

                if(args[0] !== undefined && args[0] === 'yes'){
                    getPastRaid = true;
                }

                const Guild_ = result[0];

                let currentTms = Math.floor((+ new Date())/1000);



                let sqlReqSuffix = '';

                if(getPastRaid) {
                    message.channel.send('All time raid(s)\n');
                    currentTms = 0;
                } else {
                    message.channel.send('Incoming raid(s)\n');
                    sqlReqSuffix = ' AND rl.canceled = 0'; // remove canceled raid
                }

                let sqlReq = 'SELECT * FROM bot_oo_ds.raid_list as rl WHERE rl.owner = ' + Guild_.id + ' AND rl.tms_s >= ' + currentTms + sqlReqSuffix;



                message.mysql.query(sqlReq, (err, result) => {
                    if(err) {
                        message.channel.send('An error occured 😫 sry');
                        return;
                    }

                    if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                        message.channel.send('No incoming raid guild');
                        return;
                    }

                    let messContent = '';

                    for(const r_ of result){
                        let momentDate = moment.unix(r_.tms_s);
                        let raidDate = momentDate.toDate();

                        const isToday = timemachine.isToday(raidDate);

                        let dOut = momentDate.tz(settingsG_.timezone).format('yyyy-MM-DD @ HH:mm');
                        if(r_.canceled === 1 || r_.canceled === '1'){
                            messContent += `~~[**${r_.name}**] => ${dOut} on __${r_.map}__~~`;
                        } else {
                            messContent += `[**${r_.name}**] => ${dOut} on __${r_.map}__`;
                        }

                        if(isToday){
                            messContent += ' **[TODAY]**';
                        }

                        messContent += '\n';
                    }

                    message.channel.send(messContent);

                });

            });

        });
    },
};