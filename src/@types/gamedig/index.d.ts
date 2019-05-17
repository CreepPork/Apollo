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
         * Unescaped string with loaded public keys on the server (for addons).
         */
        rules: object;
    }
}
