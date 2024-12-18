// import tsj from 'ts-json-schema-generator';
var tsj = require('ts-json-schema-generator');
var fs = require('fs');
var config = {
	path: '/Users/yuanlu.li/devs/yuanlu/updateserver4-frontend/src/routes/api/project/list/-api.ts',
	tsconfig: '/Users/yuanlu.li/devs/yuanlu/updateserver4-frontend/tsconfig.json',
	type: '__TMP', // Or <type-name> if you want to generate schema for that one type only
};
var outputPath = '/Users/yuanlu.li/devs/yuanlu/updateserver4-frontend/zzzz.json';
console.log(config.path);
var schema = tsj.createGenerator(config).createSchema(config.type);
var schemaString = JSON.stringify(schema, null, 2);
console.log('OK');
fs.writeFile(outputPath, schemaString, function (err) {
	if (err) throw err;
});
console.log('OK2', outputPath);
