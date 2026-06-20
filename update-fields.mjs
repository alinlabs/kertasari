import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Careful not to replace things indiscriminately if they are standard DOM things or standard formats. 
  // But `.title`, `.description`, `.iconName`, `.date`, `.time`, `.location` for proker and agenda properties should be fine for this applet.
  content = content.replace(/(?<!\w)title:/g, 'judul:');
  content = content.replace(/\.title(?![\w])/g, '.judul');
  
  content = content.replace(/(?<!\w)description:/g, 'deskripsi:');
  content = content.replace(/\.description(?![\w])/g, '.deskripsi');
  
  content = content.replace(/(?<!\w)iconName:/g, 'ikon:');
  content = content.replace(/\.iconName(?![\w])/g, '.ikon');
  
  content = content.replace(/(?<!\w)date:/g, 'tanggal:');
  // Need to be careful with new Date(agenda.date), now new Date(agenda.tanggal)
  content = content.replace(/\.date(?![\w])/g, '.tanggal');
  
  content = content.replace(/(?<!\w)time:/g, 'waktu:');
  content = content.replace(/\.time(?![\w])/g, '.waktu');
  
  content = content.replace(/(?<!\w)location:/g, 'lokasi:');
  content = content.replace(/\.location(?![\w])/g, '.lokasi');

  fs.writeFileSync(filePath, content, 'utf-8');
}

function walkPath(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkPath(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkPath('./src/');
console.log('Done replacing fields in src/');
