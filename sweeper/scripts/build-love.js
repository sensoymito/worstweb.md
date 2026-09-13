const AdmZip = require('adm-zip');
const zip = new AdmZip();
zip.addLocalFile('main.lua');
zip.addLocalFile('conf.lua');
zip.addLocalFolder('lib', 'lib');
zip.addLocalFolder('img', 'img');
zip.writeZip('game.love');