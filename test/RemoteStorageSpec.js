/* global getGoogleStore, getOneDriveStore */
describe("Google Drive", function() {
    var timeOut = 10000;
    var largeTimeOut = 20000;
    var remoteStore;
    var error;
    var result;
    var text;
    var file;
    var fileBlob;

    beforeAll(async function(done) {
        remoteStore = await getGoogleStore();
        await remoteStore.auth();
        done();
    }, 600000);

    beforeEach(async function() {
        error = undefined;
    });

    afterAll(async function(done) {
        try {
            await remoteStore.deleteFile("uploadTest.txt");
            await remoteStore.deleteFile("downloadTest.txt");
            await remoteStore.deleteFile("infoTest1.txt");
            await remoteStore.deleteFile("infoTest2.txt");
            await remoteStore.deleteFile("overwriteTest.txt");
            await remoteStore.deleteFile("largeUploadTest.png");
            await remoteStore.deleteFile("largeDownloadTest.png");
        } catch (e) {
            error = e;
        }
        done();
    }, largeTimeOut);

    it("Should be able to complete an upload without error", async (done) => {    //Fails when error is thrown
        try {
            result = await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
        } catch (e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, timeOut);
    
    it("Should be able to complete a download without error", async (done) => {
        try {
            await remoteStore.uploadFile("This is a download test", "downloadTest.txt");
            result = await remoteStore.downloadFile("downloadTest.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toMatch("This is a download test");
        expect(error).not.toBeDefined();
        done();
    }, largeTimeOut);

    it("Should be able to delete a file without error", async (done) => {
        try {
            await remoteStore.uploadFile("This is a delete test", "deleteTest.txt");
            await remoteStore.deleteFile("deleteTest.txt");
            result = await remoteStore.getInfo();
        } catch(e) {
            error = e;
        }
        expect(result["deleteTest.txt"]).not.toBeDefined();
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to get correct file's info", async (done) => {
        try {
            await remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt");
            result = await remoteStore.getInfo("infoTest1.txt");
        } catch(e) {
            error = e;
        }
        expect(result.name).toMatch("infoTest1.txt");
        expect(result.mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it ("Should be able to get all files info", async (done) => {
        try {
            await remoteStore.uploadFile("This is getInfo test2", "infoTest2.txt");
            result = await remoteStore.getInfo();
        } catch(e) {
            error = e;
        }
        expect(result["infoTest2.txt"]).toBeDefined();
        expect(result["infoTest2.txt"].name).toMatch("infoTest2.txt");
        expect(result["infoTest2.txt"].mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
        done(); 
    }, timeOut);

    it("Should be able to overwrite a file", async (done) => {
        try {
            await remoteStore.uploadFile("This text should get overwritten", "overwriteTest.txt");
            await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
            result = await remoteStore.downloadFile("overwriteTest.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toMatch("This is an overwrite test");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to upload a large file", async (done) => {
        try {
            file = await fetch("large_file.png");
            fileBlob = await file.blob();
            result = await remoteStore.uploadFile(fileBlob, "largeUploadTest.png");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, largeTimeOut);

    it("Should be able to download a large file", async (done) => {
        try {
            file = await fetch("large_file.png");
            fileBlob = await file.blob();
            await remoteStore.uploadFile(fileBlob, "largeDownloadTest.png");
            result = await remoteStore.downloadFile("largeDownloadTest.png");
        } catch(e) {
            error = e;
        }
        expect(result.size).toEqual(fileBlob.size);
        expect(error).not.toBeDefined();
        done();
    }, largeTimeOut);

});

describe("OneDrive", function() {
    var timeOut = 10000;
    var largeTimeOut = 20000;
    var remoteStore;
    var error;
    var result;
    var text;
    var file;
    var fileBlob;
    var folders;

    beforeAll(async function(done) {
        remoteStore = await getOneDriveStore();
        await remoteStore.auth();
        done();
    }, 600000);

    beforeEach(async function() {
        error = undefined;
    });
    
    afterAll(async function() {
        try {
            await remoteStore.deleteFile("uploadTest.txt");
            await remoteStore.deleteFile("downloadTest.txt");
            await remoteStore.deleteFile("infoTest1.txt");
            await remoteStore.deleteFile("infoTest2.txt");
            await remoteStore.deleteFile("overwriteTest.txt");
            await remoteStore.deleteFile("largeUploadTest.png");
            await remoteStore.deleteFile("largeDownloadTest.png");
            await remoteStore.deleteFile("folderCreateTest");
            await remoteStore.deleteFile("listFileTest.txt");
            await remoteStore.deleteFile("listFolderTest");
            await remoteStore.deleteFile("folderUploadTest");
            await remoteStore.deleteFile("folderDownloadTest");
            await remoteStore.deleteFile("folderDeleteTest");
            await remoteStore.deleteFile("subFolderListTest");
        } catch (e) {
            error = e;
        }
    }, largeTimeOut);

    it("Should be able to complete an upload without error", async (done) => {
        try {
            result = await remoteStore.uploadFile("This is and upload test.", "uploadTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, timeOut); //Setting custom timeout to deal with handling stuff over internet
    
    it("Should be able to complete a download without error", async (done) => {
        try {
            await remoteStore.uploadFile("This is a download test", "downloadTest.txt");
            result = await remoteStore.downloadFile("downloadTest.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toBeDefined();
        expect(text).toMatch("This is a download test");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to delete a file without error", async (done) => {
        try {
            await remoteStore.uploadFile("This is a delete test", "deleteTest.txt");
            await remoteStore.deleteFile("deleteTest.txt");
            result = await remoteStore.getInfo();
        } catch(e) {
            error = e;
        }
        expect(result).toBeDefined();
        expect(result["deleteTest.txt"]).not.toBeDefined();
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to get correct file's info", async (done) => {
        try {
            await remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt");
            result = await remoteStore.getInfo("infoTest1.txt");
        } catch(e) {
            error = e;
        }
        expect(result.name).toMatch("infoTest1.txt");
        expect(result.mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it ("Should be able to get all files info", async (done) => {
        try {
            await remoteStore.uploadFile("This is getInfo test2", "infoTest2.txt");
            result = await remoteStore.getInfo();
        } catch(e) {
            error = e;
        }
        expect(result).toBeDefined();
        expect(result["infoTest2.txt"]).toBeDefined();
        expect(result["infoTest2.txt"].name).toMatch("infoTest2.txt");
        expect(result["infoTest2.txt"].mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to overwrite a file", async (done) => {
        try {
            await remoteStore.uploadFile("This text should get overwritten", "overwriteTest.txt");
            await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
            await remoteStore.downloadFile("overwriteTest.txt");
            result = await remoteStore.downloadFile("overwriteTest.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toMatch("This is an overwrite test");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to upload a large file", async (done) => {
        try {
            file = await fetch("large_file.png");
            fileBlob = await file.blob();
            result = await remoteStore.uploadFile(fileBlob, "largeUploadTest.png");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, largeTimeOut);

    it("Should be able to download a large file", async (done) => {
        try {
            file = await fetch("large_file.png");
            fileBlob = await file.blob();
            await remoteStore.uploadFile(fileBlob, "largeDownloadTest.png");
            result = await remoteStore.downloadFile("largeDownloadTest.png");
        } catch(e) {
            error = e;
        }
        expect(result).toBeDefined();
        expect(result.size).toEqual(fileBlob.size);
        expect(error).not.toBeDefined();
        done();
    }, largeTimeOut);

    it("Should be able to create a folder", async (done) => {
        try {
            await remoteStore.createFolder("folderCreateTest");
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to list files", async (done) => {
        try {
            await remoteStore.uploadFile("This is a list file test", "listFileTest.txt");
            result = await remoteStore.getItems(false);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(result["listFileTest.txt"].id).toBeDefined();
        expect(result["listFileTest.txt"].name).toEqual("listFileTest.txt");
        expect(result["listFileTest.txt"].store).toEqual("onedrive");
        done();
    }, timeOut);
    
    it("Should be able to list folders", async (done) => {
        try {
            await remoteStore.createFolder("listFolderTest");
            result = await remoteStore.getItems(true);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(result["listFolderTest"]).toBeDefined();
        expect(result["listFolderTest"].id).toBeDefined();
        expect(result["listFolderTest"].name).toEqual("listFolderTest");
        expect(result["listFolderTest"].store).toEqual("onedrive");
        done();
    }, timeOut);

    it("Should be able to upload in a folder", async (done) => {
        try {
            await remoteStore.createFolder("folderUploadTest");
            result = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder upload test", "folderUploadTest.txt", result["folderUploadTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to download from a folder", async (done) => {
        try {
            await remoteStore.createFolder("folderDownloadTest");
            folders = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder download test", "folderDownloadTest.txt", folders["folderDownloadTest"].id);
            result = await remoteStore.downloadFile("folderDownloadTest.txt", folders["folderDownloadTest"].id);
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(text).toBeDefined();
        expect(text).toMatch("This is a folder download test");
        done();
    }, timeOut);

    it("Should be able to delete from a folder", async (done) => {
        try {
            await remoteStore.createFolder("folderDeleteTest");
            folders = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder delete test", "folderDeleteTest.txt", folders["folderDeleteTest"].id);
            await remoteStore.deleteFile("folderDeleteTest.txt", folders["folderDeleteTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to list from a folder", async (done) => {
        try {
            await remoteStore.createFolder("subFolderListTest");
            folders = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a sub folder list test", "subFolderListTest.txt", folders["subFolderListTest"].id);
            result = await remoteStore.getItems(false, folders["subFolderListTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(result["subFolderListTest.txt"]).toBeDefined();
        expect(result["subFolderListTest.txt"]).toBeDefined();
        expect(result["subFolderListTest.txt"].id).toBeDefined();
        expect(result["subFolderListTest.txt"].name).toEqual("subFolderListTest.txt");
        expect(result["subFolderListTest.txt"].store).toEqual("onedrive");
        done();
    }, timeOut);
});