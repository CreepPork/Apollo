import Environment from './environment';

export default class Bot {
    public async start(): Promise<void> {
        const locale = await Environment.locale;
    }
}
