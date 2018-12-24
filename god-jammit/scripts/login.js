var uiConfig = {
        signInSuccessUrl: '../index.html',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: 'https://termsfeed.com/terms-service/45f088ee0733ffab846ad1a76881c62f',
        // Privacy policy url/callback.
        privacyPolicyUrl: 'https://www.freeprivacypolicy.com/privacy/view/133042022e5d7b9218448a6f8e40b776'
      };

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
