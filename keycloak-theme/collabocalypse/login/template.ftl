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
            background:
                linear-gradient(rgba(8, 6, 18, 0.72), rgba(8, 6, 18, 0.82)),
                url('${url.resourcesPath}/login.jpg') center center / cover no-repeat fixed;
            background-color: #1a1a1a;
            color: var(--color-text-primary);
            height: 100vh;
            overflow: hidden;
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
            position: relative;
            background:
                linear-gradient(165deg, rgba(53, 35, 94, 0.56) 0%, rgba(31, 23, 60, 0.74) 48%, rgba(20, 16, 42, 0.84) 100%);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border-radius: 18px;
            padding: 42px 40px;
            box-shadow:
                0 28px 70px rgba(8, 5, 20, 0.62),
                0 0 0 1px rgba(198, 164, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.16);
            border: 1px solid rgba(186, 146, 255, 0.24);
            margin-top: 28px;
            overflow: hidden;
        }

        .login-form-container::before {
            content: "";
            position: absolute;
            width: 220px;
            height: 220px;
            border-radius: 50%;
            top: -130px;
            left: -60px;
            background: radial-gradient(circle, rgba(198, 147, 255, 0.32), rgba(198, 147, 255, 0));
            pointer-events: none;
        }

        .login-form-container::after {
            content: "";
            position: absolute;
            width: 250px;
            height: 250px;
            border-radius: 50%;
            bottom: -150px;
            right: -70px;
            background: radial-gradient(circle, rgba(128, 103, 255, 0.28), rgba(128, 103, 255, 0));
            pointer-events: none;
        }

        /* Form Styling */
        .form-group { 
            margin-bottom: 24px;
            text-align: left;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
            color: rgba(235, 223, 255, 0.92);
            letter-spacing: 0px;
        }

        .form-control, 
        input[type="text"], 
        input[type="password"], 
        input[type="email"] {
            width: 100%;
            padding: 13px 14px;
            background: rgba(12, 10, 26, 0.6);
            border: 1px solid rgba(182, 143, 252, 0.24);
            border-radius: 10px;
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
            border-color: rgba(205, 175, 255, 0.8);
            background: rgba(14, 11, 28, 0.86);
            box-shadow: 
                0 0 0 3px rgba(173, 121, 245, 0.22),
                0 10px 22px rgba(16, 10, 37, 0.44);
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
            background: linear-gradient(180deg, #ead8ff 0%, #c9a8ff 16%, #9f75f9 58%, #875ce8 100%);
            color: var(--color-text-primary);
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: var(--transition-smooth);
            box-shadow: 
                0 8px 18px rgba(103, 67, 168, 0.28),
                0 1px 5px rgba(188, 145, 255, 0.18),
                inset 0 1px 0 rgba(255, 255, 255, 0.32),
                inset 0 -2px 4px rgba(0, 0, 0, 0.18);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }

        .button:hover, 
        input[type="submit"]:hover {
            background: linear-gradient(180deg, #f1e3ff 0%, #d3b5ff 18%, #ab82ff 60%, #8f65f0 100%);
            box-shadow: 
                0 10px 22px rgba(116, 77, 187, 0.34),
                0 2px 8px rgba(205, 172, 255, 0.22),
                inset 0 1px 0 rgba(255, 255, 255, 0.44),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
        }

        .button:active, 
        input[type="submit"]:active {
            transform: translateY(0);
            box-shadow: 
                0 4px 10px rgba(103, 67, 168, 0.24),
                0 1px 3px rgba(188, 145, 255, 0.15),
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
            border-radius: 10px;
            border: 1px solid rgba(191, 158, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
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
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(193, 152, 255, 0.45);
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
            .login-form-container { padding: 34px 28px; border-radius: 16px; }
        }

        @media (max-width: 480px) {
            .login-pf-container { padding: 16px; }
            .login-pf-page h1 { font-size: 32px; }
            .login-subtitle { font-size: 14px; }
            .login-form-container { padding: 28px 20px; border-radius: 14px; }
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
