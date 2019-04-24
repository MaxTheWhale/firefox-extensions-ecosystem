import createRemoteStorage from './remoteStorage.js';

const secret = "qOtT31KwyCmjRsHleg3tRR5_";
const googleClientID = "330942350415-mc2p3pb057ckobr3smh1tekfrck9e7gr.apps.googleusercontent.com";

async function useGoogle() {
    let googleDrive = await createRemoteStorage("google", googleClientID); //Creating new storage.remote folder in drive
    await googleDrive.uploadFile("Test file", "test");
    let result = await googleDrive.downloadFile("test");
    let text = await new Response(result).text();
    console.log(text);
}

// console.log(browser.identity.getRedirectURL());
let googleButton = document.getElementById("google_button");
googleButton.addEventListener("click", useGoogle);
