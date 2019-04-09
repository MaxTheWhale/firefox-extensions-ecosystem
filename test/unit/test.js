//const jsdom = require("jsdom");
//const { JSDOM } = jsdom;

var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfig({
    spec_dir: './test/unit',
    spec_files: [
        'RemoteStorageSpec.js'
    ],
    helpers: [
        'SpecHelper.js'
    ]
});
jasmine.execute();