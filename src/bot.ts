import { Message } from 'discord.js';
import { QueryResult } from 'gamedig';
import Discord from './discord';
import Environment from './environment';
import Server from './server';
import Settings from './settings';
import Time from './time';

export default class Bot {
    private discord: Discord;
    private server: Server;

    private refreshFails = 0;
    private maxRefreshFails = Environment.get<number>('maximum_refresh_failures', 'number');

    private maintenanceMode: boolean;

    private get query(): Promise<QueryResult | undefined> {
        return new Promise(resolve => {
            this.server.queryServer().then(query => {
                if (query) {
                    resolve(query);
                } else {
                    this.refreshFails++;

                    console.warn(
                        `Failed to refresh server info.`,
                        `Remaining retries: ${this.refreshFails}/${this.maxRefreshFails}`,
                    );

                    this.discord.stopThinking();

                    if (this.refreshFails >= this.maxRefreshFails) {
                        this.refreshFails = 0;

                        this.discord.startThinking();

                        console.error('Failed to refresh server info, emitting error.');

                        resolve(undefined);
                    }
                }
            });
        });
    }

    constructor() {
        this.discord = new Discord(Environment.get('secret'));
        this.server = new Server(Environment.get('ip'), Environment.get<number>('port', 'number'));
        this.maintenanceMode = false;
    }

    public start() {
        this.discord.client.on('ready', async () => {
            console.info('Apollo is ready.');
            console.info('Performing first-start refresh.');

            await this.refresh();

            console.info('First-time refresh done, starting refresh loop.');
            this.refreshLoop();
        });

        this.discord.client.on('message', message => this.onMessage(message));
    }

    private onMessage(message: Message) {
        // If posted message is the plain !update then refresh bot embed and status
        if (message.content === Environment.get<string | undefined>('refresh_command', 'string', true)) {
            this.refresh();
        } else if (message.content === Environment.get<string | undefined>('refresh_force_command', 'string', true)) {
            // If posted message is !updateForce then check if permission checking is enabled.
            if (Environment.get<boolean>('limit_refresh_force_to_manager', 'boolean')) {
                this.refreshBotWithRolePermissions(message);
            } else {
                this.refresh(true);
            }
        } else if (message.content === Environment.get('maintenance_toggle_command', 'string', true)) {
            if (message.member && this.discord.doesUserHaveServerManagerPermissions(message.member)) {
                this.toggleMaintenanceMode(message);
            } else {
                this.replyNoPermissions(message);
            }
        }
    }

    private async toggleMaintenanceMode(message: Message) {
        // Maintenance mode turned off
        if (this.maintenanceMode) {
            this.maintenanceMode = false;

            this.postMaintenanceMessage(message);

            this.refresh();
        } else {
            // Maintenance mode turned on
            this.maintenanceMode = true;

            this.discord.startThinking();

            this.postMaintenanceMessage(message);

            // If an error message was posted, remove it
            this.removeErrorMessage();

            // If an embed was already posted
            const messageId = Settings.get().messageId;
            const embed = await this.discord.createRichEmbed(undefined, this.maintenanceMode);

            if (messageId) {
                await this.discord.editMessage(messageId, embed);
            } else {
                const id = await this.discord.postMessage(embed);
                Settings.set('messageId', id);
            }

            this.discord.setActivity('maintenance', undefined);

            this.discord.stopThinking();
        }
    }

    private refreshBotWithRolePermissions(message: Message) {
        if (message.member && this.discord.doesUserHaveServerManagerPermissions(message.member)) {
            this.refresh(true);
        } else {
            this.replyNoPermissions(message);
        }
    }

    private replyNoPermissions(message: Message) {
        if (Environment.get<boolean>('reply_dm_on_no_perms', 'boolean')) {
            message.author.send(`${message.member} ${Environment.locale.noPermissions}`);
        } else {
            message.channel.send(`${message.member} ${Environment.locale.noPermissions}`);
        }
    }

    private async refresh(forceNewMessage = false) {
        if (this.maintenanceMode) { return; }

        this.discord.startThinking();

        const messageId = Settings.get().messageId;
        const query = await this.query;

        if (messageId && !forceNewMessage) {
            this.discord.editMessage(messageId, await this.discord.createRichEmbed(query)).then(() => {
                this.discord.setActivity(query ? 'ok' : 'serverError', query);
                this.discord.stopThinking();
            }).catch(error => {
                this.discord.setActivity('botError');
                this.discord.stopThinking();

                console.error(`Failed to edit current message, id: ${messageId}.`);
                console.error(error);
            });
        } else {
            if (forceNewMessage && messageId) {
                this.discord.deleteMessage(messageId);
            }

            this.discord.postMessage(await this.discord.createRichEmbed(query)).then(newId => {
                Settings.set('messageId', newId);

                this.discord.setActivity(query ? 'ok' : 'serverError', query);
                this.discord.stopThinking();
            }).catch(error => {
                this.discord.setActivity('botError');
                this.discord.stopThinking();

                console.error('Failed to create a new message.');
                console.error(error);
            });
        }

        const errorMessageId = Settings.get().errorMessageId;

        if (!query) {
            if (!errorMessageId) {
                this.postErrorMessage();
            }
        } else {
            this.removeErrorMessage();
        }

        // Post role ping message if threshold reached
        if (query) {
            const minPlayers = Environment.get<number>('minimum_player_count_for_ping', 'number', true);
            if (query.players.length >= minPlayers) {
                // Don't duplicate the message
                if (!Settings.get().pingMessageId) {
                    const pingMessageId = await this.discord.postMessage(
                        this.discord.generatePing(Environment.get('reaction_role_id')) +
                        ` ${minPlayers} ${Environment.locale.pingMessage}`,
                    );

                    Settings.set('pingMessageId', pingMessageId);
                    Settings.set('lastPingMessageTime', new Date().toISOString());
                }
            } else {
                const settings = Settings.get();

                if (settings.pingMessageId && settings.lastPingMessageTime) {
                    if (Time.getDiffMinutes(new Date(), new Date(settings.lastPingMessageTime)) >=
                        Environment.get<number>('timeout_between_player_pings_in_minutes', 'number', false)) {
                        this.discord.deleteMessage(settings.pingMessageId);

                        Settings.set('pingMessageId', undefined);
                    }
                }
            }
        }
    }

    private removeErrorMessage() {
        const errorMessageId = Settings.get().errorMessageId;
        if (errorMessageId) {
            this.discord.deleteMessage(errorMessageId);
            Settings.set('errorMessageId', undefined);
        }
    }

    private refreshLoop() {
        const timeToWait = Environment.get<number>('time_to_check_minutes', 'number') * 1000 * 60;

        setInterval(async () => {
            await this.refresh();
        }, timeToWait);
    }

    private postErrorMessage() {
        const ping = this.discord.generatePing(Environment.get('server_manager_role_id'));
        const content = `${ping}${Environment.locale.serverDownMessages.pingMessage}`;

        this.discord.postMessage(content).then(errorMessageId => {
            Settings.set('errorMessageId', errorMessageId);
        });
    }

    private postMaintenanceMessage(message: Message) {
        const content = this.maintenanceMode
            ? Environment.locale.maintenanceMessages.enabled
            : Environment.locale.maintenanceMessages.disabled;

        message.author.send(content);
    }
}
