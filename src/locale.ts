export default interface ILocale {
    address: string;
    maintenanceMessages: {
        disabled: string;
        enabled: string;
    };
    map: string;
    mission: string;
    noMap: string;
    noPermissions: string;
    noPlayers: string;
    pingMessage: string;
    playerCount: string;
    playerList: string;
    presence: {
        botFailure: string;
        ok: string,
        error: string;
        maintenance: string;
    };
    queryTime: string;
    serverDownForMaintenance: string;
    serverDownForMaintenanceDescription: string;
    serverDownMessages: {
        pingMessage: string;
        serverDownAlternative: string;
        pleaseFixServer: string;
    };
    serverOffline: string;
    statuses: {
        offline: string,
        online: string,
        status: string,
    };
    tooManyPlayers: string;
}
