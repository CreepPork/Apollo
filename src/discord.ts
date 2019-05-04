import * as discord from 'discord.js';

import { QueryResult } from 'gamedig';
import Environment, { IColors } from './environment';
import Locale from './locale';
import Time from './time';

export default class Discord {
    // tslint:disable-next-line: variable-name
    private _client: discord.Client;
    private locale: Locale;

    public get client(): discord.Client {
        return this._client;
    }

    constructor(secret: string) {
        this._client = new discord.Client();
        this._client.login(secret).catch(error => console.error(error));

        this.locale = Environment.locale;
    }

    public async createRichEmbed(query?: QueryResult) {
        if (query) {
            return new discord.RichEmbed({
                color: await this.getColor('ok'),
                description: '–'.repeat(query.name.length),
                fields: await this.getSuccessFields(query),
                timestamp: new Date(),
                title: query.name,
            });
        } else {
            return new discord.RichEmbed({
                color: await this.getColor('error'),
                description: '–'.repeat(this.locale.serverOffline.length),
                fields: await this.getErrorFields(),
                timestamp: new Date(),
                title: this.locale.serverOffline,
            });
        }
    }

    public setActivity(query?: QueryResult) {
        if (query) {
            this._client.user.setPresence({
                game: {
                    name: `${this.locale.presence.ok} ${query.map} (${query.players.length}/${query.maxplayers})`,
                    type: 'PLAYING',
                },
                status: 'online',
            }).catch(error => {
                console.error(error);
            });
        } else {
            this._client.user.setPresence({
                game: {
                    name: this.locale.presence.error,
                    type: 'WATCHING',
                },
                status: 'dnd',
            }).catch(error => {
                console.error(error);
            });
        }
    }

    public postMessage(embed: discord.RichEmbed): Promise<discord.Message | discord.Message[]> {
        return new Promise(async (resolve, reject) => {
            const channel = this._client.channels.get(Environment.get('channel_id'));

            if (channel) {
                // @ts-ignore It's really bad design of discord.js
                channel.send({ embed }).then(message => {
                    resolve(message);
                }).catch((error: any) => reject(error));
            }
        });
    }

    private getColor(status: 'error' | 'ok'): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const colors: IColors = {ok: Environment.get('color_ok'), error: Environment.get('color_error')};

            if (status === 'error') { resolve(colors.error); }
            if (status === 'ok') { resolve(colors.ok); }

            reject(`${status} is not a valid status.`);
        });
    }

    private async getErrorFields(): Promise<IField[]> {
        return [
            {
                inline: false,
                name: this.locale.statuses.status,
                value: this.locale.statuses.offline,
            },
        ];
    }

    private async getSuccessFields(query: QueryResult): Promise<IField[]> {
        const playerListData = ['```py'];

        if (query.players.length) {
            // Sort alphabetically
            query.players.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

            query.players.forEach(player => {
                playerListData.push(`• ${player.name} (${Time.secondsToHhMmSs(player.time)})`);
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
                value: `steam://connect/${Environment.get('ip')}:${Environment.get('port')}`,
            },
            {
                inline: false,
                name: this.locale.map,
                value: query.map,
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
