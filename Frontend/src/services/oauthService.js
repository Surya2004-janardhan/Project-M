// OAuth Service for popup-based authentication
class OAuthService {
  constructor() {
    this.popup = null;
    this.messageListener = null;
  }

  async initiateGoogleOAuth() {
    return new Promise((resolve, reject) => {
      // Clean up any existing popup/listener
      this.cleanup();

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      // Open popup window
      this.popup = window.open(
        "http://localhost:5000/oauth/google",
        "oauth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!this.popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      // Listen for messages from popup
      this.messageListener = (event) => {
        console.log("Received message from popup:", event);

        // Verify origin for security
        if (event.origin !== "http://localhost:5000") {
          console.log("Invalid origin:", event.origin);
          return;
        }

        if (event.data && event.data.type === "oauth_success") {
          console.log("OAuth success received:", event.data.data);
          this.cleanup();
          resolve(event.data.data);
        } else if (event.data && event.data.type === "oauth_error") {
          console.log("OAuth error received:", event.data.error);
          this.cleanup();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener("message", this.messageListener);

      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (this.popup && this.popup.closed) {
          clearInterval(checkClosed);
          this.cleanup();
          reject(new Error("OAuth popup was closed by user"));
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.popup && !this.popup.closed) {
          clearInterval(checkClosed);
          this.cleanup();
          reject(new Error("OAuth timeout - please try again"));
        }
      }, 300000);
    });
  }

  cleanup() {
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }
    this.popup = null;

    if (this.messageListener) {
      window.removeEventListener("message", this.messageListener);
      this.messageListener = null;
    }
  }
}

export const oauthService = new OAuthService();
