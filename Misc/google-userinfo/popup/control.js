var gettingPage = browser.runtime.getBackgroundPage();
var token;

function saveNote() {
    gettingPage.then((page) => {
        page.uploadFile(token, document.getElementById("input").value, "Test2.txt").then(console.log).catch(console.log);
    })
}

function deleteNote() {
    gettingPage.then((page) => {
        page.deleteFile(token, 1).then(console.log).catch(console.log);
    })
}

function authorize() {
    gettingPage.then((page) => {
        page.getAccessToken().then((result) => {token = result}).catch(page.logError);
    });
}

function listenForClicks(page) {
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("login")) handleSignInClick();
        else if (e.target.classList.contains("save")) saveNote();
        else if (e.target.classList.contains("delete")) deleteNote();
    });
}

authorize();
listenForClicks();