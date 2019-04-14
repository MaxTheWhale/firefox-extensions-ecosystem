const TEST_TOKEN = "ABCdef123456789";
const TEST_URL = "https://remotestoretestredirect.url/";
const AUTH_ONEDRIVE = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const AUTH_GOOGLE = "https://accounts.google.com/o/oauth2/auth";

let browser = {
    identity: {
        getRedirectURL: function() { return TEST_URL; },
        launchWebAuthFlow: async function(opts) {
            if (opts.url.startsWith(AUTH_ONEDRIVE)) {
                return `${opts.url}&access_token=${TEST_TOKEN}`;
            }
            if (opts.url.startsWith(AUTH_GOOGLE)) {
                return `${opts.url}&access_token=${TEST_TOKEN}`;
            }
            return "none_matched";
        }
    },
    runtime: {
        id: "{1234-extensionid}"
    }
};

export default browser;