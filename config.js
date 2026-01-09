import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'



global.owner = [
  ['5215539356057', 'Enigma', true],

]



global.mods = []
global.prems = []
   


global.packname = '銉熲槄 饾槍饾槸饾槳饾槰饾槷饾槩-饾槈饾槹饾樀 鈽呭健'
global.author = 'Enigma-Bot'
global.wait = 'Espera Por Favot'
global.botname = '銉熲槄 饾槍饾槸饾槳饾槰饾槷饾槩-饾槈饾槹饾樀 鈽呭健'
global.textbot = `Enigma Team`
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

              
