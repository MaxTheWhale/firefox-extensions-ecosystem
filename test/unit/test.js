const Jasmine = require("jasmine");
let jasmine = new Jasmine();

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