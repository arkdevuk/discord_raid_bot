module.exports = {
    name: 'help',
    description: 'Help !!!! Type `!help` to list all commands',
    help: 'Help !!!! \n`help` to get a list of all commands\n`help <command>` to get help on a specific command',
    execute(message, args) {
        const bot = message.client;

        if(args[0] === undefined){
            //list all
            let txt_ = '';

            for(const cmd of bot.commands.array()){
                txt_ += `**${cmd.name}** : ${cmd.description}\n`;
            }
            message.channel.send(txt_);
            return;
        }

        const commandName = args[0].toLowerCase();
        // check if bot has command with that name :D
        if (!bot.commands.has(commandName)) {
            message.channel.send(`Command ${commandName} does not exist`);
            return;
        }
        const command = bot.commands.get(commandName);

        let help = command.description;

        if(command.help !== undefined){
            help = command.help;
        }
        message.channel.send(`**${commandName}**\n${help}`);
    },
};