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

        steamappid: number;
        numplayers: number;
        numbots: number;
        listentype: string;
        environment: string;
        secure: number;

        /**
         * Returns server version `1.xx.xxxxxx`.
         */
        version: string;

        steamid: string;

        /**
         * Returns mission gamemodes (tags) but it's in some special format.
         *
         * @example `bf,r192,n0,s7,i1,mf,lf,vt,dt,tzeus,g65545,h1c62bb72,f0,c0-52,pl,e15,j0,k0,`
         */
        tags: string;

        gameid: string;

        /**
         * Proprietary format for possible addon name, keys and version.
         */
        rules: object;
    }
}
