const TEST_TOKEN = "ABCdef123456789";
const TEST_URL = "https://remotestoretestredirect.url/"
const AUTH_ONEDRIVE = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=1fe91dbd-fcd7-4f15-9674-1ae6d9e28ba1&response_type=token&redirect_uri=https%3A%2F%2Fremotestoretestredirect.url%2F&scope=Files.ReadWrite%20offline_access%20openid"
const AUTH_GOOGLE = "https://accounts.google.com/o/oauth2/auth?client_id=887401722713-n61d7cl8o92cjol2sid7q31t9gs28uqs.apps.googleusercontent.com&response_type=token&redirect_uri=https%3A%2F%2Fremotestoretestredirect.url%2F&scope=openid%20email%20profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file"

const VALIDATION_GOOGLE = `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${TEST_TOKEN}`
const GETID_GOOGLE = `https://www.googleapis.com/drive/v3/files?q=name=`
const GENERATEID_GOOGLE = `https://www.googleapis.com/drive/v3/files/generateIds?count=1`
const UPLOAD_GOOGLE = `https://www.googleapis.com/upload/drive/v3/files/?uploadType=resumable`
const UPLOADLOCATION_GOOGLE = `https://www.googleapis.com/upload/drive/v3/files/?uploadType=resumable&upload_id=`
const PUT_GOOGLE = `https://www.googleapis.com/upload/drive/v3/files/`

let current_files = [];
let last_search = "";
const IDs = {
    "uploadTest.txt": "2d570d9a2f304a709c1395f3868937dd",
    "downloadTest.txt": "fc23b1d232d3472a9318d77d3c34a8c9",
    "infoTest1.txt": "6b5c0b16b4b9447dbf8b2df1359e7bb6",
    "infoTest2.txt": "20500ccb976d490b84ba0930ccea9dc3",
    "overwriteTest.txt": "4b9acac3a50e494a96370ab2c64619f2",
    "largeUploadTest.png": "e1ffd71d685d43e3bd8baa5eef0c614f",
    "largeDownloadTest.png": "9aecf6c98ed74bfca921c22968dd31c1"
}

function checkAuthHeader(headers) {
    return (headers.get('Authorization') === `Bearer ${TEST_TOKEN}`);
}

let browser = {
    identity: {
        getRedirectURL: function() { return TEST_URL; },
        launchWebAuthFlow: async function(opts) {
            console.log(opts.url);
            if (opts.url === AUTH_ONEDRIVE) {
                return `${opts.url}&token=${TEST_TOKEN}`;
            }
            if (opts.url === AUTH_GOOGLE) {
                return `${opts.url}&access_token=${TEST_TOKEN}`;
            }
            return "none_matched";
        }
    }
}

let fetch = async function(request, options) {

    // Interpret the arguments and assign parameters
    let url = "";
    let method = "GET";
    let headers = null;
    let body = null;
    if (request.constructor.name === 'Request') {
        url = request.url;
        method = request.method;
        headers = request.headers;
    }
    else {
        url = request;
        if (options) {
            if (options.method) method = options.method;
            if (options.body) body = options.body;
            if (options.headers) headers = options.headers;
        }
    }
    console.log("mocked! " + url);

    // Define responses for GET requests
    if (method === "GET") {
        if (url === VALIDATION_GOOGLE) {
            return new Response(null, { status: 200 } );
        }
        if (url === GENERATEID_GOOGLE) {
            if (!checkAuthHeader(headers)) {
                return new Response(null, { status: 413 } );
            }
            responseBody = JSON.stringify({ ids: [IDs[last_search]] });
            return new Response(responseBody, { status: 200 } );
        }
        if (url.startsWith(GETID_GOOGLE)) {
            if (!checkAuthHeader(headers)) {
                return new Response(null, { status: 413 } );
            }
            last_search = url.slice(url.search("name=")+8, -3);
            let responseBody = JSON.stringify({ files: [] });
            current_files.forEach(file => {
                if (url.includes(file) && current_files.includes(file)) {
                    responseBody = JSON.stringify({ files: [{id: IDs[file] }] });
                }
            });
            return new Response(responseBody, { status: 200 } );
        }
    }

    // Define responses for POST requests
    if (method === "POST") {
        if (url === UPLOAD_GOOGLE) {
            if (!checkAuthHeader(headers) || headers.get('Content-Type') !== 'application/json') {
                return new Response(null, { status: 413 } );
            }
            metadata = await request.json();
            let file = metadata.name;
            let id = metadata.id;
            if (current_files.includes(file) || id !== IDs[file]) {
                return new Response(null, { status: 413 } );
            }
            // should probably check X-Content headers here too

            let respHeaders = new Headers();
            respHeaders.append('location', `${UPLOADLOCATION_GOOGLE}${IDs[file]}`);
            return new Response(null, { status: 200, headers: respHeaders } );
        }
    }

    if (method === "PUT") {
        console.log("puttt" + url);
        if (url.startsWith(PUT_GOOGLE)) {
            if (!checkAuthHeader(headers)) {
                return new Response(null, { status: 413 } );
            }
            let file = await request.blob();
            // should probably check stuff about the file

            let id = url.slice(-32);
            console.log(id);
            Object.keys(IDs).forEach(fileName => {
                if (IDs[fileName] === id) {
                    current_files.push(fileName);
                }
            });
            return new Response(null, { status: 200 } );
        }
    }

    return "hi";
};