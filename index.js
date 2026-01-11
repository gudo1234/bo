import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createInterface } from 'readline'
import yargs from 'yargs'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { say } = cfonts

// Mostrar banner
say('Enigma', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', 'magenta']
})

// Setup readline
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
        // Si salió normalmente, volver a iniciar
        start(files)
      }
    })

    // Asegurar que solo se agregue 1 listener a readline
    if (!rl.listenerCount('line')) {
      rl.on('line', (line) => {
        child.send(line.trim())
      })
    }

    if (opts.test) {
      console.log(chalk.gray('[TEST MODE] No se espera input de consola.'))
    }
  }
}

start(['main.js'])
