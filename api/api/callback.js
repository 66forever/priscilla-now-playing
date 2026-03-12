const fetch = require('node-fetch');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

module.exports = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/callback`,
      }),
    });

    const data = await response.json();

    if (data.refresh_token) {
      return res.send(`
        <html>
          <body style="font-family:monospace;background:#0e0e0e;color:#f2a7c3;padding:40px;">
            <h2>✅ Connected to Spotify!</h2>
            <p>Copy your refresh token below and add it to Vercel as <strong>SPOTIFY_REFRESH_TOKEN</strong></p>
            <textarea style="width:100%;height:80px;background:#1a1a1a;color:#f2a7c3;border:1px solid #f2a7c3;padding:12px;font-size:14px;">${data.refresh_token}</textarea>
            <p style="margin-top:16px;color:#888;">You can close this page after copying the token.</p>
          </body>
        </html>
      `);
    } else {
      return res.send(`<pre style="color:red;">${JSON.stringify(data, null, 2)}</pre>`);
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
