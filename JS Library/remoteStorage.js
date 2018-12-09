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
  accessToken: null,
  fileNames: null,
  fileIDs: null,
  extractAccessToken: function (redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
  },

  validate: function (redirectURL) {
    this.accessToken = extractAccessToken(redirectURL);
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

  getFileList: function() {
    let names = browser.storage.local.get(googleDriveFileNames);
    names.then(res => {
        this.fileNames = res;
      }).catch(err => {
        this.fileNames = [];
      });
    let ids = browser.storage.local.get(googleDriveFileIDs);
    ids.then(res => {
        this.fileIDs = res;
      }).catch(err => {
        this.fileIDs = [];
      });
  },

  upload: function(fileName, obj) {
    if (this.fileNames.includes(fileName)) {
      this.simpleUpload(this.accessToken, obj).then(response => {
        this.fileNames.push(fileName);
        this.fileIDs.push(response.id);
        browser.storage.local.set({googleDriveFileNames: this.fileNames});
        browser.storage.local.set({googleDriveFileIDs: this.fileIDs});
      }).catch(err => {
        // ERROR HANDLING
      });
    }
    else {
      // Multipart/resumable upload with same id as in list
    }
  },

  simpleUpload: function(token, file) {
    const requestURL = GDRIVE_UPLOAD_URL;
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + token);
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
  accessToken: null,
  fileNames: null,
  fileIDs: null,
  extractAccessToken: function (redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
  },

  validate: function (redirectURL) {
    this.accessToken = extractAccessToken(redirectURL);
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

  getFileList: function() {
    let names = browser.storage.local.get(oneDriveFileNames);
    names.then(res => {
        this.fileNames = res;
      }).catch(err => {
        this.fileNames = [];
      });
    let ids = browser.storage.local.get(oneDriveFileIDs);
    ids.then(res => {
        this.fileIDs = res;
      }).catch(err => {
        this.fileIDs = [];
      });
  }
}
