import Discord from './discord';
import Environment from './environment';
import Server from './server';

export default class Bot {
    private discord: Discord;
    private server: Server;

    private get query() {
        return this.server.queryServer();
    }

    constructor() {
        this.discord = new Discord(Environment.get('ip'));
        this.server = new Server(Environment.get('ip'), Environment.getNumber('port'));
    }

    public async start(): Promise<void> {
        this.discord.client.on('ready', async () => {
            const query = await this.query;

            const embed = await this.discord.createRichEmbed(query);
            this.discord.setActivity(query);

            this.discord.postMessage(embed);
        });

        this.discord.client.on('message', async message => {
            if (message.content === Environment.get('refresh_command')) {
                this.discord.postMessage(await this.discord.createRichEmbed(await this.query));
            }
        });
    }

    private refresh() {

    }
}
