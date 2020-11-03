// Require express and body-parser
const express = require("express");
const bodyParser = require("body-parser");

require('dotenv').config();

let getRoundedDate = (minutes, d=new Date()) => {

    let ms = 1000 * 60 * minutes; // convert minutes to ms
    let roundedDate = new Date(Math.round(d.getTime() / ms) * ms);

    return Math.floor(roundedDate/1000);
}

function parseQuotes(str = '') {
    let current = '',
        arr = [],
        inQuotes = false

    for (let char of str.trim()) {
        if (char == '"') {
            // Switch the value of inQuotes
            inQuotes = !inQuotes
        } else if (char == ' ' && !inQuotes) {
            // If there's a space and where're not between quotes, push a new word
            arr.push(current)
            current = ''
        } else {
            // Add the character to the current word
            current += char
        }
    }

    // Push the last word
    arr.push(current)

    return arr
}

const TOKEN = process.env.BOT_TOKEN;
const PREFIX = process.env.PREFIX;

const fs = require('fs');
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    bot.commands.set(command.name, command);
    //@see https://discordjs.guide/command-handling/#dynamically-reading-command-files
}

const mysql      = require('mysql');

const connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
});


connection.connect((err) => {
    if(err) {
        console.error("Cannot access MySQL server");
        throw err;
    }

    console.info("Connected to MySQL server");
});


bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
    console.info('message');
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;// ignore self sent command

    //const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const args = parseQuotes(message.content.slice(PREFIX.length).trim());

    console.log(args);

    const commandName = args.shift().toLowerCase();
    // check if bot has command with that name :D
    if (!bot.commands.has(commandName)) return;

    const command = bot.commands.get(commandName);

    if (command.args && !args.length) {
        return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
    }

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    message.mysql = connection;
    message.mysql_ = mysql;
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});




// Initialize express and define a port
const app = express();
const PORT = 3115;

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json());

app.get("/hook", (req, res) => {
    if(req.query !== undefined && req.query.kk !== undefined && req.query.kk === process.env.WH_KEY){
        res.status(200).end(); // Responding is important
        console.log(+ getRoundedDate(1, new Date()));
        return;
    }
    res.status(403).end(); // Responding is important
});

// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));