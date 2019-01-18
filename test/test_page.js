async function testStorage(hostElem, remoteStore) {
  testUpload(remoteStore);
  testDownload(remoteStore);
  testGetInfo(remoteStore);
}

async function testUpload(remoteStore) {
  try {
    let result = await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
    console.log(result);
    console.log("Upload test passed");   
  } catch (error) {
    console.log("Upload test failed: " + error);
  }
}

async function testDownload(remoteStore) {
  try {
    let result = await remoteStore.uploadFile("This is a download test", "downloadTest.txt");
    console.log(result);   
  } catch (error) {
    console.log("Download test cannot proceed: Upload failed");
  }
  try {
    let result = await remoteStore.downloadFile("downloadTest.txt");
    console.log(result);
    var reader = new FileReader();
    reader.addEventListener("loadend", function() {
      if (reader.result != "This is a download test") {
        console.log("Download test failed: Contents do not match");
      }
      else console.log("Download test passed");
    });
    reader.readAsText(result);
  } catch (error) {
    console.log("Download test failed: " + error);
  }
}

async function testGetInfo(remoteStore) {
  try {
    let result = await remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt");
    console.log(result);   
  } catch (error) {
    console.log("GetInfo test cannot proceed: Upload failed");
  }
  try {
    let result = await remoteStore.uploadFile("This is getInfo test2", "infoTest2.txt");
    console.log(result);   
  } catch (error) {
    console.log("GetInfo test cannot proceed: Upload failed");
  }
  try {
    let result = await remoteStore.getInfo();
    console.log(result);
  } catch (error) {

  }
}

async function makePopup() {
  let background = await browser.runtime.getBackgroundPage();
  const googleElem = document.getElementById("googleDrive");
  const googleSignIn = document.createElement("button");
  googleSignIn.textContent = "Test";
  googleSignIn.onclick = async () => { let googleStore = await background.getGoogleStore(); testStorage(googleElem, googleStore)};
  googleElem.appendChild(googleSignIn);

  const onedriveElem = document.getElementById("oneDrive");
  const onedriveSignIn = document.createElement("button");
  onedriveSignIn.textContent = "Test";
  onedriveSignIn.onclick = async () => { let onedriveStore = await background.getOneDriveStore(); testStorage(onedriveElem, onedriveStore)};
  onedriveElem.appendChild(onedriveSignIn);
}
makePopup();
