export default async (request, context) => {
  const userAgent = request.headers.get('user-agent') || '';
  
  if (userAgent.toLowerCase().includes('curl')) {
    const asciiContent = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    k w o n . n y c                                ( °◡° )    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Hello command line friends!

It's me, Rachel (kwon.nyc). 

SITES
-----
→ kwon.nyc         - main site
→ kwon.nyc/notes   - blog
→ kwon.photos      - photo site
→ index.kwon.nyc   - directory

CONTACT
-------
kwon@fastmail.com  
mastodon.social/@rjkwon

`;
    
    return new Response(asciiContent, {
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
  }
  
  // Pass through to normal site
  return context.next();
};