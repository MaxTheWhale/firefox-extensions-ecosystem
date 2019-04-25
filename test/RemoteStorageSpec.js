import {getGoogleStore, getOneDriveStore} from "./SpecHelper.js";

describe("Google Drive", () => {
    let timeOut = 30000;
    let largeTimeOut = 40000;
    let remoteStore;
    let error;
    let result;
    let text;
    let file;
    let fileBlob;
    let folders;

    beforeAll(async () => {
        remoteStore = await getGoogleStore();
        await remoteStore.auth();
    }, 600000);

    beforeEach(async () => {
        error = undefined;
    });

    afterAll(async () => {
        const fileList = ["uploadTest.txt", 
        "downloadTest.txt", 
        "infoTest1.txt", 
        "infoTest2.txt", 
        "overwriteTest.txt", 
        "largeUploadTest.png", 
        "largeDownloadTest.png", 
        "子曰ٱلرَّحِيمِ.txt", 
        "folderCreateTest", 
        "listFileTest.txt", 
        "listFolderTest", 
        "folderUploadTest", 
        "folderDownloadTest", 
        "folderDeleteTest", 
        "subFolderListTest"];
        for (let i in fileList) {
            try {
                await remoteStore.deleteFile(fileList[i]);
            } catch (e) {
                error = e;
            }
        }
    }, largeTimeOut);

    it("Should be able to complete an upload without error", async () => {
        try {
            result = await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
        } catch (e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    }, timeOut);
    
    it("Should be able to complete a download without error", async () => {
        try {
            await remoteStore.uploadFile("This is a download test", "downloadTest.txt");
            result = await remoteStore.downloadFile("downloadTest.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toMatch("This is a download test");
        expect(error).not.toBeDefined();
    }, largeTimeOut);

    it("Should be able to delete a file without error", async () => {
        try {
            await remoteStore.uploadFile("This is a delete test", "deleteTest.txt");
            await remoteStore.deleteFile("deleteTest.txt");
            result = await remoteStore.getInfo();
        } catch(e) {
            error = e;
        }
        expect(result["deleteTest.txt"]).not.toBeDefined();
        expect(error).not.toBeDefined();
    }, timeOut);

    it("Should be able to get correct file's info", async () => {
        try {
            await remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt");
            result = await remoteStore.getInfo("infoTest1.txt");
        } catch(e) {
            error = e;
        }
        expect(result.name).toMatch("infoTest1.txt");
        expect(result.mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
    }, timeOut);

    it ("Should be able to get all files info", async () => {
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
    }, timeOut);

    it("Should be able to overwrite a file", async () => {
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
    }, timeOut);

    it("Should be able to upload a large file", async () => {
        try {
            file = await fetch("large_file.png");
            fileBlob = await file.blob();
            result = await remoteStore.uploadFile(fileBlob, "largeUploadTest.png");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    }, largeTimeOut);

    it("Should be able to download a large file", async () => {
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
    }, largeTimeOut);

    it("Should be able to create a folder", async () => {
        try {
            await remoteStore.createFolder("folderCreateTest");
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    }, timeOut);

    it("Should be able to list files", async () => {
        try {
            await remoteStore.uploadFile("This is a list file test", "listFileTest.txt");
            result = await remoteStore.getItems(false);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(result["listFileTest.txt"].id).toBeDefined();
        expect(result["listFileTest.txt"].name).toEqual("listFileTest.txt");
        expect(result["listFileTest.txt"].store).toEqual("google");
    }, timeOut);
    
    it("Should be able to list folders", async () => {
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
        expect(result["listFolderTest"].store).toEqual("google");
    }, timeOut);

    it("Should be able to upload in a folder", async () => {
        try {
            await remoteStore.createFolder("folderUploadTest");
            result = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder upload test", "folderUploadTest.txt", result["folderUploadTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    }, timeOut);

    it("Should be able to download from a folder", async () => {
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
    }, timeOut);

    it("Should be able to delete from a folder", async () => {
        try {
            await remoteStore.createFolder("folderDeleteTest");
            folders = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder delete test", "folderDeleteTest.txt", folders["folderDeleteTest"].id);
            await remoteStore.deleteFile("folderDeleteTest.txt", folders["folderDeleteTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    }, timeOut);

    it("Should be able to list from a folder", async () => {
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
        expect(result["subFolderListTest.txt"].store).toEqual("google");
    }, timeOut);

    it("Should support unicode filenames", async () => {
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
    }, timeOut);

});

describe("OneDrive", () => {
    let timeOut = 10000;
    let largeTimeOut = 20000;
    let remoteStore;
    let error;
    let result;
    let text;
    let file;
    let fileBlob;
    let folders;

    beforeAll(async () => {
        remoteStore = await getOneDriveStore();
        await remoteStore.auth();
    }, 600000);

    beforeEach(async () => {
        error = undefined;
    });
    
    afterAll(async () => {
        const fileList = ["uploadTest.txt", "downloadTest.txt", "infoTest1.txt", "infoTest2.txt", "overwriteTest.txt", "largeUploadTest.png", "largeDownloadTest.png", "子曰ٱلرَّحِيمِ.txt", "folderCreateTest", "listFileTest.txt", "listFolderTest", "folderUploadTest", "folderDownloadTest", "folderDeleteTest", "subFolderListTest"];
        for (let i in fileList) {
            try {
                await remoteStore.deleteFile(fileList[i]);
            } catch (e) {
                error = e;
            }
        }
    }, 60000);

    it("Should be able to complete an upload without error", async () => {
        try {
            result = await remoteStore.uploadFile("This is and upload test.", "uploadTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    }, timeOut);
    
    it("Should be able to complete a download without error", async () => {
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
    }, timeOut);

    it("Should be able to delete a file without error", async () => {
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
    }, timeOut);

    it("Should be able to get correct file's info", async () => {
        try {
            await remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt");
            result = await remoteStore.getInfo("infoTest1.txt");
        } catch(e) {
            error = e;
        }
        expect(result.name).toMatch("infoTest1.txt");
        expect(result.mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
    }, timeOut);

    it ("Should be able to get all files info", async () => {
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
    }, timeOut);

    it("Should be able to overwrite a file", async () => {
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
    }, timeOut);

    it("Should be able to upload a large file", async () => {
        try {
            file = await fetch("large_file.png");
            fileBlob = await file.blob();
            result = await remoteStore.uploadFile(fileBlob, "largeUploadTest.png");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    }, largeTimeOut);

    it("Should be able to download a large file", async () => {
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
    }, largeTimeOut);

    it("Should be able to create a folder", async () => {
        try {
            await remoteStore.createFolder("folderCreateTest");
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    }, timeOut);

    it("Should be able to list files", async () => {
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
    }, timeOut);
    
    it("Should be able to list folders", async () => {
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
    }, timeOut);

    it("Should be able to upload in a folder", async () => {
        try {
            await remoteStore.createFolder("folderUploadTest");
            result = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder upload test", "folderUploadTest.txt", result["folderUploadTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    }, timeOut);

    it("Should be able to download from a folder", async () => {
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
    }, timeOut);

    it("Should be able to delete from a folder", async () => {
        try {
            await remoteStore.createFolder("folderDeleteTest");
            folders = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder delete test", "folderDeleteTest.txt", folders["folderDeleteTest"].id);
            await remoteStore.deleteFile("folderDeleteTest.txt", folders["folderDeleteTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    }, timeOut);

    it("Should be able to list from a folder", async () => {
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
    }, timeOut);

    it("Should support unicode filenames", async () => {
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
    }, timeOut);
});