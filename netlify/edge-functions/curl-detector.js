export default async (request, context) => {
  const userAgent = request.headers.get('user-agent') || '';
  
  if (userAgent.toLowerCase().includes('curl')) {
    const countryCode = context.geo?.country?.code || 'US';
    const city = context.geo?.city || '';
    const country = context.geo?.country?.name || 'somewhere on Earth';
    
    const greetings = {
      'US': 'Hello',
      'CA': 'Hello',
      'IT': 'Ciao',
      'GB': 'Hello',
      'BE': 'Bonjour',
      'DE': 'Hallo',
      'EG': 'مرحبا',
      'ES': 'Hola',
      'RS': 'Zdravo',
      'AU': 'G\'day',
      'CH': 'Grüezi',
      'CZ': 'Ahoj',
      'DO': 'Hola',
      'FI': 'Hei',
      'KR': '안녕하세요',
      'NP': 'नमस्ते',
      'PK': 'السلام علیکم',
      'SE': 'Hej'
    };
    
    const greeting = greetings[countryCode] || 'Hello';
    const location = city ? `${city}, ${country}` : country;
    
    const asciiContent = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    k w o n . n y c                                ( °◡° )    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

${greeting} command line visitor! It's me, Rachel (kwon.nyc). 

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

BYE
-------
Hope you are having a great day or night! Thanks for visiting <3

`;
    
    return new Response(asciiContent, {
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
  }
  
  // Pass through to normal site
  return context.next();
};