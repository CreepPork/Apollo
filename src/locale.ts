export default class Locale implements ILocale {
    public queryTime = '';
    public statuses = {
        offline: '',
        online: '',
        status: '',
    };
    public address = '';
    public map = '';
    public mission = '';
    public playerCount = '';
    public playerList = '';
}

export interface ILocale {
    queryTime: string;
    statuses: {
        offline: string,
        online: string,
        status: string,
    };
    address: string;
    map: string;
    mission: string;
    playerCount: string;
    playerList: string;
}
