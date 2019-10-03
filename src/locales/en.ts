import ILocale from '../locale';

const locale: ILocale = {
    address: 'Address',
    maintenanceMessages: {
        disabled: `I've disabled maintenance mode and I am polling the server once more!`,
        enabled: `I've enabled maintenance mode and will no longer poll the server!`,
    },
    map: 'Map',
    mission: 'Mission',
    noMap: 'No Map Selected',
    noPermissions: `you don't have the permissions to do that!`,
    noPlayers: 'No players',
    pingMessage: 'player threshold has been reached on the server. Hop on now!',
    playerCount: 'Player count',
    playerList: 'Player list',
    presence: {
        botFailure: 'bot failure',
        error: 'the server getting fixed',
        maintenance: 'maintenance happen',
        ok: 'Zeus on',
    },
    queryTime: 'Query Time',
    serverDownForMaintenance: 'Down for maintenance',
    serverDownForMaintenanceDescription: 'The server is currently down for maintenance. Please check back later!',
    serverDownMessages: {
        pingMessage: ', the server is not responding, please fix it!',
        pleaseFixServer: ', please fix the server!',
        serverDownAlternative: 'Server is down!',
    },
    serverOffline: 'Server is offline!',
    statuses: {
        offline: 'Offline',
        online: 'Online',
        status: 'Status',
    },
};

export default locale;
