//const jsdom = require("jsdom");
//const { JSDOM } = jsdom;
//const fetch_mock = require('fetch-mock');
//const {fetchMock, MATCHED, UNMATCHED} = require('fetch-mock');

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