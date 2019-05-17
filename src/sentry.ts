import { CaptureConsole, RewriteFrames } from '@sentry/integrations';
import * as sentry from '@sentry/node';
import Environment from './environment';

export default class Sentry {
    public static init() {
        global.__rootdir__ = __dirname || process.cwd();

        sentry.init({
            dsn: Environment.get('sentry_dsn'),
            integrations: [
                new RewriteFrames({
                    root: global.__rootdir__,
                }),
                new CaptureConsole(),
            ],
        });

        console.info('Sentry initalized.');
    }
}
