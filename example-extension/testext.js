import createRemoteStorage from './remoteStorage.js';

const secret = "qOtT31KwyCmjRsHleg3tRR5_";
const googleClientID = "330942350415-mc2p3pb057ckobr3smh1tekfrck9e7gr.apps.googleusercontent.com";

async function useGoogle() {
    let googleDrive = await createRemoteStorage("google", googleClientID); //Creating new storage.remote folder in drive
    let fold1 = "Folder1";
    let fold2 = "Folder2";
    await googleDrive.createFolder(fold1);
    await googleDrive.createFolder(fold2);
    let result = await googleDrive.getItems(true);
    await googleDrive.uploadFile("Test file", "test", result[fold1].id);
    await googleDrive.uploadFile("Test file", "test", result[fold2].id);
    await googleDrive.uploadFile("Test file1", "test", result[fold1].id);
    let resp = await googleDrive.downloadFile("test", result[fold1].id);
    let text = await new Response(resp).text();
    console.log(text);
    resp = await googleDrive.downloadFile("test", result[fold2].id);
    text = await new Response(resp).text();
    console.log(text);
    await googleDrive.deleteFile("test", result[fold1].id);
    await googleDrive.deleteFile("test", result[fold2].id);
    await googleDrive.deleteFile(fold1);
    await googleDrive.deleteFile(fold2);
}

let googleButton = document.getElementById("google_button");
googleButton.addEventListener("click", useGoogle);
