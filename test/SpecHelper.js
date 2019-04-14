import createRemoteStorage from "./remoteStorage.js";
let googleStore;
let onedriveStore;

async function getGoogleStore() {
    if (googleStore === undefined) {
        googleStore = await createRemoteStorage("Google", "887401722713-n61d7cl8o92cjol2sid7q31t9gs28uqs.apps.googleusercontent.com");
    }
    return googleStore;
}

async function getOneDriveStore() {
    if (onedriveStore === undefined) {
        onedriveStore = await createRemoteStorage("OneDrive", "1fe91dbd-fcd7-4f15-9674-1ae6d9e28ba1");
    }
    return onedriveStore;
}

export {getGoogleStore, getOneDriveStore};