(async ()=>{
  // This script logs in using the server-side signin endpoint and then fetches /api/profiles
  // Usage: node scripts/testLoginProfiles.js <email> <password>
  const [,, email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: node scripts/testLoginProfiles.js <email> <password>');
    process.exit(1);
  }
  const base = process.env.BASE_URL || 'http://localhost:5050';
  try {
    // login - POST form as application/x-www-form-urlencoded
    const form = new URLSearchParams({ email, password });
    const loginRes = await fetch(`${base}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      redirect: 'manual'
    });
    // capture cookies
    const setCookie = loginRes.headers.get('set-cookie') || loginRes.headers.get('Set-Cookie') || '';
    const cookies = setCookie.split(/,\s*/).map(c => c.split(';')[0]).filter(Boolean).join('; ');
    console.log('login status:', loginRes.status, 'cookies:', cookies ? cookies : '(none)');

    // now fetch profiles with same cookie
    const profRes = await fetch(`${base}/api/profiles`, {
      method: 'GET',
      headers: { 'Cookie': cookies },
    });
    console.log('profiles status', profRes.status);
    if (profRes.headers.get('content-type')?.includes('application/json')) {
      const json = await profRes.json();
      console.log('profiles json:\n', JSON.stringify(json, null, 2));
    } else {
      const text = await profRes.text();
      console.log('profiles text:\n', text);
    }
  } catch (e) {
    console.error('error', e && e.stack ? e.stack : e);
  }
})();
