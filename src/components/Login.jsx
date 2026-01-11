import { useEffect, useState } from 'react';
import './Login.css';

const KEYCLOAK_URL = "http://localhost:9000";
const REALM = "Myapp";
const CLIENT_ID = "quill-client";
const BACKEND_URL = "http://localhost:8000";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    const userEmail = sessionStorage.getItem('user_email');
    if (userEmail) {
      window.location.href = '/dashboard';
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setIsLoading(true);
      const codeVerifier = localStorage.getItem("code_verifier");
      tokenExchange(code, codeVerifier);
    }
  }, []);

  const base64UrlEncode = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const login = async () => {
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);
    const codeVerifier = base64UrlEncode(array);
    localStorage.setItem("code_verifier", codeVerifier);

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    const codeChallenge = base64UrlEncode(hash);

    const authUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth` +
      `?client_id=${CLIENT_ID}&response_type=code&scope=openid%20profile%20email` +
      `&redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}` +
      `&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    window.location.href = authUrl;
  };

  const tokenExchange = async (code, codeVerifier) => {
    try {
      const res = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          code: code,
          redirect_uri: window.location.origin + window.location.pathname,
          code_verifier: codeVerifier
        })
      });

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        await fetchUserDetails(data.access_token);
      } else {
        setIsLoading(false);
        //alert("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Token exchange error:", error);
      setIsLoading(false);
      alert("Authentication error. Please try again.");
    }
  };

  const fetchUserDetails = async (token) => {
    try {
      const res = await fetch(`${BACKEND_URL}/user/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const user = await res.json();
        sessionStorage.setItem("user_name", user.user_name);
        sessionStorage.setItem("user_email", user.user_email);
        sessionStorage.setItem("access_token", token);
        
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setIsLoading(false);
        alert("Failed to fetch user details.");
      }
    } catch (error) {
      console.error("Fetch user details error:", error);
      setIsLoading(false);
      alert("Error fetching user details.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Collabocalypse</h1>
          <p>Sign in to access your documents</p>
        </div>
        
        {isLoading ? (
          <div className="loading-section">
            <div className="loader"></div>
            <p>Authenticating and redirecting...</p>
          </div>
        ) : (
          <button className="login-button" onClick={login}>
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;

