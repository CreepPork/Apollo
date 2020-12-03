import { RewriteFrames } from '@sentry/integrations';
import * as sentry from '@sentry/node';
import Environment from './environment';

const { name, version } = require('../package.json');

export default class Sentry {
    public static init() {
        global.__rootdir__ = __dirname || process.cwd();

        sentry.init({
            dsn: Environment.get('sentry_dsn'),
            integrations: [
                new RewriteFrames({
                    root: global.__rootdir__,
                }),
            ],
            release: `${name}@${version}`,
        });

        console.info('Sentry initalized.');
    }
}
