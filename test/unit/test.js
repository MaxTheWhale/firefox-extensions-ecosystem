const Jasmine = require("jasmine");
let jasmine = new Jasmine();

require = require("esm")(module/*, options*/);
module.exports = require("./RemoteStorageSpec.js");

jasmine.loadConfig({
    spec_dir: "./test/unit",
    spec_files: [
        "RemoteStorageSpec.js"
    ],
    helpers: [
        "SpecHelper.js"
    ]
});
jasmine.execute();