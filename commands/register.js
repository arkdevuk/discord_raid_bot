module.exports = {
    name: 'register',
    args: true,
    guildOnly: true,
    description: 'Register or rename your guild.',
    execute(message, args) {
        console.log(args);
        if(args.length < 2){
            message.channel.send('You need to provide a tag AND a name e.g `register GuT My Awesome Guild` 😫 sry');
            return;
        }

        let tag = args[0].replace(/\W/g, '');
        args.splice(0, 1);
        let guildName = args.join(' ').replace(/\W\s/g, '');

        message.channel.send('Do you want to name yourself `' + guildName + '[' + tag + ']` ? (yes/no)');

        let filterCollect = m => m.author.id == message.author.id;

        message.channel.awaitMessages(filterCollect , { max: 2, time: 30000, errors: ['time'] })
            .then(collected => {
                const m_ = collected.first();
                console.log(m_);
                if(m_.content !== 'yes') {
                    message.channel.send('Ow ... okay 😑.');
                    return;
                }

                message.mysql.query('SELECT * FROM bot_oo_ds.guild_list as gl WHERE gl.discord_id = ' + message.guild.id + ' LIMIT 1;', (err, result) => {
                    console.log(result);
                    if(err) {
                        message.channel.send('Cannot get existing data :( ...');
                        return;
                    }

                    if(result === undefined || result.length <= 0){
                        let sql = "INSERT INTO bot_oo_ds.guild_list (`name`, discord_id, gtag) VALUES (?, ?, ?)";
                        let inserts = [guildName, message.guild.id, tag];
                        sql = message.mysql_.format(sql, inserts);
                        message.mysql.query(sql, function (err, result) {
                            if(err) {
                                message.channel.send('Cannot create a new guild, right now ...');
                                console.log(err);
                                return;
                            }

                            let sql2 = "INSERT INTO bot_oo_ds.bot_setup (discord_id, timezone, raid_chan, notifications) VALUES ( ?, ?, ?, ?);";
                            let inserts2 = [message.guild.id, 'Europe/Paris', message.guild.systemChannelID, true];
                            sql2 = message.mysql_.format(sql2, inserts2);
                            message.mysql.query(sql2, function (err, result) {
                                if(err) {
                                    message.channel.send('Cannot create settings ...');
                                    return;
                                }
                                message.channel.send('Registered !!');
                            });
                        });


                        return;
                    }


                    let sql = "UPDATE bot_oo_ds.guild_list as gl SET name = ?, gtag = ? WHERE discord_id = ?";
                    let inserts = [guildName, tag, message.guild.id];
                    sql = message.mysql_.format(sql, inserts);
                    message.mysql.query(sql, function (err, result) {
                        if(err) {
                            message.channel.send('Cannot update guild, right now ...');
                            return;
                        }
                        message.channel.send('Updated !!');
                    });
                    // update

                });


            })
            .catch(collected => {
                message.channel.send('Looks like nobody really wanna do this 😑.');
            });
    },
};