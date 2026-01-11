process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import {
  watchFile,
  unwatchFile,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync
} from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'
import './config.js'
import { yukiJadiBot } from './plugins/sockets-serbot.js'
global.opts = {
  legacy: false
}
const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { say } = cfonts

// Banner
say('Enigma', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', 'magenta']
})

// Readline
const rl = createInterface(process.stdin, process.stdout)
const argsFromCli = process.argv.slice(2)
const opts = yargs(argsFromCli).exitProcess(false).parse()

let isRunning = false

async function start(files) {
  if (isRunning) return
  isRunning = true

  for (const file of files) {
    const filePath = join(__dirname, file)

    setupMaster({ exec: filePath, args: argsFromCli })
    const child = fork()

    child.on('message', msg => {
      console.log(chalk.green('[RECEIVED]'), msg)
      if (msg === 'reset') {
        console.log(chalk.yellow('[INFO] Reiniciando proceso...'))
        child.kill()
        isRunning = false
        start(files)
      } else if (msg === 'uptime') {
        child.send(process.uptime())
      }
    })

    child.on('exit', (code) => {
      console.error(chalk.red('[ERROR] Proceso finalizado con código:'), code)
      isRunning = false

      if (code !== 0) {
        watchFile(filePath, () => {
          unwatchFile(filePath)
          console.log(chalk.blue('[INFO] Archivo cambiado. Reiniciando...'))
          start(files)
        })
      } else {
        start(files)
      }
    })

    if (!rl.listenerCount('line')) {
      rl.on('line', (line) => {
        child.send(line.trim())
      })
    }

    if (opts.test) {
      console.log(chalk.gray('[TEST MODE] No se espera input de consola.'))
    }

    // ===============================
    //   SISTEMA JADIBOT
    // ===============================

    const jadi = "JadiBots"
    global.rutaJadiBot = join(__dirname, jadi)

    if (!existsSync(global.rutaJadiBot)) {
      mkdirSync(global.rutaJadiBot, { recursive: true })
      console.log(chalk.cyan(`ꕥ La carpeta: ${jadi} se creó correctamente.`))
    } else {
      console.log(chalk.cyan(`ꕥ La carpeta: ${jadi} ya está creada.`))
    }

    const readRutaJadiBot = readdirSync(global.rutaJadiBot)

    if (readRutaJadiBot.length > 0) {
      const creds = 'creds.json'

      for (const gjbts of readRutaJadiBot) {
        const botPath = join(global.rutaJadiBot, gjbts)

        if (existsSync(botPath) && statSync(botPath).isDirectory()) {
          const readBotPath = readdirSync(botPath)

          if (readBotPath.includes(creds)) {
            yukiJadiBot({
              pathYukiJadiBot: botPath,
              m: null,
              conn: null,
              args: '',
              usedPrefix: '/',
              command: 'serbot'
            })
          }
        }
      }
    }
  }
}

start(['main.js'])
