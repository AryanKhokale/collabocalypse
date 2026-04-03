import { useEffect, useState } from 'react';
import './Login.css';
import { KEYCLOAK_CONFIG, API_BASE_URL } from '../config';
import LogoBanner from './landing/LogoBanner';
import FeaturesSection from './landing/Features';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';

// Pull Keycloak + API settings from shared config/env
const KEYCLOAK_URL = KEYCLOAK_CONFIG.url;
const REALM = KEYCLOAK_CONFIG.realm;
const CLIENT_ID = KEYCLOAK_CONFIG.clientId;
const BACKEND_URL = API_BASE_URL;

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
      <div className="landing-root">
        <header className="login-header-top">
          <div className="navbar-container">
            <div className="navbar-left">
              <svg className="app-logo" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Document outline */}
                <rect x="6" y="4" width="20" height="24" rx="2" fill="none" stroke="#9f7aea" strokeWidth="1.8"/>
                {/* Text lines */}
                <line x1="10" y1="10" x2="18" y2="10" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="14" x2="22" y2="14" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="18" x2="16" y2="18" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Cursor 1 - purple */}
                <path d="M19 9l0 6 2 -2 1.5 3 1.5 -0.5 -1.5 -3 2.5 0z" fill="#a855f7" stroke="#a855f7" strokeWidth="0.5"/>
                {/* Cursor 2 - cyan */}
                <path d="M13 21l0 5 1.5 -1.5 1 2.5 1.2 -0.5 -1 -2.5 2 0z" fill="#7dd3fc" stroke="#7dd3fc" strokeWidth="0.5"/>
              </svg>
              <h1 className="app-title">Collabocalypse</h1>
            </div>
            <nav className="navbar-center">
              <a href="#features" className="nav-link">Features</a>
              <a href="https://github.com/AryanKhokale" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
            </nav>
            <div className="navbar-right">
              <button className="nav-cta" onClick={login}>Sign In</button>
            </div>
          </div>
        </header>
        <div className="login-container">
          <div className="login-content">
            <h2 className="main-heading">Collaborative Editing at Scale</h2>
            <p className="subheading">Real-time document collaboration with enterprise-grade reliability and decentralized infrastructure</p>
            
            {isLoading ? (
              <div className="loading-section">
                <div className="loader"></div>
                <p>Authenticating and redirecting...</p>
              </div>
            ) : (
              <div className="cta-wrapper">
                <div className="glow-ring ring-1"></div>
                <div className="glow-ring ring-2"></div>
                <div className="glow-ring ring-3"></div>
                <button className="primary-cta" onClick={login}>
                  Get Started
                  <svg className="cta-arrow" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Sections below the hero ── */}
        <div className="landing-sections">
          <FeaturesSection />
          <CTASection />
          <LogoBanner />
          <Footer />
        </div>
      </div>
    );
};

export default Login;

