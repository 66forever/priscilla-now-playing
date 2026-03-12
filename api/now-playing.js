const fetch = require('node-fetch');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const getAccessToken = async () => {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  return response.json();
};

const getNowPlaying = async (accessToken) => {
  return fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

module.exports = async (req, res) => {
  // Allow CORS so your HTML file can call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { access_token } = await getAccessToken();
    const response = await getNowPlaying(access_token);

    if (response.status === 204 || response.status > 400) {
      return res.json({ isPlaying: false });
    }

    const data = await response.json();

    if (!data.item) {
      return res.json({ isPlaying: false });
    }

    const isPlaying = data.is_playing;
    const title = data.item.name;
    const artist = data.item.artists.map(a => a.name).join(', ');
    const album = data.item.album.name;
    const albumArt = data.item.album.images[0]?.url;
    const songUrl = data.item.external_urls.spotify;
    const progress = data.progress_ms;
    const duration = data.item.duration_ms;

    return res.json({
      isPlaying,
      title,
      artist,
      album,
      albumArt,
      songUrl,
      progress,
      duration,
    });
  } catch (err) {
    return res.json({ isPlaying: false, error: err.message });
  }
};
