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
        });

        this.discord.client.on('message', message => {
            if (message.content === Environment.get<string | undefined>('refresh_command', 'string', true)) {
                this.refresh();
            } else if (message.content ===
                Environment.get<string | undefined>('refresh_force_command', 'string', true)) {
                    if (Environment.get<boolean>('limit_refresh_force_to_manager', 'boolean')) {
                        if (message.member.roles.get(Environment.get('server_manager_role_id'))) {
                            this.refresh(true);
                        } else {
                            this.discord.postMessage(`${message.member} ${Environment.locale.noPermissions}`);
                        }
                    } else {
                        this.refresh(true);
                    }
            }
        });
    }

    private async refresh(forceNewMessage = false) {
        await this.discord.startThinking();

        const messageId = Settings.get().messageId;
        const query = await this.query;

        if (messageId && ! forceNewMessage) {
            this.discord.editMessage(messageId, await this.discord.createRichEmbed(query)).then(() => {
                this.discord.setActivity(query ? 'ok' : 'serverError', query);
                this.discord.stopThinking();
            }).catch(() => {
                this.discord.setActivity('botError');
                this.discord.stopThinking();
            });
        } else {
            if (forceNewMessage && messageId) {
                this.discord.deleteMessage(messageId);
            }

            this.discord.postMessage(await this.discord.createRichEmbed(query)).then(newId => {
                Settings.set('messageId', newId);

                this.discord.setActivity(query ? 'ok' : 'serverError', query);
                this.discord.stopThinking();
            }).catch(() => {
                this.discord.setActivity('botError');
                this.discord.stopThinking();
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
