// amplify-auth-browser.js - Browser-compatible version without ES modules

// Sign Up Handler
async function handleRegister(event) {
  event.preventDefault();

  const email = $('#emailInputRegister').val();
  const password = $('#passwordInputRegister').val();
  const password2 = $('#password2InputRegister').val();

  if (password !== password2) {
    showMessage('signup-status', 'Passwords do not match');
    return;
  }

  try {
    const signUpResponse = await Amplify.Auth.signUp({
      username: email,
      password,
      attributes: {
        email
      }
    });
    
    showMessage('signup-status', '✅ Registered! Check your email for a verification code.');
    setTimeout(() => window.location.href = 'verify.html', 2000);
  } catch (error) {
    showMessage('signup-status', error.message || 'Registration failed');
  }
}

// Confirm Email Verification Code
async function handleVerify(event) {
  event.preventDefault();

  const email = $('#emailInputVerify').val();
  const code = $('#codeInputVerify').val();

  try {
    await Amplify.Auth.confirmSignUp(email, code);
    showMessage('verify-status', '✅ Verification successful. Redirecting...');
    setTimeout(() => window.location.href = 'signin.html', 2000);
  } catch (error) {
    showMessage('verify-status', error.message || 'Verification failed');
  }
}

// Sign In + MFA
async function handleSignin(event) {
  event.preventDefault();

  const email = $('#username').val();
  const password = $('#password').val();

  try {
    const user = await Amplify.Auth.signIn(email, password);
    
    // Handle MFA if required
    if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
      const code = prompt("Enter MFA code from your Authenticator app:");
      await Amplify.Auth.confirmSignIn(user, code, user.challengeName);
    }
    
    // Handle new password required
    if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
      $('#error-message').text("Your password must be reset. This flow is not yet supported.");
      return;
    }
    
    console.log("✅ Logged in successfully");
    window.location.href = "index.html";
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    $('#error-message').text(error.message || "Login failed.");
  }
}

// Show messages
function showMessage(id, msg) {
  $('#' + id).text(msg);
}

// Initialize Amplify
function initAmplify() {
  // Configure Amplify
  Amplify.configure(window.awsConfig);
}

// Document ready
$(document).ready(function() {
  // Initialize Amplify
  initAmplify();
  
  // Bind form handlers
  $('#registrationForm').on('submit', handleRegister);
  $('#verifyForm').on('submit', handleVerify);
  $('#signinForm').on('submit', handleSignin);
});