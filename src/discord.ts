import * as discord from 'discord.js';

import { QueryResult } from 'gamedig';
import Environment, { IColors } from './environment';
import Locale from './locale';
import Time from './time';

export default class Discord {
    // tslint:disable-next-line: variable-name
    private _client: discord.Client;
    private locale: Locale;

    private loginInterval?: NodeJS.Timeout;

    public get client(): discord.Client {
        return this._client;
    }

    private get channel(): discord.TextChannel | discord.GroupDMChannel | discord.DMChannel | undefined {
        /// @ts-ignore Typings are incorrect, it returns extended types of channels
        return this._client.channels.get(Environment.get('channel_id'));
    }

    constructor(secret: string) {
        this._client = new discord.Client();

        // Retry Discord auth every 10 seconds if failed
        this._client.login(secret).catch(error => {
            this.loginInterval = setInterval(() => {
                this._client.login(secret).then(() => {
                    if (this.loginInterval) {
                        clearInterval(this.loginInterval);
                        this.loginInterval = undefined;
                    }
                });
            }, 10 * 1000);

            console.error(error);
        });

        this.locale = Environment.locale;
    }

    public async createRichEmbed(query?: QueryResult, maintenanceMode?: boolean) {
        if (query) {
            return new discord.RichEmbed({
                color: await this.getColor('ok'),
                // As the ─ is just a little larger than the actual letters, it isn't equal to the letter count
                description: this.getDescriptionRepeater(query.name),
                fields: await this.getSuccessFields(query),
                timestamp: new Date(),
                title: query.name,
            });
        } else if (maintenanceMode) {
            return new discord.RichEmbed({
                color: await this.getColor('maintenance'),
                description: this.getDescriptionRepeater(this.locale.serverDownForMaintenance),
                fields: this.getMaintenanceFields(),
                timestamp: new Date(),
                title: this.locale.serverDownForMaintenance,
            });
        } else {
            return new discord.RichEmbed({
                color: await this.getColor('error'),
                description: this.getDescriptionRepeater(this.locale.serverOffline),
                fields: this.getErrorFields(),
                timestamp: new Date(),
                title: this.locale.serverOffline,
            });
        }
    }

    public setActivity(status: 'ok' | 'serverError' | 'botError' | 'maintenance', query?: QueryResult) {
        if (query && status === 'ok') {
            let name = `${this.locale.presence.ok} ${query.map} (${query.players.length}/${query.maxplayers})`;

            if (! query.map) {
                name = `${this.locale.noMap} (${query.players.length}/${query.maxplayers})`;
            }

            this._client.user.setPresence({
                game: {
                    name,
                    type: 'PLAYING',
                },
                status: 'online',
            }).catch(error => console.error(error));
        } else if (status === 'serverError') {
            this._client.user.setPresence({
                game: {
                    name: this.locale.presence.error,
                    type: 'WATCHING',
                },
                status: 'dnd',
            }).catch(error => console.error(error));
        } else if (status === 'maintenance') {
            this._client.user.setPresence({
                game: {
                    name: this.locale.presence.maintenance,
                    type: 'WATCHING',
                },
            }).catch(error => console.error(error));
        } else {
            this._client.user.setPresence({
                game: {
                    name: this.locale.presence.botFailure,
                    type: 'STREAMING',
                },
                status: 'idle',
            }).catch(error => console.error(error));
        }
    }

    public postMessage(content: discord.RichEmbed | string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.channel) {
                this.channel.send(typeof content === 'string' ? content : { embed: content }).then(messages => {
                    if (Array.isArray(messages)) {
                        resolve(messages[0].id);
                    } else {
                        resolve(messages.id);
                    }
                }).catch(error => reject(error));
            } else {
                reject('Channel does not exist.');
            }
        });
    }

    public editMessage(messageId: string, embed: discord.RichEmbed): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.channel) {
                this.channel.fetchMessage(messageId).then(message => {
                    message.edit({ embed })
                        .then(editedMessage => resolve(editedMessage.id))
                        .catch(error => reject(error));
                }).catch((error: any) => reject(error));
            } else {
                reject('Channel does not exist.');
            }
        });
    }

    public deleteMessage(messageId: string): Promise<discord.Message> {
        return new Promise((resolve, reject) => {
            if (this.channel) {
                this.channel.fetchMessage(messageId).then(message => {
                    message.delete().then(deletedMessage => {
                        resolve(deletedMessage);
                    });
                }).catch(error => reject(error));
            } else {
                reject('Channel does not exist.');
            }
        });
    }

    public startThinking(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.channel) {
                resolve(this.channel.startTyping());
            } else {
                reject('Channel does not exist.');
            }
        });
    }

    public stopThinking(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.channel) {
                resolve(this.channel.stopTyping());
            } else {
                reject('Channel does not exist.');
            }
        });
    }

    public generatePing(id: string): string {
        return `<@&${id}>`;
    }

    public getAllRoles(guildId: string): discord.Collection<discord.Snowflake, discord.Role> | undefined {
        const guild = this.client.guilds.get(guildId);

        if (guild) {
            return guild.roles;
        } else {
            return undefined;
        }
    }

    public getRolesAboveOrSame(role: discord.Role): discord.Role[] {
        const allRoles = this.getAllRoles(role.guild.id);

        const roles: discord.Role[] = [];

        if (allRoles) {
            allRoles.forEach(dRole => {
                if (dRole.comparePositionTo(role) > 0) {
                    roles.push(dRole);
                } else if (dRole.comparePositionTo(role) === 0) {
                    roles.push(dRole);
                }
            });
        }

        return roles;
    }

    public doesUserHaveRoles(member: discord.GuildMember, roles: discord.Role[]): boolean {
        let hasRole = false;

        roles.forEach(role => {
            if (member.roles.has(role.id)) {
                hasRole = true;
            }
        });

        return hasRole;
    }

    private getColor(status: keyof IColors): Promise<string> {
        return new Promise((resolve, reject) => {
            const colors: IColors = {
                error: Environment.get('color_error'),
                maintenance: Environment.get('color_maintenance'),
                ok: Environment.get('color_ok'),
            };

            switch (status) {
                case 'error':
                    resolve(colors.error);
                    break;

                case 'ok':
                    resolve(colors.ok);
                    break;

                case 'maintenance':
                    resolve(colors.maintenance);
                    break;
            }

            reject(`${status} is not a valid status.`);
        });
    }

    private getDescriptionRepeater(text: string): string {
        // Repeat the dashes for 62.5% of the text length
        return '─'.repeat(text.length * 0.625);
    }

    private getErrorFields(): IField[] {
        return [
            {
                inline: false,
                name: this.locale.statuses.status,
                value: this.locale.statuses.offline,
            },
            {
                inline: false,
                name: this.locale.serverDownMessages.serverDownAlternative,
                value: `${this.generatePing(Environment.get('server_manager_role_id'))}` +
                    `${this.locale.serverDownMessages.pleaseFixServer}`,
            },
        ];
    }

    private getMaintenanceFields(): IField[] {
        return [{
            inline: false,
            name: this.locale.statuses.status,
            value: this.locale.statuses.offline,
        }, {
            inline: false,
            name: this.locale.serverDownForMaintenance,
            value: this.locale.serverDownForMaintenanceDescription,
        }];
    }

    private async getSuccessFields(query: QueryResult): Promise<IField[]> {
        const playerListData = ['```py'];

        if (query.players.length) {
            // Sort alphabetically
            query.players.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

            query.players.forEach(player => {
                playerListData.push(`• ${player.name} (${Time.secondsToHhMm(player.time)})`);
            });
        } else {
            playerListData.push(this.locale.noPlayers);
        }

        playerListData.push('```');

        return [
            {
                inline: false,
                name: this.locale.statuses.status,
                value: this.locale.statuses.online,
            },
            {
                inline: false,
                name: this.locale.address,
                value: `steam://connect/${Environment.get('display_ip')}:${Environment.get('port')}`,
            },
            {
                inline: false,
                name: this.locale.map,
                value: query.map ? query.map : this.locale.noMap,
            },
            {
                inline: false,
                name: this.locale.mission,
                value: query.raw.game,
            },
            {
                inline: false,
                name: this.locale.playerCount,
                value: `${query.players.length}/${query.maxplayers}`,
            },
            {
                inline: false,
                name: this.locale.playerList,
                value: playerListData.join('\n'),
            },
        ];
    }
}

interface IField {
    inline?: boolean;
    name: string;
    value: string;
}
