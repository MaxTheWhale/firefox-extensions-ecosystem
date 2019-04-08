const TEST_TOKEN = "ABCdef123456789";
const TEST_URL = "https://remotestoretestredirect.url/";
const AUTH_ONEDRIVE = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=1fe91dbd-fcd7-4f15-9674-1ae6d9e28ba1&response_type=token&redirect_uri=https%3A%2F%2Fremotestoretestredirect.url%2F&scope=Files.ReadWrite%20offline_access%20openid";
const AUTH_GOOGLE = "https://accounts.google.com/o/oauth2/auth?client_id=887401722713-n61d7cl8o92cjol2sid7q31t9gs28uqs.apps.googleusercontent.com&response_type=token&redirect_uri=https%3A%2F%2Fremotestoretestredirect.url%2F&scope=openid%20email%20profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file";

let identity = {
    getRedirectURL: function() { return TEST_URL; },
    launchWebAuthFlow: async function(opts) {
        if (opts.url === AUTH_ONEDRIVE) {
            return `${opts.url}&token=${TEST_TOKEN}`;
        }
        if (opts.url === AUTH_GOOGLE) {
            return `${opts.url}&access_token=${TEST_TOKEN}`;
        }
        return "none_matched";
    }
}

export {identity}