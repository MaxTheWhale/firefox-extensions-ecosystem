import {getGoogleStore, getOneDriveStore, getMockStore} from "./SpecHelper.js";
import { EROFS } from "constants";
const fetchMock = require("fetch-mock");
fetchMock.config.overwriteRoutes = true;

describe("Google Drive", () => {
    let remoteStore;
    let error;
    let result;
    let text;
    let folders;

    beforeAll(async () => {
        remoteStore = await getGoogleStore();
        await remoteStore.auth();
    });

    beforeEach(async () => {
        error = undefined;
    });

    afterEach(async () => {
        fetchMock.reset();
    });

    it("Should be able to complete an upload without error", async () => {    //Fails when error is thrown
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/generateIds?count=1", { body: { ids: ["1235"] }, status: 200});
            fetchMock.post("https://www.googleapis.com/upload/drive/v3/files/?uploadType=resumable", { headers: { location: "https://uploadTest.txt" }, status: 200});
            fetchMock.put("https://uploadTest.txt", 200);

            result = await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
        } catch (e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    });
    
    it("Should be able to complete a download without error", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "downloadTest.txt", id: "1235" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1235?alt=media", { body: "This is a download test", status: 200 });

            result = await remoteStore.downloadFile("downloadTest.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toMatch("This is a download test");
        expect(error).not.toBeDefined();
    });

    it("Should be able to delete a file without error", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "deleteTest.txt", id: "1235" }] }, status: 200 });
            fetchMock.delete("https://www.googleapis.com/drive/v3/files/1235", 201);

            await remoteStore.deleteFile("deleteTest.txt");
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [] }, status: 200 });

            result = await remoteStore.getInfo();
        } catch(e) {
            error = e;
        }
        expect(result["deleteTest.txt"]).not.toBeDefined();
        expect(error).not.toBeDefined();
    });

    it("Should be able to get correct file's info", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "infoTest1.txt", id: "1235", mimeType: "text/plain" }] }, status: 200 });

            result = await remoteStore.getInfo("infoTest1.txt");
        } catch(e) {
            error = e;
        }
        expect(result.name).toMatch("infoTest1.txt");
        expect(result.mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
    });

    it ("Should be able to get all files info", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "infoTest2.txt", id: "1235", mimeType: "text/plain" }] }, status: 200 });

            result = await remoteStore.getInfo();
        } catch(e) {
            error = e;
        }
        expect(result["infoTest2.txt"]).toBeDefined();
        expect(result["infoTest2.txt"].name).toMatch("infoTest2.txt");
        expect(result["infoTest2.txt"].mimeType).toMatch("text/plain");
        expect(error).not.toBeDefined();
    });

    it("Should be able to overwrite a file", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "overwriteTest.txt", id: "1235" }] }, status: 200 });
            fetchMock.patch("https://www.googleapis.com/upload/drive/v3/files/1235?uploadType=resumable", { headers: { location: "https://overwriteTest.txt" }, status: 200});
            fetchMock.put("https://overwriteTest.txt", 200);

            result = await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    });

    it("Should be able to create a folder", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/generateIds?count=1", { body: { ids: ["1235"] }, status: 200});
            fetchMock.post("https://www.googleapis.com/drive/v3/files/", 201);

            await remoteStore.createFolder("folderCreateTest");
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    });

    it("Should be able to list files", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "listFileTest.txt", id: "1235", mimeType: "text/plain" }] }, status: 200 });

            result = await remoteStore.getItems(false);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(result["listFileTest.txt"].id).toBeDefined();
        expect(result["listFileTest.txt"].name).toEqual("listFileTest.txt");
        expect(result["listFileTest.txt"].store).toEqual("google");
    });
    
    it("Should be able to list folders", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "listFolderTest", id: "1235", mimeType: "application/vnd.google-apps.folder" }] }, status: 200 });

            result = await remoteStore.getItems(true);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(result["listFolderTest"]).toBeDefined();
        expect(result["listFolderTest"].id).toBeDefined();
        expect(result["listFolderTest"].name).toEqual("listFolderTest");
        expect(result["listFolderTest"].store).toEqual("google");
    });

    it("Should be able to upload in a folder", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "folderUploadTest", id: "1235", mimeType: "application/vnd.google-apps.folder" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271235%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/generateIds?count=1", { body: { ids: ["1236"] }, status: 200});
            fetchMock.post("https://www.googleapis.com/upload/drive/v3/files/?uploadType=resumable", { headers: { location: "https://folderUploadTest.txt" }, status: 200});
            fetchMock.put("https://folderUploadTest.txt", 200);

            result = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder upload test", "folderUploadTest.txt", result["folderUploadTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    });

    it("Should be able to download from a folder", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "folderDownloadTest", id: "1235", mimeType: "application/vnd.google-apps.folder" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271235%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "folderDownloadTest.txt", id: "1236", mimeType: "text/plain" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1236?alt=media", { body: "This is a folder download test", status: 200 });

            folders = await remoteStore.getItems(true);
            result = await remoteStore.downloadFile("folderDownloadTest.txt", folders["folderDownloadTest"].id);
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
        expect(text).toBeDefined();
        expect(text).toMatch("This is a folder download test"); 
    });

    it("Should be able to delete from a folder", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "folderDeleteTest", id: "1235", mimeType: "application/vnd.google-apps.folder" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271235%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "folderDeleteTest.txt", id: "1236", mimeType: "text/plain" }] }, status: 200 });
            fetchMock.delete("https://www.googleapis.com/drive/v3/files/1236", 201);

            folders = await remoteStore.getItems(true);
            await remoteStore.deleteFile("folderDeleteTest.txt", folders["folderDeleteTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    });

    it("Should be able to list from a folder", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "subFolderListTest", id: "1235", mimeType: "application/vnd.google-apps.folder" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271235%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "subFolderListTest.txt", id: "1236", mimeType: "text/plain" }] }, status: 200 });
            
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
        expect(result["subFolderListTest.txt"].store).toEqual("google");     
    });

    it("Should support unicode filename upload", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/generateIds?count=1", { body: { ids: ["1235"] }, status: 200});
            fetchMock.post("https://www.googleapis.com/upload/drive/v3/files/?uploadType=resumable", { headers: { location: "https://unicodeTest.txt" }, status: 200});
            fetchMock.put("https://unicodeTest.txt", 200);

            result = await remoteStore.uploadFile("This is a unicode name test", "子曰ٱلرَّحِيمِ.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    });

    it("Should support unicode filename download", async () => {
        try {
            fetchMock.get("https://www.googleapis.com/drive/v3/files/?fields=files(kind,id,mimeType,name)&q=%20%271234%27%20in%20parents%20and%20appProperties%20has%20%7Bkey=%27remoteStorage%27%20and%20value=%27https://remotestoretestredirect.url/%27%7D", { body: { files: [{ name: "子曰ٱلرَّحِيمِ.txt", id: "1235" }] }, status: 200 });
            fetchMock.get("https://www.googleapis.com/drive/v3/files/1235?alt=media", { body: "This is a unicode name test", status: 200 });

            result = await remoteStore.downloadFile("子曰ٱلرَّحِيمِ.txt");
            text = await new Response(result).text();
        } catch(e) {
            error = e;
        }
        expect(text).toBeDefined();
        expect(text).toMatch("This is a unicode name test");
        expect(error).not.toBeDefined();
    });

});

describe("OneDrive", () => {
    let remoteStore;
    let error;
    let result;
    let text;
    let folders;

    beforeAll(async () => {
        remoteStore = await getOneDriveStore();
        await remoteStore.auth();
    });

    beforeEach(async () => {
        error = undefined;
    });

    afterEach(async () => {
        fetchMock.reset();
    });

    it("Should be able to complete an upload without error", async () => {
        try {
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234:/uploadTest.txt:/createUploadSession", { body: { uploadUrl: "https://uploadTest.txt" }, status: 200});
            fetchMock.put("https://uploadTest.txt/", 200);

            result = await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    });
    
    it("Should be able to complete a download without error", async () => {
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
    });

    it("Should be able to delete a file without error", async () => {
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
    });

    it("Should be able to get correct file's info", async () => {
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
    });

    it ("Should be able to get all files info", async () => {
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
    });

    it("Should be able to overwrite a file", async () => {
        try {
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234:/overwriteTest.txt:/createUploadSession", { body: { uploadUrl: "https://overwriteTest.txt" }, status: 200});
            fetchMock.put("https://overwriteTest.txt/", 200);

            result = await remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    });

    it("Should be able to create a folder", async () => {
        try {
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234/children", 201);

            await remoteStore.createFolder("folderCreateTest");
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    });

    it("Should be able to list files", async () => {
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
    });
    
    it("Should be able to list folders", async () => {
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
    });

    it("Should be able to upload in a folder", async () => {
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
    });

    it("Should be able to download from a folder", async () => {
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
    });

    it("Should be able to delete from a folder", async () => {
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
    });

    it("Should be able to list from a folder", async () => {
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
    });

    it("Should support unicode filename upload", async () => {
        try {
            fetchMock.post("https://graph.microsoft.com/v1.0/me/drive/items/1234:/子曰ٱلرَّحِيمِ.txt:/createUploadSession", { body: { uploadUrl: "https://unicodeTest.txt" }, status: 200});
            fetchMock.put("https://unicodeTest.txt/", 200);

            result = await remoteStore.uploadFile("This is a unicode name test", "子曰ٱلرَّحِيمِ.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();  
    });

    it("Should support unicode filename download", async () => {
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
    });
});

describe("Mock Provider", () => {
    let remoteStore;
    let error;
    let result;
    let text;
    let folders;

    beforeAll(async () => {
        remoteStore = await getMockStore();
        await remoteStore.auth();
    });

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
    });

    it("Should be able to complete an upload without error", async () => {
        try {
            result = await remoteStore.uploadFile("This is an upload test", "uploadTest.txt");
        } catch(e) {
            error = e;
        }
        expect(Math.trunc(result / 100)).toEqual(2);
        expect(error).not.toBeDefined();
    });
    
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
    });

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
    });

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
    });

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
    });

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
    });

    it("Should be able to create a folder", async () => {
        try {
            await remoteStore.createFolder("folderCreateTest");
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    });

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
        expect(result["listFileTest.txt"].store).toEqual("mock");
    });
    
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
        expect(result["listFolderTest"].store).toEqual("mock");
    });

    it("Should be able to upload in a folder", async () => {
        try {
            await remoteStore.createFolder("folderUploadTest");
            result = await remoteStore.getItems(true);
            await remoteStore.uploadFile("This is a folder upload test", "folderUploadTest.txt", result["folderUploadTest"].id);
        } catch(e) {
            error = e;
        }
        expect(error).not.toBeDefined();
    });

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
    });

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
    });

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
        expect(result["subFolderListTest.txt"].store).toEqual("mock");
    });

    it("Should throw on invalid parent ID when uploading", async () => {
        try {
            await remoteStore.uploadFile("This is an upload test", "uploadTest.txt", "invalid");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such folder");
    });

    it("Should throw on non-existent file when downloading", async () => {
        try {
            await remoteStore.downloadFile("errorTest.txt");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such file");
    });

    it("Should throw on invalid parent ID when downloading", async () => {
        try {
            await remoteStore.downloadFile("errorTest.txt", "invalid");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such folder");
    });

    it("Should throw on non-existent file when deleting", async () => {
        try {
            await remoteStore.deleteFile("errorTest.txt");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such file");
    });

    it("Should throw on invalid parent ID when deleting", async () => {
        try {
            await remoteStore.deleteFile("errorTest.txt", "invalid");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such folder");
    });

    it("Should throw on invalid parent ID when creating folder", async () => {
        try {
            await remoteStore.createFolder("errorTest", "invalid");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such folder");
    });

    it("Should throw if trying to overwrite folder", async () => {
        try {
            await remoteStore.createFolder("folderOverwriteTest");
            await remoteStore.createFolder("folderOverwriteTest");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("Folder already exists");
    });

    it("Should throw on invalid parent ID when getting items", async () => {
        try {
            await remoteStore.getItems(false, "invalid");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such folder");
    });

    it("Should throw if getting info for non-existent file", async () => {
        try {
            await remoteStore.getInfo("getInfoErrorTest.txt");
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error).toEqual("No such file");
    });

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
    });
});