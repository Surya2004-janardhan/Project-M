// Simple fix: Update your HomePage button click handler

// Replace the current button onClick with this:
onClick={() => {
setLoading(true);
setOauthMessage('Redirecting to Google OAuth...');

// Store current authentication state
const currentToken = localStorage.getItem('token');
const userEmail = user?.email;

if (currentToken) {
sessionStorage.setItem('auth_token_backup', currentToken);
sessionStorage.setItem('user_email_backup', userEmail || '');
}

// Redirect to OAuth
window.location.href = 'http://localhost:5000/oauth/google';
}}

// And update your useEffect to restore the session:
useEffect(() => {
// Check for OAuth redirect first
const urlParams = new URLSearchParams(window.location.search);
const oauthSuccess = urlParams.get('oauth_success');
const oauthData = urlParams.get('oauth_data');

if (oauthSuccess === 'true' && oauthData) {
try {
// Store OAuth data
const parsedData = JSON.parse(decodeURIComponent(oauthData));
localStorage.setItem('youtube_oauth_data', JSON.stringify(parsedData));

      // Restore auth session if needed
      const backupToken = sessionStorage.getItem('auth_token_backup');
      if (backupToken && !localStorage.getItem('token')) {
        localStorage.setItem('token', backupToken);
      }

      // Clean up
      sessionStorage.removeItem('auth_token_backup');
      sessionStorage.removeItem('user_email_backup');

      // Clean URL and reload to restore user context
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
      return;
    } catch (error) {
      console.error('Error processing OAuth:', error);
    }

}

// Normal flow
if (user) {
checkYouTubeConnection();
}
}, [user]);
