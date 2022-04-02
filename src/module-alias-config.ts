import 'module-alias/register';

const moduleAlias = require('module-alias');

moduleAlias(`${__dirname}/../package.json`);
