import {cookies} from 'next/headers';
import crypto from 'node:crypto';

const COOKIE='arz_admin_session';
function secret(){return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'change-me';}
function token(){return crypto.createHmac('sha256',secret()).update('arz-admin').digest('hex');}
export async function isAdmin(){return (await cookies()).get(COOKIE)?.value===token();}
export async function setAdminSession(){(await cookies()).set(COOKIE,token(),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*7});}
export async function clearAdminSession(){(await cookies()).delete(COOKIE);}
export function validPassword(value:string){const expected=process.env.ADMIN_PASSWORD; return Boolean(expected && value===expected);}
