describe("Google Drive", function() {
    var timeOut = 10000;
    var largeTimeOut = 20000;
    var remoteStore;
    var error;

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
            result = await remoteStore.downloadFile("overwriteTest.txt")
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

xdescribe("OneDrive", function() {
    var timeOut = 5000;
    var largeTimeOut = 5000;
    var remoteStore;
    var error;

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
        } catch (e) {
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

});