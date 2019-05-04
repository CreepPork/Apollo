import * as gamedig from 'gamedig';

export default class Server {
    public query?: gamedig.QueryResult;

    private ip: string;
    private port: number;

    constructor(ip: string, port: number) {
        this.ip = ip;
        this.port = port;
    }

    public queryServer(): Promise<gamedig.QueryResult> {
        return new Promise((resolve, reject) => {
            gamedig.query({
                host: this.ip,
                port: this.port,
                type: 'arma3',
            })
            .then(query => {
                this.query = query;
                resolve(query);
            })
            .catch(error => {
                console.warn(error);
            });
        });
    }
}
