describe("Google Drive", function() {
    var timeOut = 10000;
    var largeTimeOut = 20000;
    var remoteStore;
    var error;

    beforeEach(async function() {
        remoteStore = await getGoogleStore();
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
        expect(result / 100).toEqual(2);
        expect(error).not.toBeDefined();
        done();
        // remoteStore.uploadFile("This is an upload test", "uploadTest.txt").then((result) => {
        //     expect(result / 100).toEqual(2);
        //     done();
        // }).catch((e) => {
        //     fail(e);
        // });
    }, timeOut); //Setting custom timeout to deal with handling stuff over internet
    
    it("Should be able to complete a download without error", (done) => {
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
        // remoteStore.uploadFile("This is a download test", "downloadTest.txt").then(() => {
        //     remoteStore.downloadFile("downloadTest.txt").then((result) => {
        //         new Response(result).text().then((text) => {
        //             expect(text).toMatch("This is a download test");
        //             done();
        //         });
        //     }).catch((e) => {
        //         fail(e);
        //     });
        // });
    }, timeOut);

    // it("Should be able to delete a file without error", (done) => {
    //     remoteStore.uploadFile("This is a delete test", "deleteTest.txt").then(() => {
    //         remoteStore.deleteFile("deleteTest.txt").then(() => {
    //             remoteStore.getInfo().then((result) => {
    //                 expect(result["deleteTest.txt"]).not.toBeDefined();
    //                 done();
    //             });
    //         }).catch((e) => {
    //             fail(e);
    //         });
    //     });
    // }, timeOut);

    // it("Should be able to get correct file's info", (done) => {
    //     remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt").then(() => {
    //         remoteStore.getInfo("infoTest1.txt").then((result) => {
    //             expect(result.name).toMatch("infoTest1.txt");
    //             expect(result.mimeType).toMatch("text/plain");
    //             done();
    //         }).catch((e) => {
    //             fail(e);
    //         });
    //     });
    // }, timeOut);

    // it ("Should be able to get all files info", (done) => {
    //     remoteStore.uploadFile("This is getInfo test2", "infoTest2.txt").then(() => {
    //         remoteStore.getInfo().then((result) => {
    //             expect(result["infoTest2.txt"]).toBeDefined();
    //             expect(result["infoTest2.txt"].name).toMatch("infoTest2.txt");
    //             expect(result["infoTest2.txt"].mimeType).toMatch("text/plain");
    //             done();
    //         }).catch((e) => {
    //             fail(e);
    //         });
    //     }); 
    // }, timeOut);

    // it("Should be able to overwrite a file", (done) => {
    //     remoteStore.uploadFile("This text should get overwritten", "overwriteTest.txt").then(() => {
    //         remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt").then(() => {
    //             remoteStore.downloadFile("overwriteTest.txt").then((result) => {
    //                 new Response(result).text().then((text) => {
    //                     expect(text).toMatch("This is an overwrite test");
    //                     done();
    //                 })
    //             });
    //         });
    //     });
    // }, timeOut);

    // it("Should be able to upload a large file", (done) => {
    //     fetch("large_file.png").then((file) => {
    //         file.blob().then((fileBlob) => {
    //             remoteStore.uploadFile(fileBlob, "largeUploadTest.png").then((result) => {
    //                 expect(result / 100).toEqual(2);
    //                 done();
    //             }).catch((e) => {
    //                 fail(e);
    //             });
    //         });
    //     });
    // }, largeTimeOut);

    // it("Should be able to download a large file", (done) => {
    //     fetch("large_file.png").then((file) => {
    //         file.blob().then((fileBlob) => {
    //             remoteStore.uploadFile(fileBlob, "largeDownloadTest.png").then(() => {
    //                 remoteStore.downloadFile("largeDownloadTest.png").then((result) => { 
    //                     expect(result.size).toEqual(fileBlob.size);
    //                     done();
    //                 }).catch((e) => {
    //                     fail(e);
    //                 });
    //             });
    //         });
    //     });
    // }, largeTimeOut);

});

// describe("OneDrive", function() {
//     var timeOut = 10000;
//     var largeTimeOut = 20000;
//     var remoteStore;
//     var error;

//     beforeEach(async function() {
//         remoteStore = await getOneDriveStore();
//         error = undefined;
//     });
    
//     afterAll(async function() {
//         try {
//             await remoteStore.deleteFile("uploadTest.txt");
//             await remoteStore.deleteFile("downloadTest.txt");
//             await remoteStore.deleteFile("infoTest1.txt");
//             await remoteStore.deleteFile("infoTest2.txt");
//             await remoteStore.deleteFile("overwriteTest.txt");
//             await remoteStore.deleteFile("largeUploadTest.png");
//             await remoteStore.deleteFile("largeDownloadTest.png");
//         } catch (e) {
//         }
//     }, largeTimeOut);

//     it("Should be able to complete an upload without error", (done) => {    //Fails when error is thrown
//         remoteStore.uploadFile("This is an upload test", "uploadTest.txt").then((result) => {
//             expect(result / 100).toEqual(2);
//             done();
//         }).catch((e) => {
//             fail(e);
//         });
//     }, timeOut); //Setting custom timeout to deal with handling stuff over internet
    
//     it("Should be able to complete a download without error", (done) => {
//         remoteStore.uploadFile("This is a download test", "downloadTest.txt").then(() => {
//             remoteStore.downloadFile("downloadTest.txt").then((result) => {
//                 new Response(result).text().then((text) => {
//                     expect(text).toMatch("This is a download test");
//                     done();
//                 });
//             }).catch((e) => {
//                 fail(e);
//             });
//         });
//     }, timeOut);

//     it("Should be able to delete a file without error", (done) => {
//         remoteStore.uploadFile("This is a delete test", "deleteTest.txt").then(() => {
//             remoteStore.deleteFile("deleteTest.txt").then(() => {
//                 remoteStore.getInfo().then((result) => {
//                     expect(result["deleteTest.txt"]).not.toBeDefined();
//                     done();
//                 });
//             }).catch((e) => {
//                 fail(e);
//             });
//         });
//     }, timeOut);

//     it("Should be able to get correct file's info", (done) => {
//         remoteStore.uploadFile("This is getInfo test1", "infoTest1.txt").then(() => {
//             remoteStore.getInfo("infoTest1.txt").then((result) => {
//                 expect(result.name).toMatch("infoTest1.txt");
//                 expect(result.mimeType).toMatch("text/plain");
//                 done();
//             }).catch((e) => {
//                 fail(e);
//             });
//         });
//     }, timeOut);

//     it ("Should be able to get all files info", (done) => {
//         remoteStore.uploadFile("This is getInfo test2", "infoTest2.txt").then(() => {
//             remoteStore.getInfo().then((result) => {
//                 expect(result["infoTest2.txt"]).toBeDefined();
//                 expect(result["infoTest2.txt"].name).toMatch("infoTest2.txt");
//                 expect(result["infoTest2.txt"].mimeType).toMatch("text/plain");
//                 done();
//             }).catch((e) => {
//                 fail(e);
//             });
//         }); 
//     }, timeOut);

//     it("Should be able to overwrite a file", (done) => {
//         remoteStore.uploadFile("This text should get overwritten", "overwriteTest.txt").then(() => {
//             remoteStore.uploadFile("This is an overwrite test", "overwriteTest.txt").then(() => {
//                 remoteStore.downloadFile("overwriteTest.txt").then((result) => {
//                     new Response(result).text().then((text) => {
//                         expect(text).toMatch("This is an overwrite test");
//                         done();
//                     })
//                 });
//             });
//         });
//     }, timeOut);

//     it("Should be able to upload a large file", (done) => {
//         fetch("large_file.png").then((file) => {
//             file.blob().then((fileBlob) => {
//                 remoteStore.uploadFile(fileBlob, "largeUploadTest.png").then((result) => {
//                     expect(result / 100).toEqual(2);
//                     done();
//                 }).catch((e) => {
//                     fail(e);
//                 });
//             });
//         });
//     }, largeTimeOut);

//     it("Should be able to download a large file", (done) => {
//         fetch("large_file.png").then((file) => {
//             file.blob().then((fileBlob) => {
//                 remoteStore.uploadFile(fileBlob, "largeDownloadTest.png").then(() => {
//                     remoteStore.downloadFile("largeDownloadTest.png").then((result) => { 
//                         expect(result.size).toEqual(fileBlob.size);
//                         done();
//                     }).catch((e) => {
//                         fail(e);
//                     });
//                 });
//             });
//         });
//     }, largeTimeOut);

// });