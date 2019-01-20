async function testStorage(hostElem, remoteStore) {
  while(hostElem.childElementCount > 1) {
    hostElem.removeChild(hostElem.lastChild);
  }
  hostElem.firstElementChild.textContent = "Running tests...";
  hostElem.firstElementChild.disabled = true;

  hostElem.appendChild(makeListElement(await testUpload(remoteStore)));
  hostElem.appendChild(makeListElement(await testDownload(remoteStore)));
  hostElem.appendChild(makeListElement(await testGetInfo(remoteStore)));
  hostElem.appendChild(makeListElement(await testDelete(remoteStore)));
  hostElem.appendChild(makeListElement(await testOverwrite(remoteStore)));
  hostElem.appendChild(makeListElement(await testLargeUpload(remoteStore)));
  hostElem.appendChild(makeListElement(await testLargeDownload(remoteStore)));
  await cleanupTests(remoteStore);

  hostElem.firstElementChild.textContent = "Test";
  hostElem.firstElementChild.disabled = false;
}

function makeListElement(text) {
  const listItem = document.createElement("li");
  listItem.textContent = text;
  return listItem;
}

async function testUpload(remoteStore) {
  try {
    await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
    return "Upload test passed";   
  } catch (error) {
    return "Upload test failed: " + error;
  }
}

async function testDownload(remoteStore) {
  try {
    await remoteStore.uploadFile("This is a download test", "downloadTest.txt");
  } catch (error) {
    return "Download test cannot proceed: Upload failed";
  }
  try {
    let result = await remoteStore.downloadFile("downloadTest.txt");
    if (await result.text() != "This is a download test") {
      return "Download test failed: Contents do not match";
    }
    return "Download test passed";
  } catch (error) {
    return "Download test failed: " + error;
  }
}

async function testGetInfo(remoteStore) {
  try {
    await remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt");  
    await remoteStore.uploadFile("This is getInfo test2", "infoTest2.txt"); 
  } catch (error) {
    return "GetInfo test cannot proceed: Upload failed";
  }
  try {
    let result = await remoteStore.getInfo("infoTest1.txt");
    if (result.name != "infoTest1.txt" || result.mimeType != "text/plain") {
      return "GetInfo test failed: Metadata incorrect";
    }
    result = await remoteStore.getInfo();
    if (result["infoTest1.txt"] === undefined
     || result["infoTest2.txt"] === undefined) {
      return "GetInfo test failed: File(s) not present in result";
    }
    if (result["infoTest2.txt"].name != "infoTest2.txt"
     || result["infoTest2.txt"].mimeType != "text/plain") {
      return "GetInfo test failed: Metadata incorrect";
    }
    return "GetInfo test passed"; 
  } catch (error) {
    return "GetInfo test failed: " + error;
  }
}

async function testDelete(remoteStore) {
  try {
    await remoteStore.uploadFile("This is a delete test", "deleteTest.txt"); 
  } catch (error) {
    return "Delete test cannot proceed: Upload failed";
  }
  try {
    await remoteStore.deleteFile("deleteTest.txt");
    return "Delete test passed";
  } catch (error) {
    return "Delete test failed: " + error;
  }
}

async function testOverwrite(remoteStore) {
  try {
    await remoteStore.uploadFile("This text should get overwritten", "overwriteTest.txt"); 
    await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
  } catch (error) {
    return "Overwrite test cannot proceed: Upload failed";
  }
  try {
    let result = await remoteStore.downloadFile("overwriteTest.txt");
    if (await result.text() != "This is an overwrite test") {
      return "Overwrite test failed: Contents not overwritten";
    }
    return "Overwrite test passed";
  } catch (error) {
    return "Overwrite test failed: " + error;
  }
}

async function testLargeUpload(remoteStore) {
  let file = await fetch("large_file.png");
  let fileBlob = await file.blob();
  try {
    await remoteStore.uploadFile(fileBlob, "largeUploadTest.png");
    return "Large upload test passed";  
  } catch (error) {
    return "Large upload test failed: " + error;
  }
}

async function testLargeDownload(remoteStore) {
  let file = await fetch("large_file.png");
  let fileBlob = await file.blob();
  try {
    await remoteStore.uploadFile(fileBlob, "largeDownloadTest.png");
  } catch (error) {
    return "Large download test cannot proceed: Upload failed";
  }
  try {
    let result = await remoteStore.downloadFile("largeDownloadTest.png");
    result = await result.blob();
    if (result.size !== fileBlob.size) {
      return "Large download test failed: Contents do not match";
    }
    return "Large download test passed";
  } catch (error) {
    return "Large download test failed: " + error;
  }
}

async function cleanupTests(remoteStore) {
  try {
    await remoteStore.deleteFile("uploadTest.txt");
    await remoteStore.deleteFile("downloadTest.txt");
    await remoteStore.deleteFile("infoTest1.txt");
    await remoteStore.deleteFile("infoTest2.txt");
    await remoteStore.deleteFile("overwriteTest.txt");
    await remoteStore.deleteFile("largeUploadTest.png");
    await remoteStore.deleteFile("largeDownloadTest.png");
  } catch (error) {
    console.log(error);
  }
}

async function makePopup() {
  let background = await browser.runtime.getBackgroundPage();
  const googleElem = document.getElementById("googleDrive");
  const googleTest = document.createElement("button");
  googleTest.textContent = "Test";
  googleTest.onclick = async () => { let googleStore = await background.getGoogleStore(); testStorage(googleElem, googleStore)};
  googleElem.appendChild(googleTest);

  const onedriveElem = document.getElementById("oneDrive");
  const onedriveTest = document.createElement("button");
  onedriveTest.textContent = "Test";
  onedriveTest.onclick = async () => { let onedriveStore = await background.getOneDriveStore(); testStorage(onedriveElem, onedriveStore)};
  onedriveElem.appendChild(onedriveTest);
}
makePopup();
