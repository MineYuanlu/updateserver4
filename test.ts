// import tsj from 'ts-json-schema-generator';
const tsj = require('ts-json-schema-generator');
const fs = require('fs');
const config: import('ts-json-schema-generator/dist/src/Config').Config = {
	path: '/Users/yuanlu.li/devs/yuanlu/updateserver4-frontend/src/routes/api/project/list/-api.ts',
	tsconfig: '/Users/yuanlu.li/devs/yuanlu/updateserver4-frontend/tsconfig.json',
	type: '*', // Or <type-name> if you want to generate schema for that one type only
};
const outputPath = '/Users/yuanlu.li/devs/yuanlu/updateserver4-frontend/zzzz.json';
console.log(config.path);
const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
console.log('OK');
fs.writeFile(outputPath, schemaString, (err) => {
	if (err) throw err;
});
console.log('OK2', outputPath);
