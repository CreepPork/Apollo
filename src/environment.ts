import * as dotenv from 'dotenv';

import Locale from './locale';

dotenv.config();

export default class Environment {
    static get locale(): Promise<Locale> {
        return new Promise((resolve, reject) => {
            if (! process.env.LOCALE) {
                reject('Locale is not defined in your .env file.');
            }

            import(`./locales/${process.env.LOCALE}`).then((locale: {default: (typeof Locale)}) => {
                resolve(new locale.default());
            });
        });
    }
}
