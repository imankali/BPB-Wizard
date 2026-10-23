import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import Cloudflare from 'cloudflare';

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const transpile = path => stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), 'utf8'));
const randomUrl = moduleUrl(transpile('../src/random.ts'));
const apiSource = transpile('../src/api.ts')
    .replaceAll("'cloudflare'", JSON.stringify(import.meta.resolve('cloudflare')))
    .replaceAll("'./random'", JSON.stringify(randomUrl));
const { CFAccount } = await import(moduleUrl(apiSource));
const account = client => Object.assign(Object.create(CFAccount.prototype), { client, id: 'test-account' });

test('existing Pages project does not query Workers', async () => {
    const acc = account({ pages: { projects: { get: async () => ({}) } }, workers: {
        scripts: { get: async () => assert.fail('must not query Workers') }
    } });
    assert.equal(await acc.nameTaken('pages', 'existing'), true);
});

test('only a 404 means the name is available', async () => {
    const missing = new Cloudflare.APIError(404, {}, 'missing', new Headers());
    const acc = account({ workers: { scripts: { get: async () => { throw missing; } } } });
    assert.equal(await acc.nameTaken('workers', 'missing'), false);
    const forbidden = new Cloudflare.APIError(403, {}, 'forbidden', new Headers());
    acc.client.workers.scripts.get = async () => { throw forbidden; };
    await assert.rejects(acc.nameTaken('workers', 'private'), error => error === forbidden);
    acc.client.workers.scripts.get = async () => { throw new Error('network unavailable'); };
    await assert.rejects(acc.nameTaken('workers', 'unknown'), /network unavailable/);
});

test('new and existing account subdomains have the same format', async () => {
    const acc = account({ workers: { subdomains: {
        get: async () => ({ subdomain: 'example' }),
        update: async () => ({ subdomain: 'example' })
    } } });
    assert.equal(await acc.getWorkersDevSubdomain(), 'example.workers.dev');
    assert.equal(await acc.createWorkersDevSubdomain(), 'example.workers.dev');
});
