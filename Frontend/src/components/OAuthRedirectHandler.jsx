// OAuth redirect handler - add this to your App.js or main component
import { useEffect } from "react";
import { useAuth } from "./store/AuthContext";

const OAuthRedirectHandler = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Handle OAuth redirect when user returns from Google
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get("oauth_success");
    const oauthData = urlParams.get("oauth_data");

    if (oauthSuccess === "true" && oauthData) {
      try {
        // Store OAuth data immediately
        const parsedData = JSON.parse(decodeURIComponent(oauthData));
        localStorage.setItem("youtube_oauth_data", JSON.stringify(parsedData));

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Show success message
        console.log("YouTube OAuth completed successfully");

        // If user is not logged in, restore their session
        const backupToken = sessionStorage.getItem("auth_token_backup");
        if (backupToken && !localStorage.getItem("token")) {
          localStorage.setItem("token", backupToken);
          sessionStorage.removeItem("auth_token_backup");
          window.location.reload();
        }
      } catch (error) {
        console.error("Error processing OAuth redirect:", error);
      }
    }
  }, []);

  return null; // This component doesn't render anything
};

export default OAuthRedirectHandler;
