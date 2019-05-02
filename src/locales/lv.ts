import Locale from '../locale';

export default class LocaleLatvian extends Locale {
    public queryTime = 'Atjauninājuma laiks';
    public statuses = {
        offline: 'Nepieejams',
        online: 'Pieejams',
        status: 'Statuss',
    };
    public address = 'Adrese';
    public map = 'Karte';
    public mission = 'Misija';
    public playerCount = 'Spēlētāju skaits';
    public playerList = 'Spēlētāju saraksts';
}
