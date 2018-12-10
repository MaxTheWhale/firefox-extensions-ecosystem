const REDIRECT_URL = browser.identity.getRedirectURL();

/*function googleDriveStorage(client_id) {
  this.scopes = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"];
  this.auth_url =
    `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(this.scopes.join(' '))}`;
  this.validation_url = "https://www.googleapis.com/oauth2/v3/tokeninfo";
  this.upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";
  let names = browser.storage.local.get("googleDriveFileNames");
  names.then(res => {
    if (res == { }) {
      console.log("got here");
      this.fileNames = res;
    }
    else {
      console.log("got empty");
      this.fileNames = [];
    }
  });
  let ids = browser.storage.local.get("googleDriveFileIDs");
  ids.then(res => {
    if (res == { }) {
      console.log("got here");
      this.fileIDs = res;
    }
    else {
      console.log("got empty");
      this.fileIDs = [];
    }
  });

  this.extractAccessToken = function(redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
  },

  this.validate = function(redirectURL) {
    this.accessToken = extractAccessToken(redirectURL);
    if (!accessToken) {
      throw "Authorization failure";
    }
    const validationURL = `${this.validation_url}?access_token=${this.accessToken}`;
    const validationRequest = new Request(validationURL, {
      method: "GET"
    });

    function checkResponse(response) {
      return new Promise((resolve, reject) => {
        if (response.status != 200) {
          reject("Token validation error");
        }
        response.json().then((json) => {
          if (json.aud && (json.aud === client_id)) {
            resolve(this.accessToken);
          } else {
            reject("Token validation error");
          }
        });
      });
    }

    return fetch(validationRequest).then(checkResponse);
  },

  this.authorize = function() {
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      url: this.auth_url
    });
  },
  
  this.getAccessToken = function() {
    return authorize().then(validate);
  },

  this.upload = function(fileName, obj) {
    if (this.fileNames.includes(fileName)) {
      console.log("multipart");
      // Multipart/resumable upload with same id as in list
    }
    else {
      this.simpleUpload(this.accessToken, obj).then(response => {
        this.fileNames.push(fileName);
        this.fileIDs.push(response.id);
        browser.storage.local.set({googleDriveFileNames: this.fileNames});
        browser.storage.local.set({googleDriveFileIDs: this.fileIDs});
      }).catch(err => {
        console.log(err);
        // ERROR HANDLING
      });
    }
  },

  this.simpleUpload = function(token, file) {
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + token);
    requestHeaders.append('Content-Type', 'application/octet-stream');
    requestHeaders.append('Content-Length', file.length);
    const driveRequest = new Request(upload_url, {
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
}*/

function oneDriveStorage(client_id) {
  this.scopes = ["Files.ReadWrite"];
  this.auth_url =
  `https://login.microsoftonline.com/common/oauth2/v2.0/authorize\
    ?client_id=${client_id}\
    &response_type=token\
    &redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
    &scope=${encodeURIComponent(scopes.join(' '))}`;
  this.validation_url = "https://graph.microsoft.com/v1.0/me/drive/";

  this.extractAccessToken = function(redirectUri) {
    let m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    return params.get("access_token");
  },

  this.validate = function(redirectURL) {
    this.accessToken = extractAccessToken(redirectURL);
    if (!accessToken) {
      throw "Authorization failure";
    }
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    const validationRequest = new Request(validation_url, {
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

  this.authorize = function() {
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      url: auth_url
    });
  },
  
  this.getAccessToken = function() {
    return authorize().then(validate);
  },

  this.getFileList = function() {
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

class GoogleStorage {
  constructor(client_id) {
    // PRIVATE PROPERTIES
    let scopes = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"];
    let auth_url =
      `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    let validation_url = "https://www.googleapis.com/oauth2/v3/tokeninfo";
    let fileList = {};
    browser.storage.local.get("googleFiles").then(files => {
      if (files.googleFiles != undefined) {
        fileList = files.googleFiles;
      }
    });

    // PRIVATE METHODS
    async function validate(redirectURL) {
      let m = redirectURL.match(/[#?](.*)/);
      if (!m || m.length < 1)
        return null;
      let params = new URLSearchParams(m[1].split("#")[0]);
      let accessToken = params.get("access_token");
      if (!accessToken) {
        throw "Authorization failure";
      }
  
      const validationURL = `${validation_url}?access_token=${accessToken}`;
      const validationRequest = new Request(validationURL, {
        method: "GET"
      });
  
      let response = await fetch(validationRequest);
      if (response.status == 200) {
        return accessToken;
      }
      else {
        throw "Token validation failed";
      }
    }
  
    function authorize() {
      return browser.identity.launchWebAuthFlow({
        interactive: true,
        url: auth_url
      });
    }
    
    function getAccessToken() {
      return authorize().then(validate);
    }
    
    function getID(accessToken) {
      return new Promise(function (resolve, reject) {
        const requestURL = "https://www.googleapis.com/drive/v3/files/generateIds?count=1";
        var requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + accessToken);
        var driveRequest = new Request(requestURL, {
          method: "GET",
          headers: requestHeaders
        });
    
        fetch(driveRequest).then((response) => {
          if (response.status === 200) {
            console.log("yuh");
            response.json().then((data) => {
              resolve(data.ids[0]);
            });
          } else {
            console.log("nuh");
            reject(response.status);
          }
        });
    
      });
    };
    
    function initUpload(accessToken, file, name, id) {
      return new Promise(function (resolve, reject) {
        var n;
        var request = `{
        "id": "${id}",
        "name": "${name}"
      }`;
        n = request.length;
        const requestURL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
        var requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + accessToken);
        requestHeaders.append('Content-Type', 'application/json; charset=UTF-8');
        requestHeaders.append('Content-Length', n);
        requestHeaders.append('X-Upload-Content-Type', 'text/plain');
        requestHeaders.append('X-Upload-Content-Length', file.length);
        //Info on how to structure a resumable request: https://developers.google.com/drive/api/v3/resumable-upload
        //Helpful: http://chxo.com/be2/20050724_93bf.html (not so much now)
        var driveRequest = new Request(requestURL, {
          method: "POST",
          headers: requestHeaders,
          body: request
        });
    
        fetch(driveRequest).then((response) => {
          if (response.status === 200) {
            console.log("yuh");
            resolve(response);
          } else {
            console.log("nuh");
            reject(response.status);
          }
        });
    
      });
    };
    
    async function upload(accessToken, file, url) {
      var requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      requestHeaders.append('Content-Type', 'text/plain');
      requestHeaders.append('Content-Length', file.length);
      var driveRequest = new Request(url, {
        method: "POST",
        headers: requestHeaders,
        body: file
      });
    
      let response = await fetch(driveRequest)
      if (response.status === 200) {
        console.log("yuh");
        return response.json();
      }
      else {
        console.log("nuh");
        throw response.status;
      }
    }

    // PUBLIC METHODS
    this.uploadFile = async (file, name) => {
      let accessToken = await getAccessToken();
      let id = fileList[name];
      if (id == undefined) {
        id = await getID(accessToken);
      }
      let response = await initUpload(accessToken, file, name, id);
      upload(accessToken, file, response.headers.get('location'));
      fileList[name] = id;
      await browser.storage.local.set({googleFiles: fileList});
    }
  }
}

async function newGoogleStorage(client_id) {
  let googleStorage = new GoogleStorage(client_id);
  /*
  googleStorage.scopes = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"];
  googleStorage.auth_url =
    `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(googleStorage.scopes.join(' '))}`;
  googleStorage.validation_url = "https://www.googleapis.com/oauth2/v3/tokeninfo";
  googleStorage.upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";
  googleStorage.fileList = {};
  let files = await browser.storage.local.get("googleFiles");
  if (files.googleFiles != undefined) {
    googleStorage.fileList = files.googleFiles;
  }

  googleStorage.validate = async (redirectURL) => {
    let m = redirectURL.match(/[#?](.*)/);
    if (!m || m.length < 1)
      return null;
    let params = new URLSearchParams(m[1].split("#")[0]);
    accessToken = params.get("access_token");
    if (!accessToken) {
      throw "Authorization failure";
    }

    const validationURL = `${this.validation_url}?access_token=${accessToken}`;
    const validationRequest = new Request(validationURL, {
      method: "GET"
    });

    let response = await fetch(validationRequest);
    if (response.status == 200) {
      return accessToken;
    }
    else {
      throw "Token validation failed";
    }
  };

  googleStorage.authorize = () => {
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      url: this.auth_url
    });
  };
  
  googleStorage.getAccessToken = () => {
    return this.authorize().then(this.validate);
  };

  googleStorage.uploadFile = async (file, name) => {
    let accessToken = await this.getAccessToken();
    let id = await getID(accessToken);
    let response = await initUpload(accessToken, file, name, id);
    upload(accessToken, file, response.headers.get('location'));
    this.fileList[name] = id;
    await browser.storage.local.set({googleFiles: this.fileList});
  };
  
  googleStorage.getID = (accessToken) => {
    return new Promise(function (resolve, reject) {
      const requestURL = "https://www.googleapis.com/drive/v3/files/generateIds?count=1";
      var requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      var driveRequest = new Request(requestURL, {
        method: "GET",
        headers: requestHeaders
      });
  
      fetch(driveRequest).then((response) => {
        if (response.status === 200) {
          console.log("yuh");
          response.json().then((data) => {
            resolve(data.ids[0]);
          });
        } else {
          console.log("nuh");
          reject(response.status);
        }
      });
  
    });
  };
  
  googleStorage.initUpload = (accessToken, file, name, id) => {
    return new Promise(function (resolve, reject) {
      var n;
      var request = `{
      "id": "${id}",
      "name": "${name}"
    }`;
      n = request.length;
      const requestURL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
      var requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      requestHeaders.append('Content-Type', 'application/json; charset=UTF-8');
      requestHeaders.append('Content-Length', n);
      requestHeaders.append('X-Upload-Content-Type', 'text/plain');
      requestHeaders.append('X-Upload-Content-Length', file.length);
      //Info on how to structure a resumable request: https://developers.google.com/drive/api/v3/resumable-upload
      //Helpful: http://chxo.com/be2/20050724_93bf.html (not so much now)
      var driveRequest = new Request(requestURL, {
        method: "POST",
        headers: requestHeaders,
        body: request
      });
  
      fetch(driveRequest).then((response) => {
        if (response.status === 200) {
          console.log("yuh");
          resolve(response);
        } else {
          console.log("nuh");
          reject(response.status);
        }
      });
  
    });
  };
  
  googleStorage.upload = (accessToken, file, url) => {
    var requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    requestHeaders.append('Content-Type', 'text/plain');
    requestHeaders.append('Content-Length', file.length);
    var driveRequest = new Request(url, {
      method: "PUT",
      headers: requestHeaders,
      body: file
    });
  
    return fetch(driveRequest).then((response) => {
      if (response.status === 200) {
        console.log("yuh");
        return response.json();
      } else {
        console.log("nuh");
        throw response.status;
      }
    });
  
  }*/

  return googleStorage;
}

async function createRemoteStorage(storageProvider, client_id) {
  if (storageProvider.toLowerCase() == "google") {
    return await newGoogleStorage(client_id);
  }
  else if (storageProvider.toLowerCase() == "onedrive") {
    return await oneDriveStorage(client_id);
  }
  else {
    throw "No such storage provider";
  }
}
