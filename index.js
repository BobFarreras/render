// index.js
const http = require('http');
const diff = require('diff'); // Importem la nova llibreria

const server = http.createServer(async (req, res) => {
  // Permetre CORS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/diff') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'POST /diff with JSON { original, new }' }));
    return;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid JSON' }));
    return;
  }

  const orig = payload.original || payload.orig || '';
  const neu = payload.new || payload.nou || payload.nuevo || '';

  // Fem servir la llibreria 'diff' per trobar les diferències
  const differences = diff.diffChars(orig, neu);
  
  let added = '';
  let removed = '';

  differences.forEach((part) => {
    if (part.added) {
      added += part.value;
    } else if (part.removed) {
      removed += part.value;
    }
  });

  const out = { added: added.trim(), removed: removed.trim() };

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(out));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Listening on', PORT));
