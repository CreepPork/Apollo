// Create a instance of the Discord client (bot)
const Discord = require('discord.js');
const client = new Discord.Client();

// Load up the .env file variables (all changes to .env require bot restart!)
require('dotenv').config();

// We need the file system API from Node for saving & reading the last channel ID (getLastChannelID())
const fs = require('fs');

// Require GameDig - allows to get Server Query data.
//  https://github.com/sonicsnes/node-gamedig
const Gamedig = require('gamedig');

// Get the current locale (returns as an object)
const locale = require(`./localization/${process.env.LOCALE}`);

let failedRefreshAttempts = 0;

/**
 * Return the last posted message ID by the bot.
 *
 * @returns {string} Last message ID
 */
function getLastMessageID()
{
    let id = '';

    if (fs.existsSync('./message.txt'))
    {
        id = fs.readFileSync('./message.txt', { encoding: 'utf8' });
    }

    return id;
}

/**
 * Sets the last message ID in message.txt file.
 *
 * @param {string} id Message ID to set
 */
function setLastMessageID(id)
{
    fs.writeFileSync('./message.txt', id, { encoding: 'utf8' });
}

/**
 * Gets data from the Server Query and displays appropriate message as an activity, and calls createMessage().
 *
 * @param {boolean} [editMessage=true] Should the bot edit its last message posted to reflect current data?
 * @param {boolean} [forceCreateMessage=false] Should we force to create a new message?
 */
function updateInfo(editMessage = true, forceCreateMessage = false)
{
    Gamedig.query({
        type: process.env.GAME_TYPE,
        host: process.env.GAME_IP,
        port: process.env.GAME_PORT,
        port_query: process.env.GAME_QUERY_PORT
    }).then(data => {
        failedRefreshAttempts = 0;
        
        client.user.setActivity(`${locale.playingMessage} ${data.raw.numplayers}/${data.maxplayers} | ${data.map}`, 'PLAYING');

        if (editMessage)
            createMessage(data, 'ok', forceCreateMessage);
    }).catch(error => {
        failedRefreshAttempts++;

        console.warn(
            `Failed to refresh data!
            Remaining attempts ${failedRefreshAttempts} / ${process.env.MAXIMUM_REFRESH_FAILURES}
            ${error}`
        );

        if (failedRefreshAttempts > process.env.MAXIMUM_REFRESH_FAILURES)
        {
            client.user.setActivity(locale.serverNotResponding, 'PLAYING');
            
            createMessage({}, 'error');
            
            console.error(error);

            failedRefreshAttempts = 0;
        }
    });
}

/**
 * Creates the actual message in a Discord channel.
 *
 * @param {Object} [data={}] Server query from GameDig.
 * @param {string} [status='ok'] Type of a message to return ('ok' or 'error')
 * @param {boolean} [forceCreateMessage=false] Should we force to create a new message?
 */
function createMessage(data = {}, status = 'ok', forceCreateMessage = false)
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

            let players = `**${data.raw.numplayers} ${locale.richEmbed.normal.playerCount.outOf} ${data.maxplayers}**\n`;

            Object.entries(data.players).forEach(element => {
                let object = element[1];

                players += `- ${object.name}\n`;
            });

            let embed = 
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
                    {
                        name: locale.richEmbed.normal.playerCount.players,
                        value: players
                    },
                ],
                timestamp: new Date(),
            };

            if (getLastMessageID() === '' || forceCreateMessage)
            {
                client.channels.get(channel).send({
                    embed
                }).then(message => setLastMessageID(message.id));
            }
            else
            {
                client.channels.get(channel).fetchMessage(getLastMessageID()).then(message => {
                    message.edit({ embed });
                });
            }
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
            }).then(message => setLastMessageID(message.id));
        }
    }
}

// When bot is started and ready - update the status
client.on('ready', () => {
    updateInfo(true);
});

// If someone posts !update then refresh
client.on('message', message => {
    if (message.content === process.env.REFRESH_COMMAND)
    {
        message.channel.send(locale.refreshing);
        
        updateInfo(true, true);
    }
});

// Time to recheck the server status
setInterval(() => {
    updateInfo(true);
}, process.env.TIME_TO_CHECK_MINUTES * 1000 * 60);

// Login with the secret
client.login(process.env.SECRET);