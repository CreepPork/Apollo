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
    public noPlayers = 'Nav spelētāju';
    public serverOffline = 'Serveris nav pieejams!';
    public presence = {
        error: 'skatos, kā admini labo serveri',
        ok: 'Zevs uz',
    };
}
