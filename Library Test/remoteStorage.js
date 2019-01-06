const REDIRECT_URL = browser.identity.getRedirectURL();

class GoogleStorage {
  constructor(client_id) {
    // PRIVATE PROPERTIES
    let scopes = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file"];
    let auth_url =
      `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    let validation_url = "https://www.googleapis.com/oauth2/v3/tokeninfo";

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
      if (response.status === 200) {
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
          if (response.status === 200) {
            response.json().then((data) => {
              resolve(data.ids[0]);
            });
          } else {
            console.log("ID acquisition failed");
            reject(response.status);
          }
        });
    
      });
    };
    
    function initUpload(accessToken, file, name, id, overwriting) {
      return new Promise(function (resolve, reject) {
        let requestURL = "https://www.googleapis.com/upload/drive/v3/files/";
        let request = "";
        let requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + accessToken);
        if (overwriting) {
          requestURL += `${id}?uploadType=resumable`;
          requestHeaders.append('Content-Length', 0);
        }
        else {
          request = `{
            "id": "${id}",
            "name": "${name}"
          }`;
          requestHeaders.append('Content-Type', 'application/json; charset=UTF-8');
          requestHeaders.append('Content-Length', request.length);
          requestURL += `?uploadType=resumable`;
        }  
        requestHeaders.append('X-Upload-Content-Type', 'text/plain');
        requestHeaders.append('X-Upload-Content-Length', file.length);
        //Info on how to structure a resumable request: https://developers.google.com/drive/api/v3/resumable-upload
        //Helpful: http://chxo.com/be2/20050724_93bf.html (not so much now)
        let driveRequest = new Request(requestURL, {
          method: overwriting ? "PATCH" : "POST",
          headers: requestHeaders,
          body: request
        });
    
        fetch(driveRequest).then((response) => {
          if (response.status === 200) {
            resolve(response);
          } else {
            console.log("Upload initialization failed");
            reject(response.status);
          }
        });
    
      });
    };
    
    async function upload(accessToken, file, url) {
      let requestHeaders = new Headers();
      requestHeaders.append('Authorization', 'Bearer ' + accessToken);
      requestHeaders.append('Content-Type', 'text/plain');
      requestHeaders.append('Content-Length', file.length);
      let driveRequest = new Request(url, {
        method: "PUT",
        headers: requestHeaders,
        body: file
      });
    
      let response = await fetch(driveRequest)
      if (response.status === 200) {
        return response.json();
      }
      else {
        console.log("Upload failed");
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
      if (response.status === 200) {
        return response.json();
      }
      else {
        console.log("Getting Metadata failed");
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
      if (response.status === 200) {
        let res = await response.json();
        if (res.files[0] !== undefined) {
          return res.files[0].id;
        }
        else throw "No such file"
      }
      else {
        console.log("File search failed");
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
      if (response.status === 200) {
        return response.blob();
      }
      else {
        console.log("Download failed");
        throw response.status;
      }
    }

    // PUBLIC METHODS
    this.uploadFile = async (file, name) => {
      let accessToken = await getAccessToken();
      let id;
      let overwriting = true;
      try {
        id = await getFileID(accessToken, name);
      } catch (error) {
        id = await getID(accessToken);
        overwriting = false;
      }
      let response = await initUpload(accessToken, file, name, id, overwriting);
      upload(accessToken, file, response.headers.get('location'));
    }

    this.downloadFile = async (fileName) => {
      let accessToken = await getAccessToken();
      let id = await getFileID(accessToken, fileName);
      let requestURL = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
      return await download(accessToken, requestURL);
    }

    this.getInfo = async (fileName) => {
      let accessToken = await getAccessToken();
      if (fileName === undefined) {
        let list = await getMetadata(accessToken, "");
        let result = {};
        list.files.forEach(file => {
          if (file.kind === "drive#file") {
            result[file.name] = file.id;
          }
        });
        return result;
      }
      else {
        return await getMetadata(accessToken, await getFileID(accessToken, fileName));
      }
    }
  }
}

class OneDriveStorage {
  constructor(client_id) {
    // PRIVATE PROPERTIES
    let scopes = ["Files.ReadWrite"];
    let auth_url =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    let validation_url = "https://graph.microsoft.com/v1.0/me/drive/";
    let token = "";
    let client;
    let init = initialize();

    // PRIVATE METHODS
    async function initialize() {
      token = await getAccessToken();
      client = MicrosoftGraph.Client.init({
        authProvider: (done) => {
          done(null, token); //first parameter takes an error if you can't get an access token
      }
      });
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
      if (response.status === 200) {
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

    async function getMetadata(id) {
      return await client.api(`me/drive/items/${id}`).get();
    }

    async function getID(fileName) {
      let idSearch = await client.api(`/me/drive/root/search(q='${fileName}')?select=id`).get();
        if (idSearch.value[0] !== undefined) {
          return idSearch.value[0].id;
        }
        else throw "No such file";
    }

    async function upload(file, name) {
      let response = await client.api(`/me/drive/root/children/${name}/content`).put(file);
      return response;
    };

    async function download(fileName) {
      let id = await getID(fileName);
      let fileInfo = await client.api(`/me/drive/items/${id}`).get();
      let response = await fetch(fileInfo["@microsoft.graph.downloadUrl"]);
      return await response.blob();
    };


    // PUBLIC METHODS
    this.uploadFile = async (file, name) => {
      await init;
      return await upload(file, name);
    }

    this.downloadFile = async (fileName) => {
      await init;
      return await download(fileName);
    }

    this.getInfo = async (fileName) => {
      await init;
      if (fileName === undefined) {
        let files = await client.api(`/me/drive/root/children`).get();
        let result = {};
        files.value.forEach(file => {
          if (file.folder === undefined) {
            result[file.name] = file.id;
          }
        });
        return result;
      }
      else {
        return await getMetadata(await getID(fileName));
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
