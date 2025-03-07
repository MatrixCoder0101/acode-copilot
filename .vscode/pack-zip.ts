import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

const iconFile = path.join('icon.png');
const pluginJSON = path.join('plugin.json');
const distFolder = path.join('build');
let md = path.join('readme.md');

if (!fs.existsSync(md)) {
  md = path.join('README.md');
}

const zip = new JSZip();

zip.file('icon.png', fs.readFileSync(iconFile));
zip.file('plugin.json', fs.readFileSync(pluginJSON));
zip.file('readme.md', fs.readFileSync(md));

loadFile('', distFolder);

zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fs.createWriteStream(path.join('Plugin.zip')))
  .on('finish', () => {
    console.log(`\nSucsessfuly Compiled ✅`);
  });

function loadFile(root: any, folder: any) {
  const buildFiles = fs.readdirSync(folder);
  buildFiles.forEach((file) => {
    const filePath = path.join(folder, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      zip.folder(path.join(root, file));
      loadFile(path.join(root, file), filePath);
      return;
    }

    if (!/LICENSE.txt/.test(file)) {
      zip.file(path.join(root, file), fs.readFileSync(filePath));
    }
  });
}