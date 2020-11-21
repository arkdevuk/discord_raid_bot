module.exports = {
    name: 'setup',
    args: true,
    guildOnly: true,
    description: 'Setup bot for current guild `!setup <timezone> <raid-chan> <notifications(yes|no)> <language>`',
    execute(message, args) {
        message.mysql.query('SELECT * FROM bot_oo_ds.guild_list as gl WHERE gl.discord_id = ' + message.guild.id + ' LIMIT 1;', (err, result) => {
            if(err) {
                message.channel.send('An error occured 😫 sry');
                return;
            }

            if(result === undefined || result.length <= 0 || result[0] === undefined || result[0].id === undefined){
                message.channel.send('You need to register your guild using `!register <tag> <name>` command 😅');
                return;
            }

            if(args.length <= 2){
                message.channel.send('Missing arguments');
                message.channel.send(this.description);
                return;
            }

            let chan = message.guild.channels.find(x => x.name === args[1].replace('#',''));

            if(chan === null || chan === undefined || chan.id === undefined){
                message.channel.send('Chan does not exist 😕');
                return;
            }

            let notif = false;
            if(args[2] === 'yes'){
                notif = true;
            }
            //*/
            let sql = "UPDATE bot_oo_ds.bot_setup set timezone = ?, raid_chan = ?, notifications = ?, lang = ? WHERE discord_id = ?";
            let inserts = [args[0], chan.id, notif, args[3], message.guild.id];
            sql = message.mysql_.format(sql, inserts);
            message.mysql.query(sql, function (err, result) {
                if(err) {
                    message.channel.send('Cannot create settings ...');
                    console.warn(err);
                    return;
                }
                message.channel.send('Updated !!');
            });//*/

        });
    },
};