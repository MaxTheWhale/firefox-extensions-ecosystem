// Load existent stats with the storage API.

/* exported getAccessToken */

const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID = "7f9f22a2-9c74-4840-8b86-bb815c78b56b";
const SCOPES = ["Files.ReadWrite"];
const AUTH_URL =
`https://login.microsoftonline.com/common/oauth2/v2.0/authorize\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
&scope=${encodeURIComponent(SCOPES.join(' '))}`;

function extractAccessToken(redirectUri) {
  let m = redirectUri.match(/[#?](.*)/);
  if (!m || m.length < 1)
    return null;
  let params = new URLSearchParams(m[1].split("#")[0]);
  return params.get("access_token");
}

function validate(redirectURL) {
  const accessToken = extractAccessToken(redirectURL);
  if (!accessToken) {
    throw "Authorization failure";
  }
  const requestURL = "https://graph.microsoft.com/v1.0/me/drive/";
  const requestHeaders = new Headers();
  requestHeaders.append('Authorization', 'Bearer ' + accessToken);
  const validationRequest = new Request(requestURL, {
    method: "GET",
    headers: requestHeaders
  });

  function checkResponse(response) {
    return new Promise((resolve, reject) => {
      if (response.status != 200) {
        reject("Token validation error");
      }
      else resolve(accessToken);
    });
  }

  return fetch(validationRequest).then(checkResponse);
}

/**
Authenticate and authorize using browser.identity.launchWebAuthFlow().
If successful, this resolves with a redirectURL string that contains
an access token.
*/
function authorize() {
  return browser.identity.launchWebAuthFlow({
    interactive: true,
    url: AUTH_URL
  });
}

function getAccessToken() {
  return authorize().then(validate);
}

// Tried to wrap getting the stats from OneDrive in a promise, so that it can be
// used in the existing code unmodified.
var getStats =
  getAccessToken().then(tkn => {
    client = MicrosoftGraph.Client.init({
    authProvider: (done) => {
      done(null, tkn);
    }
    });
    return client.api('/me/drive/root:/Mozilla/storage.json')
    .get()
  })
  .then(fileInfo => {
    return fetch(fileInfo["@microsoft.graph.downloadUrl"]);
  })
  .then(response => {
    return response.json();
  })
  .then(jsonStats => {
    return browser.storage.local.set(jsonStats);
  })
  .then(res => {
    return browser.storage.local.get();
  })
  .catch(err => {
    // Should probably do proper error handling here
    console.log(err);
  });

// At the moment this is called everytime a storage key is changed, and it
// reuploads the entire storage json file. Need to figure out a better way.
function uploadStats() {
  browser.storage.local.get()
  .then(results => {
    client
      .api('/me/drive/root:/Mozilla/storage.json:/content')
      .put(results);
  })
  .catch(err => {
    console.log(err);
  });
}

getStats.then(results => {
  // Initialize the saved stats if not yet initialized.
  if (!results.type) {
    results = {
      host: {},
      type: {link: 0, reload: 0, typed: 0, generated: 0},
      protocol: {https: 0, http: 0}
    };
  }

  // Monitor completed navigation events and update
  // stats accordingly.
  browser.webNavigation.onCommitted.addListener((evt) => {
    if (evt.frameId !== 0) {
      return;
    }

    let transitionType = evt.transitionType;
    results.type[transitionType] = results.type[transitionType] || 0;
    results.type[transitionType]++;

    // Persist the updated stats.
    browser.storage.local.set(results);
    uploadStats();
  });

  browser.webNavigation.onCompleted.addListener(evt => {
    // Filter out any sub-frame related navigation event
    if (evt.frameId !== 0) {
      return;
    }

    const url = new URL(evt.url);

    results.host[url.hostname] = results.host[url.hostname] || 0;
    results.host[url.hostname]++;
   
    // Had to add this because I couldn't figure out how to access a JSON key
    // that contained a colon
    if (url.protocol === "https:") results.protocol.https++;
    if (url.protocol === "http:") results.protocol.http++;


    // Persist the updated stats.
    browser.storage.local.set(results);
    uploadStats();
  }, {
    url: [{schemes: ["http", "https"]}]});
});