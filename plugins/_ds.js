import fs from 'fs';
import { join } from 'path';

const jadi = 'JadiBots';
const sessions = 'sessions';

const directoryPath = join('.', jadi);
const sanSessionPath = join('.', sessions);

function cleanSubbotDirectories() {
  fs.readdir(directoryPath, (err, subbotDirs) => {
    if (err) return console.log('No se puede escanear el directorio: ' + err);

    subbotDirs.forEach((subbotDir) => {
      const subbotPath = join(directoryPath, subbotDir);

      fs.readdir(subbotPath, (err, files) => {
        if (err) return console.log('No se puede escanear el directorio: ' + err);

        files.forEach((file) => {
          if (file !== 'creds.json') {
            fs.unlink(join(subbotPath, file), (err) => {
              if (err && err.code !== 'ENOENT') {
                console.log(`Error al eliminar JadiBot: ${file}: ` + err);
              }
            });
          }
        });
      });
    });
  });
}

function cleanSessionFiles() {
  fs.readdir(sanSessionPath, (err, files) => {
    if (err) return console.log('No se puede escanear el directorio: ' + err);

    files.forEach((file) => {
      if (file !== 'creds.json') {
        fs.unlink(join(sanSessionPath, file), (err) => {
          if (err && err.code !== 'ENOENT') {
            console.log(`Error al eliminar Session: ${file}: ` + err);
          }
        });
      }
    });
  });
}

const handler = async (m, { conn }) => {
  cleanSubbotDirectories();
  cleanSessionFiles();
};

handler.customPrefix = /😂|😁|🤣|😅|😆|😎|🤖|👾|❤️/;
handler.command = new RegExp(); // así funciona correctamente

export default handler;
