import Bot from './Bot';
import Environment from './Environment';
import Sentry from './Sentry';

if (Environment.get('sentry_dsn', 'string', true)) {
    Sentry.init();
}

new Bot().start();
