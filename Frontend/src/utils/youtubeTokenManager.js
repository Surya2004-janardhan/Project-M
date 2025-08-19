// YouTube Token Manager - for use across the app
export const youtubeTokenManager = {
  getTokens: () => {
    const oauthData = localStorage.getItem("youtube_oauth_data");
    if (oauthData) {
      try {
        const parsed = JSON.parse(oauthData);

        // Check if token is still valid
        const now = new Date();
        const connectedAt = new Date(parsed.connectedAt);
        const expiresAt = new Date(
          connectedAt.getTime() + parsed.expiresIn * 1000
        );

        if (now < expiresAt) {
          return {
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            tokenType: parsed.tokenType,
            isValid: true,
          };
        } else {
          // Token expired
          localStorage.removeItem("youtube_oauth_data");
          return { isValid: false };
        }
      } catch (error) {
        console.error("Error parsing YouTube tokens:", error);
        return { isValid: false };
      }
    }
    return { isValid: false };
  },

  isConnected: () => {
    const tokens = youtubeTokenManager.getTokens();
    return tokens.isValid;
  },

  getUserInfo: () => {
    const oauthData = localStorage.getItem("youtube_oauth_data");
    if (oauthData) {
      try {
        const parsed = JSON.parse(oauthData);
        return {
          name: parsed.name,
          email: parsed.email,
          picture: parsed.picture,
          googleId: parsed.googleId,
        };
      } catch (error) {
        console.error("Error getting user info:", error);
        return null;
      }
    }
    return null;
  },

  clearTokens: () => {
    localStorage.removeItem("youtube_oauth_data");
  },
};

// Make it globally available
window.youtubeTokenManager = youtubeTokenManager;
