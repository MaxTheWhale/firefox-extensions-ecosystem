/* global createRemoteStorage */
/* exported getGoogleStore, getOneDriveStore*/

import createRemoteStorage from '../../src/remoteStorage.js'
const {fetchMock, MATCHED, UNMATCHED} = require('fetch-mock');
let googleStore;
let onedriveStore;

async function getGoogleStore() {
    if (googleStore === undefined) {
        fetchMock.get("https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=ABCdef123456789", 200);
        fetchMock.get("begin:https://www.googleapis.com/drive/v3/files?q=name=", { body: { files: [] }, status: 200 });
        fetchMock.get("https://www.googleapis.com/drive/v3/files/generateIds?count=1", { body: { ids: ["1234"] }, status: 200});
        fetchMock.post("https://www.googleapis.com/drive/v3/files/", 200);
        googleStore = await createRemoteStorage("Google", "myclientid");
        await googleStore.auth();
        fetchMock.reset();
    }
    return googleStore;
}

async function getOneDriveStore() {
    if (onedriveStore === undefined) {
        const VALIDATION_ONEDRIVE = "https://graph.microsoft.com/v1.0/me/drive/";
        fetchMock.get(VALIDATION_ONEDRIVE, 200);
        fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/root/children", 409);
        fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/root:/storage.remote:/children", 409);
        fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/root:/storage.remote/%7B1234-extensionid%7D", { body: { id: "1234" }, status: 200});
        onedriveStore = await createRemoteStorage("OneDrive", "myclientid");
        await onedriveStore.auth();
        fetchMock.reset();
    }
    return onedriveStore;
}

export {getGoogleStore, getOneDriveStore}