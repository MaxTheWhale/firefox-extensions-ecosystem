const REDIRECT_URL = browser.identity.getRedirectURL();

const GDRIVE_SCOPES = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"];
const GDRIVE_AUTH_URL =
  `https://accounts.google.com/o/oauth2/auth\
    ?client_id=${CLIENT_ID}\
    &response_type=token\
    &redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
    &scope=${encodeURIComponent(SCOPES.join(' '))}`;
const GDRIVE_VALIDATION_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";
const GDRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";


const ONEDRIVE_SCOPES = ["Files.ReadWrite"];
const ONEDRIVE_AUTH_URL =
  `https://login.microsoftonline.com/common/oauth2/v2.0/authorize\
    ?client_id=${CLIENT_ID}\
    &response_type=token\
    &redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
    &scope=${encodeURIComponent(SCOPES.join(' '))}`;
const ONEDRIVE_VALIDATION_URL = "https://graph.microsoft.com/v1.0/me/drive/";

let googleDriveStorage = {
  extractAccessToken: function (redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
  },

  validate: function (redirectURL) {
    const accessToken = extractAccessToken(redirectURL);
    if (!accessToken) {
      throw "Authorization failure";
    }
    const validationURL = `${GDRIVE_VALIDATION_URL}?access_token=${accessToken}`;
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
  },

  authorize: function() {
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      url: AUTH_URL
    });
  },
  
  getAccessToken: function() {
    return authorize().then(validate);
  },

  uploadFile: function(accessToken, file) {
    const requestURL = GDRIVE_UPLOAD_URL;
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    requestHeaders.append('Content-Type', 'application/octet-stream');
    requestHeaders.append('Content-Length', file.length);
    const driveRequest = new Request(requestURL, {
      method: "POST",
      body: file,
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
}


let oneDriveStorage = {
  extractAccessToken: function (redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
  },

  validate: function (redirectURL) {
    const accessToken = extractAccessToken(redirectURL);
    if (!accessToken) {
      throw "Authorization failure";
    }
    const requestURL = ONEDRIVE_VALIDATION_URL;
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
  },

  authorize: function() {
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      url: AUTH_URL
    });
  },
  
  getAccessToken: function() {
    return authorize().then(validate);
  },

  uploadFile: function(accessToken, file) {
    
  }
}
