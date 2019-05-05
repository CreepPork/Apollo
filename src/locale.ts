export default interface ILocale {
    address: string;
    map: string;
    mission: string;
    noPermissions: string;
    noPlayers: string;
    playerCount: string;
    playerList: string;
    presence: {
        botFailure: string;
        ok: string,
        error: string;
    };
    queryTime: string;
    serverDownMessages: {
        pingMessage: string;
    };
    serverOffline: string;
    statuses: {
        offline: string,
        online: string,
        status: string,
    };
}
