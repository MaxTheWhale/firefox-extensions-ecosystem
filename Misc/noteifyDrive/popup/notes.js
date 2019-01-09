/*
Used the following code sources as a guide:
https://github.com/mdn/webextensions-examples/tree/master/quicknote
https://github.com/mdn/webextensions-examples/tree/master/beastify
*/

var API_KEY = 'AIzaSyDiYVNGdO9I6deLAi-PPeNd0UZ0M7dK2lc';
var CLIENT_ID = '800655122962-t9bbgnubrr54dlo8i3u83rmnbdea6sur.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'profile https://www.googleapis.com/auth/drive.file';
var GoogleAuth;
// var getBack = browser.runtime.getBackgroundPage(); //Tried background page, allows me to load api, doesn't allow me to access gapi

function handleClientLoad() {
    // Loads the client library and the auth2 library together for efficiency.
    // Loading the auth2 library is optional here since `gapi.client.init` function will load
    // it if not already loaded. Loading it upfront can save one network request.
    gapi.load('client:auth2', initClient);
}

// function authorize() {
//     const redirectURL = browser.identity.getRedirectURL();
//     const scopes = ["https://www.googleapis.com/auth/drive.file", "profile"];
//     let authURL = "https://accounts.google.com/o/oauth2/auth";
//     authURL += `?client_id=${CLIENT_ID}`;
//     authURL += `&response_type=token`;
//     authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
//     authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;
    
//     browser.identity.launchWebAuthFlow({
//       interactive: true,
//       url: authURL
//     });//.then((redirect) => {
//         // Listen for sign-in state changes.
//     //     GoogleAuth = gapi.auth2.getAuthInstance();
//     //     gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
//     //     gapi.auth2.getAuthInstance().signOut();
//     //     // Handle the initial sign-in state.
//     //     updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
//     // //   });
//     //   console.log(gapi.auth2.getAuthInstance());
// }

function initClient() {
    // Initialize the client with API key and People API, and initialize OAuth with an
    // OAuth 2.0 client ID and scopes (space delimited string) to request access.
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: DISCOVERY_DOCS
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

      // Handle the initial sign-in state.
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSignInStatus(isSignedIn) {
    // When signin status changes, this function is called.
    // If the signin status is changed to signedIn, we make an API call.
    if (isSignedIn) {
        console.log("Signed-In");
    } else console.log("Signed-Out");
}

function handleSignInClick(event) {
    // Ideally the button should only show up after gapi.client.init finishes, so that this
    // handler won't be called before OAuth is initialized.
    gapi.auth2.getAuthInstance().signIn();
    console.log(2);
}

function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function listFiles(event) {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      gapi.client.drive.files.list({
        'pageSize': 20,
        'fields': "nextPageToken, files(id, name)",
        'q': "name contains 'pdf'" //Queries can be found here: https://developers.google.com/drive/api/v3/search-parameters
      }).then((response) => {
        var files = response.result.files;
        if (files && files.length > 0) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log(file.name);
          }
        }
      });
    } else console.log("Not logged in");
}

function onError(error) {
    console.log(error);
}

function displayNote() {
    browser.tabs.query({currentWindow: true, active: true}).then( (tabs) => { //Fetch the list of tabs
        let tabUrl = tabs[0].url; //Get the url of the current tab
        var load = browser.storage.local.get(null); //Load all values stored in local storage
        load.then((results) => {
            if (results[tabUrl] == null) document.getElementById("input").value = ""; //If the result associated with the tabUrl doesn't exist print nothing
            else document.getElementById("input").value = results[tabUrl]; //Print value stored in space associated with url
        }, onError);
    }, onError);
}

function listenForClicks(page) {
    document.addEventListener("click", (e) => {

        function saveNote() {
            browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
                var note = document.getElementById("input").value;
                let tabUrl = tabs[0].url;
                var storing = browser.storage.local.set({[tabUrl] : note});
                storing.then( () => {
                    document.getElementById("title").innerHTML = "Saved!";
                    setTimeout(() => {
                        document.getElementById("title").innerHTML = "Note";
                    }, 1500);
                }, onError);
            }, onError);
        }

        function clearNote() {
            document.getElementById("input").value = "";
            browser.storage.local.clear().catch(onError);
        }

        if (e.target.classList.contains("login")) handleSignInClick();
        else if (e.target.classList.contains("save")) saveNote();
        else if (e.target.classList.contains("clear")) clearNote();
    });
}

// function loadClient(page) {
//     page.handleClientLoad();
// }

// getBack.then((page) => {
//     // loadClient(page);
//     listenForClicks(page);
// }, onError);
// displayNote();
// handleClientLoad();
initClient();
listenForClicks();