import createRemoteStorage from './remoteStorage.js';

const secret = "qOtT31KwyCmjRsHleg3tRR5_";
const googleClientID = "330942350415-mc2p3pb057ckobr3smh1tekfrck9e7gr.apps.googleusercontent.com";
const onedriveClientID = "6d8bb06d-0a42-4777-bb22-7efc0fedc8f9";

async function testStorage(provider, clientID) {
    let remoteStore = await createRemoteStorage(provider, clientID); //Creating new storage.remote folder in drive
    try {
        await remoteStore.createFolder("Folder A");
        await remoteStore.createFolder("Folder B");
    } catch (error) {
    }
    let folders = await remoteStore.getItems(true);
    try {
        await remoteStore.createFolder("Folder C", folders["Folder A"].id);
    } catch (error) {
    }
    let foldersA = await remoteStore.getItems(true, folders["Folder A"].id);
    await remoteStore.uploadFile("Test file", "test1.txt");
    await remoteStore.uploadFile("Test file2", "test2.txt");
    await remoteStore.uploadFile("Test file3", "test3.txt", folders["Folder A"].id);
    await remoteStore.uploadFile("Test file4", "test4.txt", folders["Folder B"].id);
    await remoteStore.uploadFile("Test file4", "test5.txt", foldersA["Folder C"].id);
    await listStorage(remoteStore, document.getElementById(`${provider}_list`), 0);
}

async function listStorage(remoteStore, hostElem, depth, parentID) {
    hostElem.style.listStyleType = "none";
    let files;
    let folders;
    if (!parentID) {
        files = await remoteStore.getItems(false);
        folders = await remoteStore.getItems(true);
    }
    else {
        files = await remoteStore.getItems(false, parentID);
        folders = await remoteStore.getItems(true, parentID);
    }
    for (let folder in folders) {
        let folderElem = document.createElement("li");
        folderElem.textContent = folder;
        folderElem.style.textIndent = `${depth*2}em`;
        folderElem.style.fontWeight = "bold";
        folderElem.onclick = () => listStorage(remoteStore, folderElem, depth+1, folders[folder].id);
        hostElem.appendChild(folderElem);
    }
    for (let file in files) {
        let fileElem = document.createElement("li");
        fileElem.textContent = file;
        fileElem.style.textIndent = `${depth*2}em`;
        fileElem.style.fontWeight = "normal";
        hostElem.appendChild(fileElem);
    }
    if (depth > 0) hostElem.onclick = hideList;
    else hostElem.onclick = undefined;
}

function hideList(event) {
    event.stopPropagation();
    let elem = event.target;
    for (let i = 0; i < elem.childElementCount; i++) {
        elem.children[i].style.display = "none";
    }
    elem.onclick = showList;
}

function showList(event) {
    event.stopPropagation();
    let elem = event.target;
    for (let i = 0; i < elem.childElementCount; i++) {
        elem.children[i].style.display = "block";
    }
    elem.onclick = hideList;
}

let googleButton = document.getElementById("google_button");
googleButton.addEventListener("click", () => {testStorage("google", googleClientID)});

let onedriveButton = document.getElementById("onedrive_button");
onedriveButton.addEventListener("click", () => {testStorage("onedrive", onedriveClientID)});
