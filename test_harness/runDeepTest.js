/*
Deep smoke test harness for Insight-Ink
- Backend API validation + HTML rendering checks
- Seeds test data into existing MongoDB

Usage:
  node test_harness/runDeepTest.js

Environment required:
  MONGO_URI
  JWT_SECRET
  JWT_EXPIRE (optional)
  JWT_COOKIE_EXPIRE (optional)

Notes:
- This harness does not require additional npm deps.
- It uses Node's built-in http + fetch.
*/

const http = require('http');
const https = require('https');
const { URL } = require('url');

const fetchFn = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function logSection(title) {
  console.log(`\n==== ${title} ====\n`);
}

async function waitForServer(baseUrl, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetchFn(baseUrl + '/');
      return res.status;
    } catch (e) {
      await sleep(250);
    }
  }
  throw new Error(`Server not reachable at ${baseUrl}`);
}

async function request(baseUrl, { method = 'GET', path = '/', jsonBody, headers = {}, cookieJar = null } = {}) {
  const url = new URL(path, baseUrl);
  const headersOut = { ...headers };
  if (jsonBody !== undefined) {
    headersOut['Content-Type'] = 'application/json';
  }

  if (cookieJar && typeof cookieJar.cookieHeader === 'function') {
    const cookieHeader = cookieJar.cookieHeader();
    if (cookieHeader) headersOut['Cookie'] = cookieHeader;
  }

  const res = await fetchFn(url, {
    method,
    headers: headersOut,
    body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
    redirect: 'manual',
  });

  // Update cookie jar
  if (cookieJar && typeof cookieJar.ingestSetCookie === 'function') {
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookieJar.ingestSetCookie(setCookie);
  }

  let bodyText = '';
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    return { res, data };
  }

  bodyText = await res.text().catch(() => '');
  return { res, text: bodyText };
}

function createCookieJar() {
  const cookies = new Map(); // name -> value

  return {
    cookieHeader() {
      // only send name=value pairs
      const parts = [];
      for (const [k, v] of cookies.entries()) parts.push(`${k}=${v}`);
      return parts.join('; ');
    },
    ingestSetCookie(setCookieHeader) {
      // For simplicity, handle only "token=...; ..." style.
      const parts = setCookieHeader.split(',');
      for (const part of parts) {
        const first = part.trim().split(';')[0];
        const eq = first.indexOf('=');
        if (eq === -1) continue;
        const name = first.slice(0, eq).trim();
        const value = first.slice(eq + 1).trim();
        if (!name) continue;
        if (value === '' || value.toLowerCase() === 'none') continue;
        cookies.set(name, value);
      }
    },
    get(name) {
      return cookies.get(name);
    },
    clear() {
      cookies.clear();
    },
  };
}

async function run() {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
  const baseUrl = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

  const results = [];
  const assert = (cond, message) => {
    if (!cond) throw new Error(message);
  };

  const cookieJar = createCookieJar();

  // If the app isn't running, user must start it manually.
  await waitForServer(baseUrl).catch((e) => {
    console.error('ERROR:', e.message);
    throw e;
  });

  // --- HTML render checks ---
  logSection('HTML render smoke');
  {
    const res = await request(baseUrl, { method: 'GET', path: '/login' });
    results.push({ name: 'GET /login returns 200', ok: res.res.status === 200, status: res.res.status });
    assert(res.res.status === 200, 'Expected 200 for /login');

    const home = await request(baseUrl, { method: 'GET', path: '/' });
    results.push({ name: 'GET / returns 200', ok: home.res.status === 200, status: home.res.status });
    assert(home.res.status === 200, 'Expected 200 for /');
  }

  // --- Auth flow ---
  logSection('Auth flow');
  const unique = Math.random().toString(16).slice(2);
  const testEmail = `test-${unique}@example.com`;
  const testName = `Test User ${unique}`;
  const password = 'Password!123';

  // Register
  {
    const jar = createCookieJar();
    const r = await request(baseUrl, {
      method: 'POST',
      path: '/api/register',
      jsonBody: { name: testName, email: testEmail, password },
      cookieJar: jar,
    });

    assert(r.res.status === 201, `Expected 201 register, got ${r.res.status}`);
    assert(r.data && r.data.success === true, 'Expected success:true in register');
    results.push({ name: 'POST /api/register 201', ok: true, status: r.res.status });

    // Login with cookie jar too
    const loginJar = createCookieJar();
    const l = await request(baseUrl, {
      method: 'POST',
      path: '/api/login',
      jsonBody: { email: testEmail, password },
      cookieJar: loginJar,
    });
    assert(l.res.status === 200, `Expected 200 login, got ${l.res.status}`);
    assert(l.data && l.data.success === true, 'Expected success:true in login');
    results.push({ name: 'POST /api/login 200', ok: true, status: l.res.status });

    // carry jar
    cookieJar.clear();
    // copy token
    const token = loginJar.get('token');
    if (token) cookieJar.ingestSetCookie(`token=${token}`);
  }

  // Protected HTML: profile
  {
    const r = await request(baseUrl, { method: 'GET', path: '/profile', cookieJar });
    results.push({ name: 'GET /profile protected', ok: r.res.status === 200, status: r.res.status });
    assert(r.res.status === 200, `Expected 200 for /profile, got ${r.res.status}`);
  }

  // Protected: profile update API
  {
    const r = await request(baseUrl, {
      method: 'PUT',
      path: '/api/profile',
      jsonBody: { name: `${testName} Updated` },
      cookieJar,
    });
    assert(r.res.status === 200, `Expected 200 for PUT /api/profile, got ${r.res.status}`);
    assert(r.data && r.data.user && r.data.user.name === `${testName} Updated`, 'Expected updated name in response');
    results.push({ name: 'PUT /api/profile 200', ok: true, status: r.res.status });
  }

  // Protected: write
  {
    const r = await request(baseUrl, { method: 'GET', path: '/write', cookieJar });
    results.push({ name: 'GET /write protected', ok: r.res.status === 200, status: r.res.status });
    assert(r.res.status === 200, `Expected 200 for /write, got ${r.res.status}`);
  }

  // --- Posts CRUD-ish API ---
  logSection('Posts API');
  let createdPostId = null;

  // Create post (requires protect + authorize; allows user)
  {
    const title = `Post ${unique}`;
    const content = `# Hello ${unique}\nThis is a test post.`;
    const excerpt = `Excerpt ${unique}`;

    const r = await request(baseUrl, {
      method: 'POST',
      path: '/api/posts',
      jsonBody: { title, excerpt, content, readTime: 3 },
      cookieJar,
    });
    assert(r.res.status === 201, `Expected 201 create post, got ${r.res.status}`);
    assert(r.data && r.data._id, 'Expected post _id in response');
    createdPostId = r.data._id;
    results.push({ name: 'POST /api/posts 201', ok: true, status: r.res.status });
  }

  // Get all posts (public)
  {
    const r = await request(baseUrl, { method: 'GET', path: '/api/posts' });
    assert(r.res.status === 200, `Expected 200 getPosts, got ${r.res.status}`);
    results.push({ name: 'GET /api/posts 200', ok: true, status: r.res.status });
  }

  // Get post by id
  {
    const r = await request(baseUrl, { method: 'GET', path: `/api/posts/${createdPostId}` });
    assert(r.res.status === 200, `Expected 200 getPost, got ${r.res.status}`);
    results.push({ name: 'GET /api/posts/:id 200', ok: true, status: r.res.status });
  }

  // Like toggle
  {
    const r = await request(baseUrl, { method: 'POST', path: `/api/posts/${createdPostId}/like`, cookieJar });
    assert(r.res.status === 200, `Expected 200 toggleLike, got ${r.res.status}`);
    assert(r.data && typeof r.data.likes === 'number', 'Expected likes number');
    results.push({ name: 'POST /api/posts/:id/like 200', ok: true, status: r.res.status });
  }

  // Add comment
  {
    const r = await request(baseUrl, {
      method: 'POST',
      path: `/api/posts/${createdPostId}/comment`,
      jsonBody: { text: `Comment ${unique}` },
      cookieJar,
    });
    assert(r.res.status === 200, `Expected 200 addComment, got ${r.res.status}`);
    results.push({ name: 'POST /api/posts/:id/comment 200', ok: true, status: r.res.status });
  }

  // Fetch post again to get comment id
  let latestPost = null;
  {
    const r = await request(baseUrl, { method: 'GET', path: `/api/posts/${createdPostId}` });
    assert(r.res.status === 200, `Expected 200 getPost(2), got ${r.res.status}`);
    latestPost = r.data;
  }

  const latestComments = (latestPost.comments || []);
  assert(latestComments.length > 0, 'Expected at least one comment');
  const commentId = latestComments[latestComments.length - 1]._id;

  // Update comment
  {
    const r = await request(baseUrl, {
      method: 'PUT',
      path: `/api/posts/${createdPostId}/comment/${commentId}`,
      jsonBody: { text: `Updated Comment ${unique}` },
      cookieJar,
    });
    assert(r.res.status === 200, `Expected 200 updateComment, got ${r.res.status}`);
    results.push({ name: 'PUT /api/posts/:id/comment/:commentId 200', ok: true, status: r.res.status });
  }

  // Add reply
  {
    const r = await request(baseUrl, {
      method: 'POST',
      path: `/api/posts/${createdPostId}/reply`,
      jsonBody: { text: `Reply ${unique}`, commentId },
      cookieJar,
    });
    assert(r.res.status === 200, `Expected 200 addReply, got ${r.res.status}`);
    results.push({ name: 'POST /api/posts/:id/reply 200', ok: true, status: r.res.status });
  }

  // Render single post HTML
  {
    const r = await request(baseUrl, { method: 'GET', path: `/post/${createdPostId}` });
    results.push({ name: 'GET /post/:id render', ok: r.res.status === 200, status: r.res.status });
    assert(r.res.status === 200, `Expected 200 for /post/:id got ${r.res.status}`);
  }

  // Delete post (for user role, current code requires deleteReason only for admin/superadmin)
  {
    const r = await request(baseUrl, {
      method: 'DELETE',
      path: `/api/posts/${createdPostId}`,
      jsonBody: { deleteReason: '' },
      cookieJar,
    });
    // deletePost returns 200 json({success:true,...})
    assert(r.res.status === 200, `Expected 200 deletePost, got ${r.res.status}`);
    results.push({ name: 'DELETE /api/posts/:id 200', ok: true, status: r.res.status });
  }

  // Notifications API and HTML
  logSection('Notifications');
  {
    const r = await request(baseUrl, { method: 'GET', path: '/api/notifications', cookieJar });
    assert(r.res.status === 200, `Expected 200 notifications, got ${r.res.status}`);
    results.push({ name: 'GET /api/notifications 200', ok: true, status: r.res.status });
  }

  {
    const r = await request(baseUrl, { method: 'GET', path: '/inbox', cookieJar });
    // renderInbox exists; authController.renderInbox should render inbox.ejs
    assert(r.res.status === 200, `Expected 200 inbox, got ${r.res.status}`);
    results.push({ name: 'GET /inbox 200', ok: true, status: r.res.status });
  }

  // Logout
  logSection('Logout');
  {
    const r = await request(baseUrl, { method: 'GET', path: '/logout', cookieJar });
    // logout redirects to /login only for HTML accept. fetch uses */*; accepts html? unknown.
    // We'll just require it returns 200 or 302.
    const ok = (r.res.status === 200 || r.res.status === 302);
    results.push({ name: 'GET /logout allowed', ok, status: r.res.status });
  }

  logSection('SUMMARY');
  const passed = results.filter((x) => x.ok).length;
  const failed = results.length - passed;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  for (const item of results) {
    if (!item.ok) console.log(`- FAIL: ${item.name} (status=${item.status})`);
  }

  const report = {
    baseUrl,
    total: results.length,
    passed,
    failed,
    results,
  };

  const outPath = process.env.DEEP_TEST_REPORT_PATH || 'deep_test_report.json';
  // write report alongside script by default
  const fs = require('fs');
  const resolved = require('path').resolve(process.cwd(), outPath);
  fs.writeFileSync(resolved, JSON.stringify(report, null, 2));
  console.log(`\nWrote report: ${resolved}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error('Deep test harness crashed:', err && err.stack ? err.stack : err);
  process.exitCode = 1;
});

