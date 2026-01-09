import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'



global.owner = [
  ['5493425242334', ' 🍁̶͢͞▻⟅ẹ𝆊ϋ⟆٭⳺֟፝͜⳻٭.er/k.', true],
]

global.mods = []
global.prems = []
//❤️❤️❤️❤️
/*async function getRandomChannel() {
  const canalIdM = ["120363285614743024@newsletter", "120363395205399025@newsletter"]
  const canalNombreM = ["🤖⃧►iʑυвöτ◃2.0▹", "Zeus Bot🔆Channel-OFC"]

  const idx = Math.floor(Math.random() * canalIdM.length)
  return {
    id: canalIdM[idx],
    name: canalNombreM[idx]
  }
}*/
const emojiList = [
    "🌱", "🪴", "⭐", "🍁", "⚡",
    "🌙", "🏖️", "🪐", "✨", "🌊"
];

const redesList = [
    "https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H",
    "https://wa.me/50495351584?text=Hola+quiero+un+bot+para+mi+grupo,+cuáles+son+los+planes?+",
    "https://www.instagram.com/edar504__",
    "https://www.tiktok.com/@edar_xd",
    "https://www.paypal.me/edar504",
    "https://chat.whatsapp.com/EGWREmKYGUAADNAan5vxZo?mode=wwt"
];

const iconosList = [
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me2.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me3.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me4.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me5.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me6.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me7.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me8.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me9.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me10.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me11.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me12.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me13.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me14.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me15.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me16.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me17.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me18.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me19.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me20.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me21.jpg',
    'https://raw.githubusercontent.com/edar123/im/main/media/me22.jpg'
];

Object.defineProperty(global, "e", {
    get() {
        return emojiList[Math.floor(Math.random() * emojiList.length)];
    }
});

Object.defineProperty(global, "redes", {
    get() {
        return redesList[Math.floor(Math.random() * redesList.length)];
    }
});

Object.defineProperty(global, "icono", {
    get() {
        return iconosList[Math.floor(Math.random() * iconosList.length)];
    }
});
global.a1 = `╭┈۫۫۫۫۫╌۪۪۪۪۪۪۪۪֠╼◈¨(`
global.a2 = `)¨◈۫۫۫۫۫۫۫۫۫╾֩┈۪۪۪۪╮`
//✅✅✅✅


global.packname = '銉熲槄 饾槍饾槸饾槳饾槰饾槷饾槩-饾槈饾槹饾樀 鈽呭健'
global.textbot = "Bot de mierd4";
global.author = "🍁̶͢͞▻⟅ẹ𝆊ϋ⟆٭⳺֟፝͜⳻٭.er/k";
global.wait = 'Espera Por Favot'
global.botname = '銉熲槄 饾槍饾槸饾槳饾槰饾槷饾槩-饾槈饾槹饾樀 鈽呭健'
global.listo = 'Se completo tarea'
global.namechannel = '銉熲槄 饾槍饾槸饾槳饾槰饾槷饾槩-饾槈饾槹饾樀 鈽呭健'


global.group = 'https://chat.whatsapp.com/Ioz'
global.canal = 'https://whatsapp.com/channel/0029'

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios



global.multiplier = 69 
global.maxwarn = '2' // m谩xima advertencias



let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'main.js'"))
  import(`${file}?update=${Date.now()}`)
})

              
