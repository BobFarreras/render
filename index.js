// index.js
const http = require('http');

function diffStrings(orig = '', neu = '') {
  if (orig === neu) return { added: '', removed: '', prefix: orig, suffix: '' };
  const minLen = Math.min(orig.length, neu.length);
  let i = 0;
  while (i < minLen && orig.charCodeAt(i) === neu.charCodeAt(i)) i++;
  let j = 0;
  while (j < (orig.length - i) && j < (neu.length - i) &&
         orig.charCodeAt(orig.length - 1 - j) === neu.charCodeAt(neu.length - 1 - j)) j++;
  const removed = orig.slice(i, orig.length - j).trim();
  const added   = neu.slice(i, neu.length - j).trim();
  return { added, removed, prefix: orig.slice(0,i), suffix: orig.slice(orig.length - j) };
}

const server = http.createServer(async (req, res) => {
  // Allow CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(); return;
  }

  if (req.method !== 'POST' || req.url !== '/diff') {
    res.writeHead(404, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ error: 'POST /diff with JSON { original, new }' })); return;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  let payload;
  try { payload = JSON.parse(body); } 
  catch (e) { 
    res.writeHead(400, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ error: 'invalid JSON' })); 
    return; 
  }

  const orig = payload.original || payload.orig || '';
  const neu  = payload.new || payload.nou || payload.nuevo || '';
  const out = diffStrings(orig, neu);

  res.writeHead(200, {
    'Content-Type':'application/json',
    'Access-Control-Allow-Origin':'*'
  });
  res.end(JSON.stringify(out));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Listening on', PORT));
