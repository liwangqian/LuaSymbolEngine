'use strict';

const fs_1 = require("fs");
const analysis_1 = require('../engine/analysis');

var fileName = "./test/textures/test01.lua";
fs_1.readFile(fileName, (err, data) => {
    console.log(err);

    let result = analysis_1.analysisFile(fileName, data, {}, console.log);

    fs_1.writeFile("./test/textures/test01.json", JSON.stringify(result, null, 2), (e) => { });
});

// console.log(Array.prototype.concat([], ...[[1, 2, 3], [4, 5, 6]]));