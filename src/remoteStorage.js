/* exported createRemoteStorage */

const getSize = function(content) {
    let className = content.constructor.name;
    if (className === "Blob" || className === "File") {
        return content.size;
    }
    if (className === "ArrayBuffer"
    || className === "Int8Array"
    || className === "Int16Array"
    || className === "Int32Array"
    || className === "Uint8Array"
    || className === "Uint16Array"
    || className === "Uint32Array"
    || className === "Uint8ClampedArray"
    || className === "Float32Array"
    || className === "Float64Array"
    || className === "DataView") {
        return content.byteLength;
    }
    if (typeof content === "string") {
        return content.length;
    }
    else {
        return JSON.stringify(content).length;
    }
};

const getMIME = function(content) {
    let request = new Request("", {
        method: "PUT",
        body: content
    });
    return request.headers.get("Content-Type");
};

class Folder {
    constructor(folderID, folderName, storageProvider) {
        this.id = folderID;
        this.name = folderName;
        this.store = storageProvider;
    }
}

class StoreFile {
    constructor(fileID, fileName, mimeType, storageProvider) {
        this.id = fileID;
        this.name = fileName;
        this.mimeType = mimeType;
        this.store = storageProvider;
    }
}

class GoogleStorage {
    constructor(client_id) {
    // PRIVATE PROPERTIES
        const REDIRECT_URL = browser.identity.getRedirectURL();
        let scopes = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.metadata.readonly", "https://www.googleapis.com/auth/drive.file"];
        let auth_url =
      `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(scopes.join(" "))}`;
        let validation_url = "https://www.googleapis.com/oauth2/v3/tokeninfo";
        let token = "";
        let expireTime;
        let appFolderID;
        let apiFolderID;

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
                requestHeaders.append("Authorization", "Bearer " + accessToken);
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
        }

        async function getFolderID(accessToken, name, parentID) {
            let requestURL = new URL(`https://www.googleapis.com/drive/v3/files?q=name='${name}'`);
            let requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + accessToken);
            if (parentID) requestURL += `&parents+in+'${parentID}'`;
            let driveRequest = new Request(requestURL, {
                method: "GET",
                headers: requestHeaders
            });
    
            let response = await fetch(driveRequest);
            if (response.ok) {
                let res = await response.json();
                if (res.files[0] !== undefined) {
                    return res.files[0].id;
                }
                else throw "No such file";
            }
            else {
                console.log("File search failed: " + response.status);
                throw response.status;
            }
        }

        function initFolder(accessToken, name, id, parentID, apiFolder) {
            return new Promise(function (resolve, reject) {
                let requestURL = "https://www.googleapis.com/drive/v3/files/";
                let request = {};
                let requestHeaders = new Headers();
                requestHeaders.append("Authorization", "Bearer " + accessToken);
                requestHeaders.append("Content-Type", "application/json");
                if (apiFolder) {
                    request = {
                        "kind": "drive#file",
                        "id": `${id}`,
                        "name": "storage.remote",
                        "mimeType": "application/vnd.google-apps.folder"
                    };
                } else {
                    request = {
                        "kind": "drive#file",
                        "id": `${id}`,
                        "name": `${name}`,
                        "mimeType": "application/vnd.google-apps.folder",
                        "parents": [`${parentID}`],
                        "appProperties": {
                            "remoteStorage": `${REDIRECT_URL}`
                        }
                    };
                }
                let driveRequest = new Request(requestURL, {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(request)
                });
    
                fetch(driveRequest).then((response) => {
                    if (response.ok) {
                        resolve(response);
                    } else {
                        console.log("Folder initialization failed: " + response.status);
                        reject(response.status);
                    }
                });
    
            });
        }
    
        function initUpload(accessToken, file, name, id, overwriting, parent) {
            return new Promise(function (resolve, reject) {
                let requestURL = "https://www.googleapis.com/upload/drive/v3/files/";
                let request = {};
                let requestHeaders = new Headers();
                requestHeaders.append("Authorization", "Bearer " + accessToken);
                requestHeaders.append("Content-Type", "application/json");
                if (overwriting) {
                    requestURL += `${id}?uploadType=resumable`;
                }
                else {
                    request = {
                        "id": `${id}`,
                        "name": `${name}`,
                        "parents": [`${parent}`],
                        "appProperties": {
                            "remoteStorage": `${REDIRECT_URL}`
                        }
                    };
                    requestURL += "?uploadType=resumable";
                }
                requestHeaders.append("X-Upload-Content-Type", getMIME(file));
                requestHeaders.append("X-Upload-Content-Length", getSize(file));
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
        }
    
        async function upload(accessToken, file, url) {
            let requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + accessToken);
            let driveRequest = new Request(url, {
                method: "PUT",
                headers: requestHeaders,
                body: file
            });
    
            let response = await fetch(driveRequest);
            if (response.ok) {
                return response.status;
            }
            else {
                console.log("Upload failed: " + response.status);
                throw response.status;
            }
        }

        async function getMetadata(accessToken, id, parentID) {
            let requestURL = `https://www.googleapis.com/drive/v3/files/${id}?fields=files(kind,id,mimeType,name)&q= '${parentID}' in parents and appProperties has {key='remoteStorage' and value='${REDIRECT_URL}'}`;
            let requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + accessToken);

            let driveRequest = new Request(requestURL, {
                method: "GET",
                headers: requestHeaders
            });
    
            let response = await fetch(driveRequest);
            if (response.ok) {
                return response.json();
            }
            else {
                console.log("Getting Metadata failed: " + response.status);
                throw response.status;
            }
        }

        async function download(accessToken, url) {
            let requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + accessToken);
            let driveRequest = new Request(url, {
                method: "GET",
                headers: requestHeaders
            });
    
            let response = await fetch(driveRequest);
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
            requestHeaders.append("Authorization", "Bearer " + accessToken);
            let driveRequest = new Request(url, {
                method: "DELETE",
                headers: requestHeaders
            });
    
            let response = await fetch(driveRequest);
            if (!response.ok) {
                console.log("Delete failed: " + response.status);
                throw response.status;
            }
            return response.status;
        }

        // PUBLIC METHODS
        this.auth = async () => {
            await checkToken(false);
        };

        this.initFolder = async () => { //New app flag indicates folder hasn't been created for app yet
            let apiFolderName = "storage.remote";
            await checkToken(false);
            let initFlag = false;
            try {
                apiFolderID = await getFolderID(token, apiFolderName);
            } catch (error) {
                apiFolderID = await getID(token);
                try {
                    await initFolder(token, apiFolderName, apiFolderID, "", true);
                } catch (error) {
                    throw error;
                }
            }
            try {
                appFolderID = await getFolderID(token, REDIRECT_URL, apiFolderID);
            } catch (error) {
                appFolderID = await getID(token);
                initFlag = true;
            }
            if (initFlag) {
                try {
                    await initFolder(token, REDIRECT_URL, appFolderID, apiFolderID, false);
                } catch (error) {
                    throw error;
                }
            }
        };

        this.uploadFile = async (file, fileName, parentID) => {
            await checkToken(false);
            if (!parentID) parentID = appFolderID;
            let id;
            let overwriting = true;
            let result = await this.getItems(false, parentID);
            if (result[fileName]) id = result[fileName].id;
            else {
                id = await getID(token);
                overwriting = false;
            }
            try {
                let response = await initUpload(token, file, fileName, id, overwriting, parentID);
                return await upload(token, file, response.headers.get("location"));
            } catch (error) {
                throw error;
            }
        };

        this.downloadFile = async (fileName, parentID) => {
            await checkToken(false);
            if (!parentID) parentID = appFolderID;
            let result = await this.getItems(false, parentID);
            if (result[fileName]) {
                let id = result[fileName].id;
                let requestURL = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
                return await download(token, requestURL);
            } else {
                throw "Download Failed: File not Found";
            }
        };

        this.deleteFile = async (fileName, parentID) => {
            await checkToken(false);
            if (!parentID) parentID = appFolderID;
            let result = await this.getItems(false, parentID);
            if (!result[fileName]) result = await this.getItems(true, parentID); //If no file with name, look for folder
            if (result[fileName]) {
                let id = result[fileName].id;
                let requestURL = `https://www.googleapis.com/drive/v3/files/${id}`;
                return await gdelete(token, requestURL);
            } else {
                throw "Delete Failed: File not Found";
            }
        };

        this.createFolder = async(folderName, parentID) => {
            await checkToken(false);
            if (!parentID) parentID = appFolderID;
            if (folderName === "") throw "Please provide a name for the folder";
            let folders = await this.getItems(true, parentID);
            if (folders[folderName] != null) throw `Provided name: ${folderName} already in use in this directory`;
            try {
                let id = await getID(token);
                await initFolder(token, folderName, id, parentID, false);
            } catch (error) {
                throw error;
            }
        };

        this.getItems = async(folderFlag, parentID) => {
            await checkToken(false);
            if (!parentID) parentID = appFolderID;  
            try {
                let list = await getMetadata(token, "", parentID);
                let items = [];
                let result = [];
                list.files.forEach(file => {
                    if (folderFlag) {
                        if (file.mimeType === "application/vnd.google-apps.folder") {
                            items[file.id] = file;
                        }
                    } else {
                        if (file.mimeType !== "application/vnd.google-apps.folder") {
                            items[file.id] = file;
                        }
                    }
                });
                for (let i in items) { //For all folders in folders
                    if (folderFlag) result[i] = new Folder(items[i].id, items[i].name, "google"); //Add i to result
                    else result[i] = new StoreFile(items[i].id, items[i].name, items[i].mimeType, "google");
                }
                let returns = []; //Flips list so folders are referred to by name instead of id
                for (let i in result) {
                    returns[result[i].name] = result[i];
                } 
                return returns;
            } catch (error) {
                throw error;
            }
        };

        this.getInfo = async (fileName, parentID) => {
            await checkToken(false);
            if (!parentID) parentID = appFolderID;
            try {   //Uses get items to return same type of object with file info
                let result = await this.getItems(false, parentID);
                if (fileName === undefined) return result;
                else return result[fileName];
            } catch (error) {
                throw error;
            }
        };
    }
}

class OneDriveStorage {
    constructor(client_id) {
    // PRIVATE PROPERTIES
        const REDIRECT_URL_MOZ = browser.identity.getRedirectURL().replace("extensions.allizom.org","extensions.mozilla.org");
        let scopes = ["Files.ReadWrite", "offline_access", "openid"];
        let auth_url =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL_MOZ)}&scope=${encodeURIComponent(scopes.join(" "))}`;
        let validation_url = "https://graph.microsoft.com/v1.0/me/drive/";
        let token = "";
        let expireTime;
        let appFolderID;

        // PRIVATE METHODS
        async function initialize() {
            token = await getAccessToken();
            await initFolder();
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
            requestHeaders.append("Authorization", "Bearer " + accessToken);
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

        async function initFolder() {
            const requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + token);
            requestHeaders.append("Content-Type", "application/json");
            let requestBody = {
                "name": "storage.remote",
                "folder": { },
                "@microsoft.graph.conflictBehavior": "fail"
            };
            let response = await fetch("https://graph.microsoft.com/v1.0/me/drive/root/children", {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                if (response.status !== 409) {
                    throw response.status;
                }
            }
            requestBody = {
                "name": `${browser.runtime.id}`,
                "folder": { },
                "@microsoft.graph.conflictBehavior": "fail"
            };
            response = await fetch("https://graph.microsoft.com/v1.0/me/drive/root:/storage.remote:/children", {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                if (response.status !== 409) {
                    throw response.status;
                }
            }

            const requestHeaders2 = new Headers();
            requestHeaders2.append("Authorization", "Bearer " + token);
            response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/storage.remote/${browser.runtime.id}`, {
                headers: requestHeaders2
            });
            if (response.ok) {
                let fileInfo = await response.json();
                if (fileInfo.id !== undefined) {
                    appFolderID = fileInfo.id;
                }
                else throw "Failed getting appFolder ID";
            }
            else {
                throw response.status;
            }
        }

        async function getMetadata(id) {
            const requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + token);
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

        async function getID(fileName, parentID) {
            const requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + token);
            let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${parentID}:/${fileName}`, {
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
                console.log("ID acquisition failed: " + response.status);
                throw response.status;
            }
        }

        async function upload(file, url) {
            try {
                const requestHeaders = new Headers();
                let size = getSize(file);
                requestHeaders.append("Content-Range", `bytes 0-${size-1}/${size}`);
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

        async function initUpload(name, parentID) {
            const requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + token);
            requestHeaders.append("Content-Type", "application/json");
            let requestBody = {
                "item": {
                    "name": `${name}`,
                    "@microsoft.graph.conflictBehavior": "replace",
                }
            };
            let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${parentID}:/${name}:/createUploadSession`, {
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
        }

        async function download(fileName, parentID) {
            try {
                const requestHeaders = new Headers();
                let id = await getID(fileName, parentID);
                requestHeaders.append("Authorization", "Bearer " + token);
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
        };

        this.uploadFile = async (file, name, parentID) => {
            await checkToken();
            if (!parentID) parentID = appFolderID;
            let response = await initUpload(name, parentID);
            return await upload(file, response.uploadUrl);
        };

        this.downloadFile = async (fileName, parentID) => {
            await checkToken();
            if (!parentID) parentID = appFolderID;
            return await download(fileName, parentID);
        };

        this.deleteFile = async (fileName, parentID) => {
            await checkToken();
            if (!parentID) parentID = appFolderID;
            try {
                let id = await getID(fileName, parentID);
                const requestHeaders = new Headers();
                requestHeaders.append("Authorization", "Bearer " + token);
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
        };

        this.createFolder = async(name, parentID) => {
            await checkToken(false);
            if (!parentID) parentID = appFolderID;
      
            const requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + token);
            requestHeaders.append("Content-Type", "application/json");
            let requestBody = {
                "name": `${name}`,
                "folder": { },
                "@microsoft.graph.conflictBehavior": "fail",
            };
            let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${parentID}/children`, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            });
            if (response.ok) {
                return response.status;
            }
            else {
                if (response.status === 409)
                    throw "Folder already exists";
                else
                    throw response.status;
            }
        };

        this.getItems = async (folderFlag, parentID) => {
            await checkToken();
            if (!parentID) parentID = appFolderID;

            const requestHeaders = new Headers();
            requestHeaders.append("Authorization", "Bearer " + token);
            let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${parentID}/children`, {
                headers: requestHeaders
            });
            if (!response.ok) {
                throw response.status;
            }
            let items = await response.json();
            let result = {};
            items.value.forEach(item => {
                if (folderFlag) {
                    if (item.folder !== undefined) {
                        result[item.name] = new Folder(item.id, item.name, "onedrive");
                    }
                }
                else {
                    if (item.folder === undefined) {
                        result[item.name] = new StoreFile(item.id, item.name, item.file.mimeType, "onedrive");
                    }
                }
            });
            return result;
        };

        this.getInfo = async (fileName, parentID) => {
            await checkToken();
            if (!parentID) parentID = appFolderID;
            if (fileName === undefined) {
                const requestHeaders = new Headers();
                requestHeaders.append("Authorization", "Bearer " + token);
                let response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/storage.remote/${browser.runtime.id}:/children`, {
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
                let info = await getMetadata(await getID(fileName, parentID));
                info.mimeType = info.file.mimeType;
                return info;
            }
        };
    }
}

class MockStorage {
    constructor() {
        // PRIVATE PROPERTIES
        let folderIDs = new Map();
        let folderContents = new Map();
        folderIDs.set("", "");
        let root = new Map();
        folderContents.set("", root);
        // PRIVATE METHODS
        function newID() {
            return "_" + Math.random().toString(36).substr(2, 9);
        }

        // PUBLIC METHODS
        this.auth = async () => {
        };

        this.uploadFile = async (file, name, parentID) => {
            if (!parentID) parentID = "";
            if (folderContents.has(parentID)) {
                let folder = folderContents.get(parentID);
                folder.set(name, file);
                folderContents.set(parentID, folder);

            }
            else throw "No such folder";
            return 200;
        };

        this.downloadFile = async (fileName, parentID) => {
            if (!parentID) parentID = "";
            if (folderContents.has(parentID)) {
                let folder = folderContents.get(parentID);
                if (folder.has(fileName)) {
                    return folder.get(fileName);
                }
                else throw "No such file";
            }
            else throw "No such folder";
        };

        this.deleteFile = async (fileName, parentID) => {
            if (!parentID) parentID = "";
            if (folderContents.has(parentID)) {
                let folder = folderContents.get(parentID);
                if (folder.has(fileName)) {
                    folder.delete(fileName);
                }
                else throw "No such file";
            }
            else throw "No such folder";
            return 200;
        };

        this.createFolder = async(name, parentID) => {
            let fullName;
            if (!parentID) parentID = "";
            if (folderContents.has(parentID)) {
                fullName = `${parentID}/${name}`;
                if (!folderIDs.has(fullName)) {
                    let id = newID();
                    folderIDs.set(fullName, id);
                    let contents = new Map();
                    folderContents.set(id, contents);
                    let parentFolder = folderContents.get(parentID);
                    let folder = new Folder(id, name, "mock");
                    parentFolder.set(name, folder);
                    folderContents.set(parentID, parentFolder);
                }
                else throw "Folder already exists";
            }
            else throw "No such folder";
            return 200;
        };

        this.getItems = async (folderFlag, parentID) => {
            if (!parentID) parentID = "";
            if (folderContents.has(parentID)) {
                let result = {};
                for (let [key, value] of folderContents.get(parentID).entries()) {
                    if (value.constructor.name == "Folder") {
                        if (folderFlag) {
                            result[value.name] = value;
                        }
                    }
                    else {
                        if (!folderFlag) {
                            let file = new StoreFile("", key, getMIME(value), "mock");
                            result[file.name] = file;
                        }
                    }
                }
                return result;
            }
            else throw "No such folder";
        };

        this.getInfo = async (fileName, parentID) => {
            let items = await this.getItems(false, parentID);
            if (fileName) {
                if (items[fileName]) {
                    return items[fileName];
                }
                else throw "No such file";
            }
            return items;
        };
    }
}

async function createRemoteStorage(storageProvider, client_id) { //Need to specify in documentation, will give directory
    if (storageProvider.toLowerCase() === "google") {
        let googleStorage = new GoogleStorage(client_id);
        await googleStorage.initFolder();
        return googleStorage;
    }
    else if (storageProvider.toLowerCase() === "onedrive") {
        let onedriveStorage = new OneDriveStorage(client_id);
        return onedriveStorage;
    }
    else if (storageProvider.toLowerCase() === "mock") {
        let mockStorage = new MockStorage(client_id);
        return mockStorage;
    }
    else {
        throw "No such storage provider";
    }
}

export default createRemoteStorage;