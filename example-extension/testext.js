import createRemoteStorage from './remoteStorage.js';

const googleClientID = "468410223660-kmmbbj8clgebgk886bcvngh87pj90613.apps.googleusercontent.com"

async function useGoogle() {
    googleDrive = await createRemoteStorage("google", "468410223660-kmmbbj8clgebgk886bcvngh87pj90613.apps.googleusercontent.com");
}

let googleButton = document.getElementById("google_button");
googleButton.addEventListener("click", useGoogle);
