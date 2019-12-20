const csvjson = require('csvjson');
const readFile = require('fs').readFile;
readFile('C:\\Users\\KSM2COB\\Desktop\\rail.csv', 'utf-8', (err, fileContent) => {
    if(err) {
        console.log(err); // Do something to handle the error or just throw it
        throw new Error(err);
    }
    const jsonObj = csvjson.toObject(fileContent);
    console.log(jsonObj);
});