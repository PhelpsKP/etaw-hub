const email = `bcrypttest-${Date.now()}@test.com`;
const password = 'Password123!';

(async () => {
  let r = await fetch('http://127.0.0.1:8787/auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('signup', r.status, await r.text());

  r = await fetch('http://127.0.0.1:8787/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('login', r.status, await r.text());
})();
