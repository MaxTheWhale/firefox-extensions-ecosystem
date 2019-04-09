import {getGoogleStore, getOneDriveStore} from './SpecHelper.js'
const {fetchMock, MATCHED, UNMATCHED} = require('fetch-mock');

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

    afterEach(async function() {
        fetchMock.reset();
    });

    it("Should be able to complete an upload without error", async (done) => {    //Fails when error is thrown
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='uploadTest.txt'&parents+in+'1234'", { body: { files: [] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/generateIds?count=1", { body: { ids: ["1235"] }, status: 200});
            fetchMock.post("https://www.googleapis.com/upload/drive/v3/files/?uploadType=resumable", { headers: { location: "https://uploadTest.txt" }, status: 200});
            fetchMock.put("https://uploadTest.txt", 200);

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
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='downloadTest.txt'&parents+in+'1234'", { body: { files: [{ id: "1235" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1235?alt=media", { body: "This is a download test", status: 200 });

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
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='deleteTest.txt'&parents+in+'1234'", { body: { files: [{ id: "1235" }] }, status: 200 });
            fetchMock.delete("https://www.googleapis.com/drive/v3/files/1235", 201);
            fetchMock.get("https://www.googleapis.com/drive/v3/files/", { body: { files: [] }, status: 200 });

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
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='infoTest1.txt'&parents+in+'1234'", { body: { files: [{ id: "1235" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1235", { body: { id: "1235", name: "infoTest1.txt", mimeType: "text/plain" }, status: 200 });

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
            fetchMock.get("https://www.googleapis.com/drive/v3/files/", { body: { files: [{ id: "1235", name: "infoTest2.txt", mimeType: "text/plain", kind: "drive#file" }] }, status: 200 });

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
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='overwriteTest.txt'&parents+in+'1234'", { body: { files: [{ id: "1235" }] }, status: 200 });
            fetchMock.patch("https://www.googleapis.com/upload/drive/v3/files/1235?uploadType=resumable", { headers: { location: "https://overwriteTest.txt" }, status: 200});
            fetchMock.put("https://overwriteTest.txt", 200);

            result = await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should support unicode filename upload", async (done) => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='uploadTest.txt'&parents+in+'1234'", { body: { files: [] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/generateIds?count=1", { body: { ids: ["1235"] }, status: 200});
            fetchMock.post("https://www.googleapis.com/upload/drive/v3/files/?uploadType=resumable", { headers: { location: "https://unicodeTest.txt" }, status: 200});
            fetchMock.put("https://unicodeTest.txt", 200);

            result = await remoteStore.uploadFile("This is a unicode name test", "子曰ٱلرَّحِيمِ.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should support unicode filename download", async (done) => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='子曰ٱلرَّحِيمِ.txt'&parents+in+'1234'", { body: { files: [{ id: "1235" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1235?alt=media", { body: "This is a unicode name test", status: 200 });

            result = await remoteStore.downloadFile("子曰ٱلرَّحِيمِ.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toBeDefined();
        expect(text).toMatch("This is a unicode name test");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

});

xdescribe("OneDrive", function() {
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

    xit("Should be able to upload a large file", async (done) => {
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

    xit("Should be able to download a large file", async (done) => {
        try {
            file = await fetch("large_file.png");
            fileBlob = await file.blob();
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
            folders = await remoteStore.getItems(true);
            await remoteStore.deleteFile("folderDeleteTest.txt", folders["folderDeleteTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to list from a folder", async (done) => {
        try {
            folders = await remoteStore.getItems(true);
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

    it("Should support unicode filenames", async (done) => {
        try {
            await remoteStore.uploadFile("This is a unicode name test", "子曰ٱلرَّحِيمِ.txt");
            result = await remoteStore.downloadFile("子曰ٱلرَّحِيمِ.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toBeDefined();
        expect(text).toMatch("This is a unicode name test");
        expect(error).not.toBeDefined();
        done();
    }, timeOut);
});