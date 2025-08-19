// Replace the entire callback endpoint in server.js with this:

app.get("/oauth/google/callback", async (req, res) => {
  console.log('=== OAuth Callback ===');
  console.log('Query params:', req.query);
  
  const { code, error } = req.query;

  if (error) {
    console.log('OAuth error received:', error);
    return res.send(`
      <html>
        <head><title>OAuth Result</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'oauth_error', 
                error: '${error}' 
              }, 'http://localhost:5173');
              window.close();
            } else {
              document.body.innerHTML = '<h1>OAuth Error: ${error}</h1>';
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.send(`
      <html>
        <head><title>OAuth Result</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'oauth_error', 
                error: 'No authorization code received' 
              }, 'http://localhost:5173');
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.send(`
        <html>
          <head><title>OAuth Result</title></head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'oauth_error', 
                  error: '${tokenData.error_description || tokenData.error}' 
                }, 'http://localhost:5173');
                window.close();
              }
            </script>
          </body>
        </html>
      `);
    }

    // Get user info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: \`Bearer \${tokenData.access_token}\` },
    });
    const userInfo = await userInfoResponse.json();

    if (userInfo.error) {
      return res.send(`
        <html>
          <head><title>OAuth Result</title></head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'oauth_error', 
                  error: '${userInfo.error.message}' 
                }, 'http://localhost:5173');
                window.close();
              }
            </script>
          </body>
        </html>
      `);
    }

    // Prepare OAuth data
    const oauthData = {
      googleId: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
      connectedAt: new Date(),
    };

    // Send success message to popup opener
    return res.send(\`
      <html>
        <head><title>OAuth Success</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'oauth_success', 
                data: \${JSON.stringify(oauthData)} 
              }, 'http://localhost:5173');
              window.close();
            } else {
              document.body.innerHTML = '<h1>OAuth Success! You can close this window.</h1>';
            }
          </script>
        </body>
      </html>
    \`);
    
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.send(`
      <html>
        <head><title>OAuth Result</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'oauth_error', 
                error: 'OAuth authentication failed' 
              }, 'http://localhost:5173');
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  }
});