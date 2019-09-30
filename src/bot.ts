import { Message } from 'discord.js';
import { QueryResult } from 'gamedig';
import Discord from './discord';
import Environment from './environment';
import Server from './server';
import Settings from './settings';

export default class Bot {
    private discord: Discord;
    private server: Server;

    private refreshFails = 0;
    private maxRefreshFails = Environment.get<number>('maximum_refresh_failures', 'number');

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
    }

    public start() {
        this.discord.client.on('ready', () => {
            this.refresh();

            this.refreshLoop();

            console.info('Apollo is ready.');
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
        }
    }

    private refreshBotWithRolePermissions(message: Message) {
                        const roles = this.discord.getAllRoles(message.member.guild.id);

                        if (roles) {
                            const serverManager = roles.get(Environment.get('server_manager_role_id'));

                            if (serverManager) {
                                const allowedRoles = this.discord.getRolesAboveOrSame(serverManager);

                                if (this.discord.doesUserHaveRoles(message.member, allowedRoles)) {
                                    this.refresh(true);
                                } else {
                                    if (Environment.get<boolean>('reply_dm_on_no_perms', 'boolean')) {
                                        message.author.send(`${message.member} ${Environment.locale.noPermissions}`);
                                    } else {
                                        message.channel.send(`${message.member} ${Environment.locale.noPermissions}`);
                                    }
                                }
                            } else {
                                console.warn(
                                    'You have turned on limit force refresh to server managers or above.',
                                    `I can't find the server manager role. Did you enter the ID correctly?`,
                                );

                                this.refresh(true);
                            }
                        } else {
                            console.warn(
                                'You have turned on limit force refresh to server managers or above.',
                                `But I can't find any server roles. Does your server have roles set up?`,
                            );

                            this.refresh(true);
                        }
    }

    private async refresh(forceNewMessage = false) {
        await this.discord.startThinking();

        const messageId = Settings.get().messageId;
        const query = await this.query;

        if (messageId && ! forceNewMessage) {
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

        if (! query) {
            if (! errorMessageId) {
                this.postErrorMessage();
            }
        } else {
            if (errorMessageId) {
                this.discord.deleteMessage(errorMessageId);
                Settings.set('errorMessageId', undefined);
            }
        }
    }

    private refreshLoop() {
        const timeToWait = Environment.get<number>('time_to_check_minutes', 'number') * 1000 * 60;

        setInterval(() => {
            this.refresh();
        }, timeToWait);
    }

    private postErrorMessage() {
        const ping = this.discord.generatePing(Environment.get('server_manager_role_id'));
        const content = `${ping}${Environment.locale.serverDownMessages.pingMessage}`;

        this.discord.postMessage(content).then(errorMessageId => {
            Settings.set('errorMessageId', errorMessageId);
        });
    }
}
