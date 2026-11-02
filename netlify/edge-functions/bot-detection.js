// tracks bot and AI agent page requests and sends to knownagents.com account

const SKIP = /\.(css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp4|webm|mp3|pdf|zip)$/i;

export default async (request, context) => {
  const token = Netlify.env.get('BOT_TRACKING_TOKEN');
  const url = new URL(request.url);

  if (!token || SKIP.test(url.pathname)) {
    return context.next();
  }

  // Visitor cookies and credentials are never needed for bot tracking, so leave them out
  const headers = Object.fromEntries(request.headers);
  delete headers.cookie;
  delete headers.authorization;

  const start = Date.now();
  const response = await context.next();

  const visit = {
    request_path: url.pathname + url.search,
    request_method: request.method,
    request_headers: headers,
    response_status_code: response.status,
    response_headers: { 'content-type': response.headers.get('content-type') || '' },
    response_duration_in_milliseconds: Date.now() - start
  };

  // Netlify sets x-nf-client-connection-ip; make sure an IP header is present
  if (!visit.request_headers['x-forwarded-for'] && context.ip) {
    visit.request_headers['x-forwarded-for'] = context.ip;
  }

  context.waitUntil(
    fetch('https://api.knownagents.com/visits', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify([visit])
    }).catch(() => {})
  );

  return response;
};
