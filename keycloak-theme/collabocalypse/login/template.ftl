<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Collabocalypse - Sign In</title>
    <style>
        :root {
            --color-primary: #c084fc;
            --color-primary-mid: #9333ea;
            --color-primary-dark: #7e22ce;
            --color-bg-dark: #0f0f0f;
            --color-bg-card: rgba(32, 33, 36, 0.85);
            --color-text-primary: #ffffff;
            --color-text-secondary: #a3a3b8;
            --color-text-muted: #717185;
            --color-border: rgba(147, 51, 234, 0.15);
            --radius-md: 12px;
            --transition-smooth: all 0.3s ease;
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }

        html, body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
            background: #1a1a1a;
            color: var(--color-text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1.6;
        }

        .container, #kc-container, .login-pf {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 100vh;
            padding: 20px;
        }

        .login-pf-container { 
            max-width: 620px; 
            width: 100%; 
            text-align: center;
        }

        .login-pf-page {
            background: transparent;
            padding: 0;
        }

        /* Header Section */
        .login-branding {
            margin-bottom: 48px;
        }

        .login-pf-page h1 {
            font-size: 56px;
            font-weight: 800;
            letter-spacing: -1px;
            margin-bottom: 16px;
            color: var(--color-text-primary);
        }

        .login-subtitle {
            font-size: 18px;
            font-weight: 400;
            color: var(--color-text-secondary);
            line-height: 1.5;
        }

        /* Form Container */
        .login-form-container {
            background: linear-gradient(135deg, rgba(32, 33, 36, 0.85) 0%, rgba(63, 33, 100, 0.35) 100%);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: var(--radius-md);
            padding: 48px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(147, 51, 234, 0.15);
            border: 1px solid var(--color-border);
            margin-top: 32px;
        }

        /* Form Styling */
        .form-group { 
            margin-bottom: 24px;
            text-align: left;
        }

        .form-group label {
            display: block;
            margin-bottom: 10px;
            font-size: 15px;
            font-weight: 600;
            color: var(--color-text-primary);
            letter-spacing: 0px;
        }

        .form-control, 
        input[type="text"], 
        input[type="password"], 
        input[type="email"] {
            width: 100%;
            padding: 14px 16px;
            background: rgba(20, 20, 25, 0.7);
            border: 1px solid rgba(147, 51, 234, 0.2);
            border-radius: 8px;
            color: var(--color-text-primary);
            font-size: 15px;
            transition: var(--transition-smooth);
            font-family: inherit;
        }

        .form-control::placeholder,
        input::placeholder {
            color: var(--color-text-muted);
        }

        .form-control:focus, 
        input:focus {
            outline: none;
            border-color: var(--color-primary-mid);
            background: rgba(20, 20, 25, 0.9);
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
        }

        /* Submit Button */
        #kc-form-buttons {
            margin-top: 32px;
            margin-bottom: 0;
        }

        .button, 
        input[type="submit"] {
            width: 100%;
            padding: 14px 24px;
            background: linear-gradient(180deg, #c084fc 0%, #9333ea 70%, #7e22ce 100%);
            color: var(--color-text-primary);
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: var(--transition-smooth);
            box-shadow: 
                0 8px 24px rgba(147, 51, 234, 0.45),
                0 2px 8px rgba(168, 85, 247, 0.3),
                inset 0 1px 1px rgba(255, 255, 255, 0.2),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }

        .button:hover, 
        input[type="submit"]:hover {
            background: linear-gradient(180deg, #d8b4fe 0%, #a855f7 70%, #8b35ea 100%);
            box-shadow: 
                0 12px 32px rgba(168, 85, 247, 0.6),
                0 4px 12px rgba(192, 132, 252, 0.4),
                inset 0 1px 1px rgba(255, 255, 255, 0.25),
                inset 0 -2px 4px rgba(0, 0, 0, 0.3);
            transform: translateY(-2px);
        }

        .button:active, 
        input[type="submit"]:active {
            transform: translateY(0);
            box-shadow: 
                0 4px 12px rgba(147, 51, 234, 0.35),
                0 1px 4px rgba(168, 85, 247, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }

        /* Remember Me */
        .form-check { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            margin: 20px 0;
            font-size: 14px;
            justify-content: flex-start;
        }

        .form-check input[type="checkbox"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: var(--color-primary-mid);
        }

        .form-check label {
            margin-bottom: 0;
            cursor: pointer;
            font-weight: 400;
            color: var(--color-text-secondary);
        }

        /* Links */
        a { 
            color: var(--color-text-secondary); 
            text-decoration: none; 
            transition: var(--transition-smooth);
            font-size: 14px;
            font-weight: 500;
        }

        a:hover { 
            color: var(--color-primary);
        }

        /* Back Link */
        .back-link {
            text-align: center; 
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid rgba(147, 51, 234, 0.15);
        }

        .back-link a {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: var(--color-text-secondary);
            font-size: 14px;
        }

        .back-link a:hover {
            color: var(--color-primary);
        }

        /* Bottom Links */
        #kc-registration, 
        #kc-forgot-pwd { 
            text-align: center; 
            margin-top: 16px; 
            color: var(--color-text-muted); 
            font-size: 13px;
        }

        /* Social login buttons */
        .social-buttons {
            margin: 28px 0 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .social-divider {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 20px 0 8px;
            color: var(--color-text-secondary);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            justify-content: center;
        }

        .social-divider::before,
        .social-divider::after {
            content: "";
            flex: 1;
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
        }

        .social-button {
            width: 100%;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.04);
            color: var(--color-text-primary);
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: var(--transition-smooth);
        }

        .social-button:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(147, 51, 234, 0.35);
            transform: translateY(-1px);
        }

        .social-button:active {
            transform: translateY(0);
        }

        .social-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
        }

        .social-icon svg {
            width: 18px;
            height: 18px;
        }

        /* Alert Messages */
        .alert { 
            padding: 12px 16px; 
            border-radius: 8px; 
            margin-bottom: 24px; 
            font-size: 14px; 
            border: 1px solid;
            text-align: left;
        }

        .alert-error { 
            background: rgba(239, 68, 68, 0.1); 
            color: #fca5a5; 
            border-color: rgba(239, 68, 68, 0.25);
        }

        .alert-success { 
            background: rgba(34, 197, 94, 0.1); 
            color: #86efac; 
            border-color: rgba(34, 197, 94, 0.25);
        }

        .alert-warning { 
            background: rgba(245, 158, 11, 0.1); 
            color: #fcd34d; 
            border-color: rgba(245, 158, 11, 0.25);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .login-pf-page h1 { font-size: 42px; }
            .login-subtitle { font-size: 16px; }
            .login-form-container { padding: 36px 28px; }
        }

        @media (max-width: 480px) {
            .login-pf-container { padding: 16px; }
            .login-pf-page h1 { font-size: 32px; }
            .login-subtitle { font-size: 14px; }
            .login-form-container { padding: 28px 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="kc-container">
            <div class="login-pf">
                <div class="login-pf-container">
                    <div class="login-pf-page">
                        <div class="login-branding">
                            <#nested "header">
                        </div>

                        <div class="login-form-container">
                            <#if displayMessage && message?has_content>
                                <div class="alert alert-${message.type}">
                                    ${message.summary}
                                </div>
                            </#if>
                            
                            <#nested "form">
                            
                            <#if displayInfo>
                                <#nested "info">
                            </#if>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
</#macro>
