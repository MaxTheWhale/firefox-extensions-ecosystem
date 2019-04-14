import {getGoogleStore, getOneDriveStore} from './SpecHelper.js'
const {fetchMock, MATCHED, UNMATCHED} = require('fetch-mock');

describe("Google Drive", function() {
    var timeOut = 10000;
    var largeTimeOut = 20000;
    var remoteStore;
    var error;
    var result;
    var text;

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
            fetchMock.get("https://www.googleapis.com/drive/v3/files/", { body: { files: [{ id: "1235", name: "infoTest1.txt", mimeType: "text/plain", kind: "drive#file" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1235?fields=parents", { body: { parents: ["1234"] }, status: 200 });

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
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1235?fields=parents", { body: { parents: ["1234"] }, status: 200 });
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
            fetchMock.get("https://www.googleapis.com/drive/v3/files?q=name='子曰ٱلرَّحِيمِ.txt'&parents+in+'1234'", { body: { files: [] }, status: 200 });
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

describe("OneDrive", function() {
    var timeOut = 10000;
    var largeTimeOut = 20000;
    var remoteStore;
    var error;
    var result;
    var text;
    var folders;

    beforeAll(async function(done) {
        remoteStore = await getOneDriveStore();
        await remoteStore.auth();
        done();
    }, 600000);

    beforeEach(async function() {
        error = undefined;
    });

    afterEach(async function() {
        fetchMock.reset();
    });

    it("Should be able to complete an upload without error", async (done) => {
        try {
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234:/uploadTest.txt:/createUploadSession", { body: { uploadUrl: "https://uploadTest.txt" }, status: 200});
            fetchMock.put("https://uploadTest.txt/", 200);

            result = await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, timeOut);
    
    it("Should be able to complete a download without error", async (done) => {
        try {
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234:/downloadTest.txt", { body: { id: "1235" }, status: 200});
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1235", { body: { "@microsoft.graph.downloadUrl": "https://downloadTest.txt" }, status: 200});
            fetchMock.get("https://downloadTest.txt", { body: "This is a download test", status: 200 });

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234:/deleteTest.txt", { body: { id: "1235" }, status: 200});
            fetchMock.delete("https://graph.microsoft.com/v1.0/me/drive/items/1235", 201);
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/root:/storage.remote/%7B1234-extensionid%7D:/children", { body: { value: [] }, status: 200 });

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234:/infoTest1.txt", { body: { id: "1235" }, status: 200});
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1235", { body: { name:"infoTest1.txt", file: {mimeType:"text/plain"} }, status: 200 });

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/root:/storage.remote/%7B1234-extensionid%7D:/children", { body: { value: [{ name:"infoTest2.txt", file: {mimeType:"text/plain"} }] }, status: 200 });

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
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234:/overwriteTest.txt:/createUploadSession", { body: { uploadUrl: "https://overwriteTest.txt" }, status: 200});
            fetchMock.put("https://overwriteTest.txt/", 200);

            result = await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to create a folder", async (done) => {
        try {
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", 201);

            await remoteStore.createFolder("folderCreateTest");
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        done();
    }, timeOut);

    it("Should be able to list files", async (done) => {
        try {
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", { body: { value: [{ name:"listFileTest.txt", id: "1235", file: {mimeType:"text/plain"} }] }, status: 200 });

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", { body: { value: [{ name: "listFolderTest", id: "1235", folder: {} }] }, status: 200 });

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", { body: { value: [{ name: "folderUploadTest", id: "1235", folder: {} }] }, status: 200 });
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1235:/folderUploadTest.txt:/createUploadSession", { body: { uploadUrl: "https://folderUploadTest.txt" }, status: 200});
            fetchMock.put("https://folderUploadTest.txt/", 200);

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", { body: { value: [{ name: "folderDownloadTest", id: "1235", folder: {} }] }, status: 200 });
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1235:/folderDownloadTest.txt", { body: { id: "1236" }, status: 200});
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1236", { body: { "@microsoft.graph.downloadUrl": "https://folderDownloadTest.txt" }, status: 200});
            fetchMock.get("https://folderDownloadTest.txt", { body: "This is a folder download test", status: 200 });

            folders = await remoteStore.getItems(true);
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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", { body: { value: [{ name: "folderDeleteTest", id: "1235", folder: {} }] }, status: 200 });
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1235:/folderDeleteTest.txt", { body: { id: "1236" }, status: 200});
            fetchMock.delete("https://graph.microsoft.com/v1.0/me/drive/items/1236", 201);

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", { body: { value: [{ name: "subFolderListTest", id: "1235", folder: {} }] }, status: 200 });
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1235/children", { body: { value: [{ name: "subFolderListTest.txt", id: "1236", file: {mimeType:"text/plain"} }] }, status: 200 });

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

    it("Should support unicode filename upload", async (done) => {
        try {
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234:/子曰ٱلرَّحِيمِ.txt:/createUploadSession", { body: { uploadUrl: "https://unicodeTest.txt" }, status: 200});
            fetchMock.put("https://unicodeTest.txt/", 200);

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
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1234:/子曰ٱلرَّحِيمِ.txt", { body: { id: "1235" }, status: 200});
            fetchMock.get("https://graph.microsoft.com/v1.0/me/drive/items/1235", { body: { "@microsoft.graph.downloadUrl": "https://unicodeTest.txt" }, status: 200});
            fetchMock.get("https://unicodeTest.txt", { body: "This is a unicode name test", status: 200 });

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