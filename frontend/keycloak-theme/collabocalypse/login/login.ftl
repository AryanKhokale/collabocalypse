<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displaySocialButtons; section>
    <#if section = "header">
        <h1>Collabocalypse</h1>
        <p class="login-subtitle">Real-time collaborative documents for teams that move fast</p>
    <#elseif section = "form">
        <form id="kc-form-login" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username">Username or email</label>
                <input 
                    tabindex="1" 
                    id="username" 
                    class="form-control" 
                    name="username" 
                    value="${(login.username!'')}" 
                    type="text" 
                    autofocus 
                    autocomplete="off"
                    placeholder="Email or username" />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input 
                    tabindex="2" 
                    id="password" 
                    class="form-control" 
                    name="password" 
                    type="password" 
                    autocomplete="off"
                    placeholder="Password" />
            </div>

            <div id="kc-form-buttons">
                <input 
                    tabindex="4" 
                    class="button" 
                    type="submit" 
                    value="Sign in" />
            </div>
        </form>

        <#if social?? && social.providers?has_content>
            <div class="social-divider"><span>or</span></div>
            <div class="social-buttons">
                <#list social.providers as p>
                    <a class="social-button" href="${p.loginUrl}">
                        <span class="social-icon">
                            <#if p.providerId == "google">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.29-.21-1.86H12v3.38h5.54c-.11.84-.7 2.1-2.01 2.94l-.02.14 2.92 2.26.2.02c1.8-1.7 2.83-4.2 2.83-6.88Z"/>
                                    <path fill="#34A853" d="M12 22c2.57 0 4.73-.84 6.31-2.29l-3.01-2.32c-.8.54-1.86.92-3.3.92-2.52 0-4.67-1.7-5.43-4.06l-.12.01-2.95 2.29-.04.12C5.94 19.98 8.76 22 12 22Z"/>
                                    <path fill="#FBBC05" d="M6.57 14.25c-.2-.59-.32-1.22-.32-1.88s.12-1.29.31-1.88l-.01-.13-2.98-2.32-.1.05C2.51 9.59 2 10.95 2 12.37c0 1.42.51 2.78 1.47 3.88l3.1-2.4Z"/>
                                    <path fill="#EA4335" d="M12 6.84c1.79 0 3 0.76 3.68 1.39l2.68-2.6C16.71 3.8 14.57 3 12 3 8.76 3 5.94 5.02 4.37 7.77l3.19 2.49C7.33 8.55 9.48 6.84 12 6.84Z"/>
                                </svg>
                            <#else>
                                ${p.iconHtml!""}
                            </#if>
                        </span>
                        <span>Sign in with ${p.displayName}</span>
                    </a>
                </#list>
            </div>
        </#if>

        <div class="back-link">
            <a href="${url.loginRestartFlowUrl!'#'}">← Back</a>
        </div>

        <#if realm.resetPasswordAllowed>
            <div id="kc-forgot-pwd">
                <span><a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a></span>
            </div>
        </#if>

        <#if realm.password && realm.registrationAllowed && !usernameEditDisabled??>
            <div id="kc-registration">
                <span>${msg("noAccount")} <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a></span>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
