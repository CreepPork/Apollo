import ILocale from '../locale';

const locale: ILocale = {
    address: 'Adrese',
    maintenanceMessages: {
        disabled: 'Es izslēdzu apkopes režīmu un atkal sekoju līdzi serverim!',
        enabled: 'Es ieslēdzu apkopes režīmu un vairāk nesekošu līdzi izmaiņām serverī!',
    },
    map: 'Karte',
    mission: 'Misija',
    noMap: 'Nav Izvēlēta Karte',
    noPermissions: `tev nav piekļuves, lai es izpildītu šo komandu!`,
    noPlayers: 'Nav spēlētāju',
    pingMessage: 'spēlētāju skaits tika sasniegts. Nākat spēlēt!',
    playerCount: 'Spēlētāju skaits',
    playerList: 'Spēlētāju saraksts',
    presence: {
        botFailure: 'bota kļūdu',
        error: 'kā serveri labo',
        maintenance: 'kā apkalpo serveri',
        ok: 'Misija uz',
    },
    queryTime: 'Atjauninājuma laiks',
    serverDownForMaintenance: 'Notiek servera apkope',
    serverDownForMaintenanceDescription: 'Serverim pašlaik notiek paradzēta apkope. Pārbaudiet statusu vēlāk!',
    serverDownMessages: {
        pingMessage: ', serveris neatbild, lūdzu salabo!',
        pleaseFixServer: ', lūdzu, salabo serveri!',
        serverDownAlternative: 'Serveris neatbild!',
    },
    serverOffline: 'Serveris nav pieejams',
    statuses: {
        offline: 'Nepieejams',
        online: 'Pieejams',
        status: 'Statuss',
    },
    tooManyPlayers: 'Pārāk daudz spēlētāju, lai visus parādītu',
};

export default locale;
