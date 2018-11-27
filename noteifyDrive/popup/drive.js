//Authorization code taken from: https://github.com/mdn/webextensions-examples/tree/master/google-userinfo
const API_KEY = 'AIzaSyDiYVNGdO9I6deLAi-PPeNd0UZ0M7dK2lc';
const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID = '800655122962-t9bbgnubrr54dlo8i3u83rmnbdea6sur.apps.googleusercontent.com';
const SCOPES = ["https://www.googleapis.com/auth/drive.file", "profile", "https://www.googleapis.com/auth/drive"];
const AUTH_URL =
`https://accounts.google.com/o/oauth2/auth\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
&scope=${encodeURIComponent(SCOPES.join(' '))}`;
// \
// &prompt=select_account`;
const LOG_OUT_URL = 'https://accounts.google.com/logout'
const VALIDATION_BASE_URL="https://www.googleapis.com/oauth2/v3/tokeninfo";

function onError(error) {
    console.log(error);
}

function extractAccessToken(redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
}

function authorize() {
  console.log("1");
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      url: AUTH_URL
    });
}

function logout() {
  return browser.identity.launchWebAuthFlow({
    interactive: true,
    url: LOG_OUT_URL
  });
}

function validate(redirectURL) {
  console.log("2");
    const accessToken = extractAccessToken(redirectURL);
    if (!accessToken) {
      throw "Authorization failure";
    }
    const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
    const validationRequest = new Request(validationURL, {
      method: "GET"
    });
    function checkResponse(response) {
      return new Promise((resolve, reject) => {
        if (response.status != 200) {
          reject("Token validation error");
        }
        response.json().then((json) => {
          if (json.aud && (json.aud === CLIENT_ID)) {
            resolve(accessToken);
          } else {
            reject("Token validation error");
          }
        });
      });
    }
    return fetch(validationRequest).then(checkResponse);
}

function getAccessToken() {
    return authorize().then(validate);
}

function getFilesList(accessToken) {
    console.log("3");
    // const requestURL = "https://content.googleapis.com/drive/v3/files?pageSize=20&q=name%20contains%20%27pdf%27&fields=nextPageToken%2C%20files(id%2C%20name)";
    const requestURL = "https://content.googleapis.com/drive/v3/files";
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    const driveRequest = new Request(requestURL, {
      method: "GET",
      headers: requestHeaders
    });

    return fetch(driveRequest).then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw response.status;
      }
    });

}

function handleClientLoad() {
    // Loads the client library and the auth2 library together for efficiency.
    // Loading the auth2 library is optional here since `gapi.client.init` function will load
    // it if not already loaded. Loading it upfront can save one network request.
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // Initialize the client with API key and People API, and initialize OAuth with an
    // OAuth 2.0 client ID and scopes (space delimited string) to request access.
    gapi.load('client:auth2', () => {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: DISCOVERY_DOCS
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

      // Handle the initial sign-in state.
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
});
    console.log("Hi");
}

getAccessToken()
    .then(getFilesList)
    .then((result) => {
        var files = result.files;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              console.log(file.name);
            }
        }
    })
    .catch(onError);