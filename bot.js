// Create a instance of the Discord client (bot)
const Discord = require('discord.js');
const client = new Discord.Client();

// Load up the .env file variables (all changes to .env require bot restart!)
require('dotenv').config();

// Require GameDig - allows to get Server Query data.
//  https://github.com/sonicsnes/node-gamedig
const Gamedig = require('gamedig');

// Get the current locale (returns as an object)
const locale = require(`./localization/${process.env.LOCALE}`);

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
        
        client.user.setActivity(`${locale.playingMessage} ${data.players.length}/${data.maxplayers} | ${data.map}`, 'PLAYING');
        
        if (showMessage)
            createMessage(data, 'ok');
    }).catch(error => {
        client.user.setActivity(locale.serverNotResponding, 'PLAYING');
        
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
                        name: data.name
                    },
                    title: `steam://connect/${data.query.host}:${data.query.port_query}`,
                    fields:
                    [
                        {
                            name: locale.richEmbed.normal.playerCount.players,
                            value: `${data.players.length} ${locale.richEmbed.normal.playerCount.outOf} ${data.maxplayers}`
                        },
                        {
                            name: locale.richEmbed.normal.gamemode,
                            value: data.raw.game
                        },
                        {
                            name: locale.richEmbed.normal.map,
                            value: data.map
                        },
                        {
                            name: locale.richEmbed.normal.password.password,
                            value: data.password ? locale.richEmbed.normal.password.yes : locale.richEmbed.normal.password.no
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
                        name: locale.richEmbed.error.title
                    },
                    description: locale.richEmbed.error.description
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
        message.channel.send(locale.refreshing);
        
        updateInfo();
    }
});

// Time to recheck the server status
setInterval(() => {
    updateInfo(false);
}, process.env.TIME_TO_CHECK_MINUTES * 1000 * 60);

// Login with the secret
client.login(process.env.SECRET);