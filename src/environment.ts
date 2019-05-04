import * as dotenv from 'dotenv';

import Locale from './locale';

dotenv.config();

export default class Environment {
    public static get locale(): Locale {
        if (! process.env.LOCALE) {
            throw new Error('LOCALE is not defined in your .env file.');
        }

        const locale: {default: typeof Locale} = require(`./locales/${process.env.LOCALE}`);

        return new locale.default();
    }

    public static get(value: string): string {
        value = value.toUpperCase();

        // tslint:disable-next-line: no-eval
        const convertedValue: string | undefined = eval(`process.env.${value}`);

        if (convertedValue) {
            return convertedValue;
        }

        throw new Error(`${value} is not defined in your .env file.`);
    }

    public static getNumber(value: string): number {
        return parseInt(this.get(value), 10);
    }
}

export interface IColors {
    error: string;
    ok: string;
}
