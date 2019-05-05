import Locale from '../locale';

export default class LocaleEnglish extends Locale {
    public queryTime = 'Query Time';
    public statuses = {
        offline: 'Offline',
        online: 'Online',
        status: 'Status',
    };
    public address = 'Address';
    public map = 'Map';
    public mission = 'Mission';
    public playerCount = 'Player count';
    public playerList = 'Player list';
    public noPlayers = 'No players';
    public serverOffline = 'Server is offline!';
    public presence = {
        error: 'server managers fixing the server',
        ok: 'Zeus on',
    };
}
