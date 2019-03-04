const REDIRECT_URL = browser.identity.getRedirectURL();

const getSize = function(content) {
  var className = content.constructor.name;
  if (className === 'Blob' || className === 'File') {
    return content.size;
  }
  if (className === 'ArrayBuffer'
    || className === 'Int8Array'
    || className === 'Int16Array'
    || className === 'Int32Array'
    || className === 'Uint8Array'
    || className === 'Uint16Array'
    || className === 'Uint32Array'
    || className === 'Uint8ClampedArray'
    || className === 'Float32Array'
    || className === 'Float64Array'
    || className === 'DataView') {
    return content.byteLength
  }
  if (typeof content === 'string') {
    return content.length
  }
  else {
    return JSON.stringify(content).length;
  }
}

const getMIME = function(content) {
  let request = new Request("", {
    method: "PUT",
    body: content
  });
  return request.headers.get("Content-Type");
}

class GoogleStorage {
  constructor(client_id) {
    // PRIVATE PROPERTIES
    let scopes = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"];
    let auth_url =
      `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    let validation_url = "https://www.googleapis.com/oauth2/v3/tokeninfo";
    let token = "";
    let expireTime;

    // PRIVATE METHODS

    async function checkToken(scopeChange) {
      if (token === "" || Date.now() >= expireTime || scopeChange)
        token = await getAccessToken();
    }

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
      if (response.ok) {
        expireTime = Date.now() + 3590000; //Expire after 60 minutes
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
        let requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + accessToken);
        let driveRequest = new Request(requestURL, {
          method: "GET",
          headers: requestHeaders
        });
    
        fetch(driveRequest).then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              resolve(data.ids[0]);
            });
          } else {
            console.log("ID acquisition failed: " + response.status);
            reject(response.status);
          }
        });
    
      });
    };
    
    function initUpload(accessToken, file, name, id, overwriting) {
      return new Promise(function (resolve, reject) {
        let requestURL = "https://www.googleapis.com/upload/drive/v3/files/";
        let request = {};
        let requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + accessToken);
        requestHeaders.append('Content-Type', 'application/json');
        if (overwriting) {
          requestURL += `${id}?uploadType=resumable`;
        }
        else {
          request = {
            "id": `${id}`,
            "name": `${name}`
          };
          requestURL += `?uploadType=resumable`;
        }
        requestHeaders.append('X-Upload-Content-Type', getMIME(file));
        requestHeaders.append('X-Upload-Content-Length', getSize(file));
        //Info on how to structure a resumable request: https://developers.google.com/drive/api/v3/resumable-upload
        let driveRequest = new Request(requestURL, {
          method: overwriting ? "PATCH" : "POST",
          headers: requestHeaders,
          body: JSON.stringify(request)
        });
    
        fetch(driveRequest).then((response) => {
          if (response.ok) {
            resolve(response);
          } else {
            console.log("Upload initialization failed: " + response.status);
            reject(response.status);
          }
        });
    
      });
    };
    
    async function upload(accessToken, file, url) {
      let requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      let driveRequest = new Request(url, {
        method: "PUT",
        headers: requestHeaders,
        body: file
      });
    
      let response = await fetch(driveRequest)
      if (response.ok) {
        return response.status;
      }
      else {
        console.log("Upload failed: " + response.status);
        throw response.status;
      }
    }

    async function getMetadata(accessToken, id) {
      let requestURL = `https://www.googleapis.com/drive/v3/files/${id}`;
      let requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);

      let driveRequest = new Request(requestURL, {
        method: "GET",
        headers: requestHeaders
      });
    
      let response = await fetch(driveRequest)
      if (response.ok) {
        return response.json();
      }
      else {
        console.log("Getting Metadata failed: " + response.status);
        throw response.status;
      }
    }

    async function getFileID(accessToken, fileName) {
      let requestURL = new URL(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`);
      let requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);

      let driveRequest = new Request(requestURL, {
        method: "GET",
        headers: requestHeaders
      });
    
      let response = await fetch(driveRequest)
      if (response.ok) {
        let res = await response.json();
        if (res.files[0] !== undefined) {
          return res.files[0].id;
        }
        else throw "No such file"
      }
      else {
        console.log("File search failed: " + response.status);
        throw response.status;
      }
    }

    async function download(accessToken, url) {
      let requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      let driveRequest = new Request(url, {
        method: "GET",
        headers: requestHeaders
      });
    
      let response = await fetch(driveRequest)
      if (response.ok) {
        return await response.blob();
      }
      else {
        console.log("Download failed: " + response.status);
        throw response.status;
      }
    }

    async function gdelete(accessToken, url) {
      let requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      let driveRequest = new Request(url, {
        method: "DELETE",
        headers: requestHeaders
      });
    
      let response = await fetch(driveRequest)
      if (!response.ok) {
        console.log("Delete failed: " + response.status);
        throw response.status;
      }
      return response.status;
    }

    // PUBLIC METHODS
    this.auth = async () => {
      await checkToken(false);
    }

    this.uploadFile = async (file, name) => {
      await checkToken(false);
      let id;
      let overwriting = true;
      try {
        id = await getFileID(token, name);
      } catch (error) {
        id = await getID(token);
        overwriting = false;
      }
      try {
        let response = await initUpload(token, file, name, id, overwriting);
        return await upload(token, file, response.headers.get('location'));
      } catch (error) {
        throw error;
      }
    }

    this.downloadFile = async (fileName) => {
      await checkToken(false);
      try {
        let id = await getFileID(token, fileName);
        let requestURL = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
        return await download(token, requestURL);
      } catch (error) {
        throw error;
      }
    }

    this.deleteFile = async (fileName) => {
      await checkToken(false);
      try {
        let id = await getFileID(token, fileName);
        let requestURL = `https://www.googleapis.com/drive/v3/files/${id}`;
        return await gdelete(token, requestURL);
      } catch (error) {
        throw error;
      }
    }

    this.getInfo = async (fileName) => {
      await checkToken(false);
      try {
        if (fileName === undefined) {
          let list = await getMetadata(token, "");
          let result = {};
          list.files.forEach(file => {
            if (file.kind === "drive#file") {
              result[file.name] = file;
            }
          });
          return result;
        }
        else {
          return await getMetadata(token, await getFileID(token, fileName));
        }
      } catch (error) {
        throw error;
      }
    }
  }
}

class OneDriveStorage {
  constructor(client_id) {
    // PRIVATE PROPERTIES
    let scopes = ["Files.ReadWrite", "offline_access", "openid"];
    let auth_url =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    let validation_url = "https://graph.microsoft.com/v1.0/me/drive/";
    let token = "";
    let expireTime;
    let init = initialize();

    // PRIVATE METHODS
    async function initialize() {
      token = await getAccessToken();
    }

    function extractAccessToken(redirectUri) {
      let m = redirectUri.match(/[#?](.*)/);
      if (!m || m.length < 1)
        return null;
      let params = new URLSearchParams(m[1].split("#")[0]);
      return params.get("access_token");
    }
  
    async function validate(redirectURL) {
      let accessToken = extractAccessToken(redirectURL);
      if (!accessToken) {
        throw "Authorization failure";
      }
      const requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      const validationRequest = new Request(validation_url, {
        method: "GET",
        headers: requestHeaders
      });
  
      let response = await fetch(validationRequest);
      if (response.ok) {
        expireTime = Date.now() + 3590000;
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

    async function checkToken() {
      if (token === "" || Date.now() >= expireTime) {
        await initialize();
      }
    }

    async function getMetadata(id) {
      const requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + token);
      let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${id}`, {
        headers: requestHeaders
      });
      if (response.ok) {
        return await response.json();
      }
      else {
        throw response.status;
      }
    }

    async function getID(fileName) {
      const requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + token);
      let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}`, {
        headers: requestHeaders
      });
      if (response.ok) {
        let fileInfo = await response.json();
        if (fileInfo.id !== undefined) {
          return fileInfo.id;
        }
        else throw "No such file";
      }
      else {
        throw response.status;
      }
    }

    async function upload(file, url) {
      try {
        const requestHeaders = new Headers();
        let size = getSize(file);
        requestHeaders.append('Content-Range', `bytes 0-${size-1}/${size}`);
        let response = await fetch(url, {
          method: "PUT",
          headers: requestHeaders,
          body: file
        });
        if (response.ok) {
          return response.status;
        }
        else {
          throw response.status;
        }
      } catch (error) {
        throw error;
      }
    }

    async function initUpload(name) {
      const requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + token);
      requestHeaders.append('Content-Type', 'application/json');
      let requestBody = {
        "item": {
          "@microsoft.graph.conflictBehavior": "replace",
        }
      };
      let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${name}:/createUploadSession`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      });
      if (response.ok) {
        return await response.json();
      }
      else {
        throw response.status;
      }
    };

    async function download(fileName) {
      try {
        const requestHeaders = new Headers();
        let id = await getID(fileName);
        requestHeaders.append('Authorization', 'Bearer ' + token);
        let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${id}`, {
          headers: requestHeaders
        });
        if (response.ok) {
          let fileInfo = await response.json();
          let fileResponse = await fetch(fileInfo["@microsoft.graph.downloadUrl"]);
          if (fileResponse.ok) {
            return await fileResponse.blob();
          }
          else {
            throw fileResponse.status;
          }
        }
        else {
          throw response.status;
        }
      } catch (error) {
        throw error;
      }
    }

    // PUBLIC METHODS
    this.auth = async () => {
      await checkToken();
    }

    this.uploadFile = async (file, name) => {
      await init;
      await checkToken();
      let response = await initUpload(name);
      return await upload(file, response.uploadUrl);
    }

    this.downloadFile = async (fileName) => {
      await init;
      await checkToken();
      return await download(fileName);
    }

    this.deleteFile = async (fileName) => {
      await init;
      await checkToken();
      try {
        let id = await getID(fileName);
        const requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + token);
        let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${id}`, {
          headers: requestHeaders,
          method: "DELETE"
        });
        if (response.ok) {
          return response.status;
        }
        else {
          throw response.status;
        }
      } catch (error) {
        throw error;
      }
    }

    this.getInfo = async (fileName) => {
      await init;
      await checkToken();
      if (fileName === undefined) {
        const requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + token);
        let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root/children`, {
          headers: requestHeaders
        });
        if (response.ok) {
          let files = await response.json();
          let result = {};
          files.value.forEach(file => {
            if (file.folder === undefined) {
              file.mimeType = file.file.mimeType;
              result[file.name] = file;
            }
          });
          return result;
        }
        else {
          throw response.status;
        }
      }
      else {
        let info = await getMetadata(await getID(fileName));
        info.mimeType = info.file.mimeType;
        return info;
      }
    }
  }
}

async function createRemoteStorage(storageProvider, client_id) {
  if (storageProvider.toLowerCase() === "google") {
    let googleStorage = new GoogleStorage(client_id);
    return googleStorage;
  }
  else if (storageProvider.toLowerCase() === "onedrive") {
    let onedriveStorage = new OneDriveStorage(client_id);
    return onedriveStorage;
  }
  else {
    throw "No such storage provider";
  }
}
