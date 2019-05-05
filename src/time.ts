import * as moment from 'moment';

export default class Time {
    public static secondsToHhMm(seconds: number): string {
        return moment.utc(seconds * 1000).format('HH:mm');
    }
}
