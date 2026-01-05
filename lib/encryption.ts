import Cryptr from 'cryptr'

const cryptr = new Cryptr(process.env.NEXT_PUBLIC_ENCRYPTION_KEY!);

export const encrypt = (text:string) => cryptr.encrypt(text);
export const decrypt = (text:string) => cryptr.decrypt(text);