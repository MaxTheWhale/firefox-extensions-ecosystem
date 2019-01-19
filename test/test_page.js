async function testStorage(hostElem, remoteStore) {
  await testUpload(remoteStore);
  await testDownload(remoteStore);
  await testGetInfo(remoteStore);
  await testDelete(remoteStore);
  await testOverwrite(remoteStore);
  await testLargeUpload(remoteStore);
  await testLargeDownload(remoteStore);
  await cleanupTests(remoteStore);
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
    await remoteStore.uploadFile("This is a download test", "downloadTest.txt");
  } catch (error) {
    console.log("Download test cannot proceed: Upload failed");
    return;
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
    await remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt");  
  } catch (error) {
    console.log("GetInfo test cannot proceed: Upload failed");
    return;
  }
  try {
    await remoteStore.uploadFile("This is getInfo test2", "infoTest2.txt"); 
  } catch (error) {
    console.log("GetInfo test cannot proceed: Upload failed");
    return;
  }
  try {
    let result = await remoteStore.getInfo();
    console.log(result);
  } catch (error) {
  // TODO
  }
}

async function testDelete(remoteStore) {
  try {
    await remoteStore.uploadFile("This is a delete test", "deleteTest.txt"); 
  } catch (error) {
    console.log("Delete test cannot proceed: Upload failed");
    return;
  }
  try {
    let result = await remoteStore.deleteFile("deleteTest.txt");
    console.log(result);
    console.log("Delete test passed");
  } catch (error) {
    console.log("Delete test failed: " + error);
  }
}

async function testOverwrite(remoteStore) {
  try {
    await remoteStore.uploadFile("This text should get overwritten", "overwriteTest.txt"); 
  } catch (error) {
    console.log("Overwrite test cannot proceed: Upload failed");
    return;
  }
  try {
    await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
  } catch (error) {
    console.log("Overwrite test cannot proceed: Upload failed");
    return;
  }
  try {
    let result = await remoteStore.downloadFile("overwriteTest.txt");
    console.log(result);
    var reader = new FileReader();
    reader.addEventListener("loadend", function() {
      if (reader.result != "This is an overwrite test") {
        console.log("Overwrite test failed: Contents not overwritten");
      }
      else console.log("Overwrite test passed");
    });
    reader.readAsText(result);
  } catch (error) {
    console.log("Overwrite test failed: " + error);
  }
}

async function testLargeUpload(remoteStore) {
  let file = await fetch("large_file.png");
  let fileBlob = await file.blob();
  try {
    let result = await remoteStore.uploadFile(fileBlob, "largeUploadTest.png");
    console.log(result);
    console.log("Large upload test passed");   
  } catch (error) {
    console.log("Large upload test failed: " + error);
  }
}

async function testLargeDownload(remoteStore) {
  let file = await fetch("large_file.png");
  let fileBlob = await file.blob();
  try {
    let result = await remoteStore.uploadFile(fileBlob, "largeDownloadTest.png");
    console.log(result);
  } catch (error) {
    console.log("Large download test cannot proceed: Upload failed");
    return;
  }
  try {
    let result = await remoteStore.downloadFile("largeDownloadTest.png");
    console.log(result);
    if (result.size !== fileBlob.size) {
      console.log("Large download test failed: Contents do not match");
    }
    else console.log("Large download test passed");
  } catch (error) {
    console.log("Large download test failed: " + error);
  }
}

async function cleanupTests(remoteStore) {
  await remoteStore.deleteFile("uploadTest.txt");
  await remoteStore.deleteFile("downloadTest.txt");
  await remoteStore.deleteFile("infoTest1.txt");
  await remoteStore.deleteFile("infoTest2.txt");
  await remoteStore.deleteFile("overwriteTest.txt");
  await remoteStore.deleteFile("largeUploadTest.png");
  await remoteStore.deleteFile("largeDownloadTest.png");
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
