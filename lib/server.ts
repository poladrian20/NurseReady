import { env } from 'cloudflare:workers';
export function db(): D1Database { return (env as unknown as {DB:D1Database}).DB; }
export function bucket(): R2Bucket { return (env as unknown as {BUCKET:R2Bucket}).BUCKET; }
export function spaceToken(r: Request) { return (r.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('nr_space='))?.slice(9)||''; }
export async function digest(value:string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join(''); }
export async function tokenOwner(token:string):Promise<string|null> { if(!/^[a-f0-9]{64}$/.test(token))return null; return (await db().prepare('SELECT user FROM spaces WHERE hash=?').bind(await digest(token)).first<{user:string}>())?.user||null; }
export async function owner(r: Request) { const token=spaceToken(r); if(token)return tokenOwner(token); return r.headers.get('oai-authenticated-user-id'); }
export function guard(r:Request) { const origin=r.headers.get('origin'); return !origin || new URL(r.url).origin===origin; }
