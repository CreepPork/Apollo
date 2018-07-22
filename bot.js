// Create a instance of the Discord client (bot)
const Discord = require('discord.js');
const client = new Discord.Client();

// Load up the .env file variables (all changes to .env require bot restart!)
require('dotenv').config();

// Require GameDig - allows to get Server Query data.
//  https://github.com/sonicsnes/node-gamedig
const Gamedig = require('gamedig');

/**
 * Gets data from the Server Query and displays appropriate message as an activity, and calls createMessage().
 *
 * @param {bool} [showMessage=true] Should the bot send a message to the wanted channel.
 */
function updateInfo(showMessage = true)
{
    Gamedig.query({
        type: process.env.GAME_TYPE,
        host: process.env.GAME_IP,
        port: process.env.GAME_PORT,
        port_query: process.env.GAME_QUERY_PORT
    }).then(data => {
        
        client.user.setActivity(`Spēlētāji ${data.players.length}/${data.maxplayers} | ${data.map}`, 'PLAYING');
        
        if (showMessage)
            createMessage(data, 'ok');
    }).catch(error => {
        client.user.setActivity('Vee! Voo! Serveris neatbild!', 'PLAYING');
        
        createMessage({}, 'error');
        
        console.error(error);
    });
}

/**
 * Creates the actual message in a Discord channel.
 *
 * @param {Object} [data={}] Server query from GameDig.
 * @param {string} [status='ok'] Type of a message to return
 */
function createMessage(data = {}, status = 'ok')
{
    const channel = process.env.DISCORD_CHANNEL_ID;
    
    const statuses = {
        ok: process.env.STATUS_COLOR_OK,
        error: process.env.STATUS_COLOR_ERROR
    };

    if (channel != '')
    {
        if (status === 'ok')
        {
            status = statuses.ok;
            
            client.channels.get(channel).send({
                embed:
                {
                    color: status,
                    author:
                    {
                        name: data.name,
                        icon_url: client.user.avatarURL
                    },
                    title: `steam://connect/${data.query.host}:${data.query.port_query}`,
                    fields:
                    [
                        {
                            name: 'Spēlētāji',
                            value: `${data.players.length} no ${data.maxplayers}`
                        },
                        {
                            name: 'Misijas tips',
                            value: data.raw.game
                        },
                        {
                            name: 'Karte',
                            value: data.map
                        },
                        {
                            name: 'Parole',
                            value: data.password ? 'Ir' : 'Nav'
                        },
                    ],
                }
            });
        }
        else
        {
            status = statuses.error;
            
            client.channels.get(channel).send({
                embed:
                {
                    color: status,
                    author:
                    {
                        name: 'Serveris neatbild!',
                        icon_url: client.user.avatarURL
                    },
                    description: 'Serveris neatbild, lūdzu salabojiet admini!'
                }
            });
        }
    }
}

// When bot is started and ready - update the status
client.on('ready', () => {
    updateInfo(false);
});

// If someone posts !update then refresh
client.on('message', message => {
    if (message.content === process.env.REFRESH_COMMAND)
    {
        message.channel.send('Atjaunoju info!');
        
        updateInfo();
    }
});

// Time to recheck the server status
setInterval(() => {
    updateInfo(false);
}, process.env.TIME_TO_CHECK_MINUTES * 1000 * 60);

// Login with the secret
client.login(process.env.SECRET);