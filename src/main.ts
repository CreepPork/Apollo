import Bot from './bot';
import Environment from './environment';
import Sentry from './sentry';

if (Environment.get('sentry_dsn', 'string', true)) {
    Sentry.init();
}

new Bot().start();
