export function testEnvironment(env = process.env) {
  const web = new URL(env.WEB_BASE_URL || 'http://127.0.0.1:8210');
  const api = new URL(env.API_BASE_URL || 'http://127.0.0.1:9010');
  for (const url of [web, api]) {
    if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname)
        || !url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('E2E servers must use a plain loopback HTTP origin.');
    }
  }
  if (web.port === api.port || ['8200', '9000'].some(port => [web.port, api.port].includes(port))) {
    throw new Error('E2E must use separate ports, not the working project ports 8200/9000.');
  }
  return { web: web.origin, api: api.origin };
}
