const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

let server;
let base;

test.before(async () => {
    await new Promise(resolve => {
        server = app.listen(0, '127.0.0.1', () => {
            base = `http://127.0.0.1:${server.address().port}`;
            resolve();
        });
    });
});

test.after(() => new Promise(resolve => server.close(resolve)));

test('health endpoint reports the API version', async () => {
    const response = await fetch(`${base}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.service, 'TenantHub API');
    assert.equal(body.version, '2.0.0');
});

test('unknown routes use the JSON 404 contract', async () => {
    const response = await fetch(`${base}/api/does-not-exist`);
    const body = await response.json();
    assert.equal(response.status, 404);
    assert.equal(body.success, false);
});

test('unapproved browser origins are rejected', async () => {
    const response = await fetch(`${base}/api/health`, { headers: { Origin: 'https://untrusted.example' } });
    assert.equal(response.status, 403);
});
