import * as CryptoJS from 'crypto-js';
const SECRET_KEY: any = 'prueba';

export abstract class StorageService implements Storage {
    constructor(protected readonly api: Storage) { }

    [name: string]: any;
    length!: number;

    clear(): void {
        this.api.clear();
    }

    getItem(key: string): any {
        const keyEncrypt = CryptoJS.SHA256(key, SECRET_KEY).toString();
        const data = this.api.getItem(keyEncrypt);

        if (data !== null) {
            const dataDecrypt = CryptoJS.AES.decrypt(data, SECRET_KEY);

            return JSON.parse(dataDecrypt.toString(CryptoJS.enc.Utf8));
        }

        return null;
    }

    key(index: number): string {
        return this.api.key(index) ?? '';
    }

    removeItem(key: string): void {
        this.api.removeItem(key);
    }

    setItem(key: string, value: any): void {
        const data = JSON.stringify(value);
        const keyEncrypt = CryptoJS.SHA256(key, SECRET_KEY).toString();
        const dataEncrypt = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
        this.api.setItem(keyEncrypt, dataEncrypt);
    }
}
