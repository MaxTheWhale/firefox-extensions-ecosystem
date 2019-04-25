import createRemoteStorage from './remoteStorage.js';

const secret = "qOtT31KwyCmjRsHleg3tRR5_";
const googleClientID = "330942350415-mc2p3pb057ckobr3smh1tekfrck9e7gr.apps.googleusercontent.com";
const onedriveClientID = "6d8bb06d-0a42-4777-bb22-7efc0fedc8f9";

async function testStorage(provider, clientID) {
    let remoteStore = await createRemoteStorage(provider, clientID); //Creating new storage.remote folder in drive
    let fold1 = "Folder1";
    let fold2 = "Folder2";
    await remoteStore.createFolder(fold1);
    await remoteStore.createFolder(fold2);
    let result = await remoteStore.getItems(true);
    await remoteStore.uploadFile("Test file", "test", result[fold1].id);
    await remoteStore.uploadFile("Test file", "test", result[fold2].id);
    await remoteStore.uploadFile("Test file1", "test", result[fold1].id);
    let resp = await remoteStore.downloadFile("test", result[fold1].id);
    let text = await new Response(resp).text();
    console.log(text);
    resp = await remoteStore.downloadFile("test", result[fold2].id);
    text = await new Response(resp).text();
    console.log(text);
    await remoteStore.deleteFile("test", result[fold1].id);
    await remoteStore.deleteFile("test", result[fold2].id);
    await remoteStore.deleteFile(fold1);
    await remoteStore.deleteFile(fold2);
}

let googleButton = document.getElementById("google_button");
googleButton.addEventListener("click", () => {testStorage("google", googleClientID)});

let onedriveButton = document.getElementById("onedrive_button");
onedriveButton.addEventListener("click", () => {testStorage("onedrive", onedriveClientID)});
