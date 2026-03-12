const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

module.exports = (req, res) => {
  const redirectUri = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/callback`;

  const scope = 'user-read-currently-playing user-read-playback-state';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: redirectUri,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
};
