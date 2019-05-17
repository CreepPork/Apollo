/// <reference types="node" />

declare module 'gamedig' {
    export type Type = "arma3";

    export interface Player {
        name: string;
        score: number;
        time: number;
    }

    export interface QueryOptions {
        type: Type;
        host: string;
        port?: number;
        notes?: object;
        maxAttempts?: number;
        socketTimeout?: number;
        attemptTimeout?: number;
    }

    export interface QueryResult {
        name: string;
        map: string;
        password: boolean;
        maxplayers: number;
        players: Player[];
        notes: object;
        raw: ArmaRaw;
        query?: object;
    }

    export function query(
        options: QueryOptions,
        callback: (error: any, state: QueryResult) => void
    ): void;

    export function query(options: QueryOptions): Promise<QueryResult>;

    /**
     * See this [Gist](https://gist.github.com/CreepPork/2223be9e242fcfa04ba6155dc8617444) for more details.
     */
    export interface ArmaRaw {
        protocol: number;

        /**
         * Always returns `Arma3`.
         */
        folder: string;

        /**
         * Returns mission name.
         */
        game: string;

        /**
         * Seems to always return 0 for Arma 3.
         */
        steamappid: 0;

        numplayers: number;
        numbots: 0;

        /**
         * Server type. `d` for dedicated, `l` for non-dedicated.
         */
        listentype: 'd' | 'l';

        /**
         * Returns server OS. `w` for Windows and `l` for Linux.
         */
        environment: 'w' | 'l';

        /**
         * Returns if server is password protected.
         */
        secure: 0 | 1;

        /**
         * Returns server version `1.xx.xxxxxx`.
         */
        version: string;

        /**
         * Server's steam ID
         */
        steamid: string;

        /**
         * Returns mission gamemodes (tags) but it's in some special format.
         *
         * @example `bf,r192,n0,s7,i1,mf,lf,vt,dt,tzeus,g65545,h1c62bb72,f0,c0-52,pl,e15,j0,k0,`
         */
        tags: string;

        gameid: string;

        /**
         * Unescaped object of strings with loaded public keys on the server (for addons).
         */
        rules: {
            [x: string]: string,
            // '\u0001\u0004': '\u0002\u0001\u0002w\u0003�\u0001\u0001�\u0016N����=�>�2\u0018�j.I]\u0010�\t`���S�QW�|\u0001\u0003\u0001\u0002\u001a\u0019cba_3.9.0.181012-85445afa\u0012AdvancedRappelling\nstui_1.2.3\u0018jsrs_soundmod_cup_compat\ns',
            // '\u0002\u0004': 'tui_1.2.4\u000eVictor9401_dev\tbadbenson\u001acba_3.11.1.190503-4a491780\u0013jsrs_soundmod_extra\u000fachilles_v1.2.1\u00052600K\fachilles_dev\rjsrs_sound',
            // '\u0003\u0004': 'mod\u0019cba_3.7.1.180604-52b821f0\nstui_1.2.2\u000bruPal_mpkey\u0002a3\u0019cba_3.7.0.180430-b062cd5b\u001acba_3.11.0.190501-91b213d1\u000fachilles_v1.2.0\u001acb',
            // '\u0004\u0004': 'a_3.10.1.190316-15d15f54\u0019cba_3.9.1.181229-cc913854\u001acba_3.11.2.190515-cec0e465\t2600K_dev\u0003ATH\u0019cba_3.8.0.180801-4965324d'
        }
    }
}
