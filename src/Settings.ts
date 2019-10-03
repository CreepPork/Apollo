import * as fs from 'fs';
import * as path from 'path';
import ISettings from './interfaces/ISettings';

export default class Settings {
    public static get(): ISettings {
        const settingsPath = path.join(__dirname, '../', 'settings.json');

        if (fs.existsSync(settingsPath)) {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        }

        return {};
    }

    public static set(key: keyof ISettings, value: string | undefined) {
        const settings = this.get();

        settings[key] = value;

        fs.writeFileSync(path.join(__dirname, '../', 'settings.json'), JSON.stringify(settings, undefined, 4));
    }
}


