process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js'
import { createRequire } from 'module'
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import { Boom } from '@hapi/boom'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import pino from 'pino'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import readline from 'readline'
import NodeCache from 'node-cache'

const { proto } = (await import('@whiskeysockets/baileys')).default
const {
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason
} = await import('@whiskeysockets/baileys')

const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

global.db = new Low(new JSONFile(`storage/databases/database.json`))
global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(async function () {
    if (!global.db.READ) {
      clearInterval(this)
      resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
    }
  }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = chain(global.db.data)
}
await loadDatabase()

const { state, saveCreds } = await useMultiFileAuthState("sessions")
const question = (text) => new Promise((resolve) => readline.createInterface({ input: process.stdin, output: process.stdout }).question(text, resolve))

const msgRetryCounterCache = new NodeCache()
const userDevicesCache = new NodeCache()
const mediaCache = new NodeCache()
global.groupMetadataCache = new NodeCache({ stdTTL: 60 }) // TTL 60 segundos

global.cachedGroupMetadata = async function (jid) {
  if (!jid.endsWith('@g.us')) return {}
  const cached = global.groupMetadataCache.get(jid)
  if (cached) return cached
  try {
    const metadata = await global.conn.groupMetadata(jid)
    global.groupMetadataCache.set(jid, metadata)
    return metadata
  } catch (e) {
    console.error('[cachedGroupMetadata] Error al obtener metadata:', e)
    return {}
  }
}

const logger = pino({ level: 'silent' })
console.info = () => {}

const connectionOptions = {
  logger,
  printQRInTerminal: false,
  mobile: false,
  keepAliveIntervalMs: 2000,
  mediaCache,
  msgRetryCounterCache,
  userDevicesCache,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  getMessage: async () => undefined,
  generateHighQualityLinkPreview: true,
  shouldSyncHistoryMessage: () => false,
  syncFullHistory: false,
  markOnlineOnConnect: true,
  defaultQueryTimeoutMs: undefined,
  version: [2, 3000, 1027934701],
  browser: ["Ubuntu", "Chrome", "20.0.04"],
  cachedGroupMetadata: global.cachedGroupMetadata

}

global.conn = makeWASocket(connectionOptions)

if (!conn.authState.creds.registered) {
  const phoneNumber = await question(chalk.blue(' Ingresa el número de WhatsApp en el cual estará la Bot\n'))
  if (conn.requestPairingCode) {
    let code = await conn.requestPairingCode(phoneNumber)
    code = code?.match(/.{1,4}/g)?.join("-") || code
    console.log(chalk.magenta(`Su código es:`, code))
  }
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.dbDirty && global.db.data) {
        try {
          await global.db.write()
          global.dbDirty = false
          console.log('[💾 DB] Guardado exitoso desde main.js')
        } catch (e) {
          console.error('[❌ DB] Error al guardar la DB desde main.js:', e)
        }
      }
    }, 30 * 1000)
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function clearTmp() {
  const tmp = [tmpdir(), join(__dirname, './tmp')]
  const filename = []
  tmp.forEach(dirname => readdirSync(dirname).forEach(file => filename.push(join(dirname, file))))

  return filename.map(file => {
    const stats = statSync(file)
    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 1)) return unlinkSync(file)
    return false
  })
}

setInterval(async () => {
  await clearTmp()
  console.log(chalk.cyan(`Se limpió la carpeta tmp`))
}, 1000 * 60 * 5)

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update
  global.stopped = connection
  if (isNewLogin) conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error)
  }
  if (global.db.data == null) loadDatabase()
  if (connection === 'open') {
    global.botStartTime = Math.floor(Date.now() / 1000)
    console.log(chalk.cyan('Conectado correctamente.'))
  }
  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === 'close') {
    if (reason === DisconnectReason.connectionReplaced) {
      conn.logger.error(`[ ⚠ ] Sesión reemplazada.`)
      process.send('reset')
    } else {
      conn.logger.warn(`[ ⚠ ] Conexión cerrada. Reintentando...`)
      await global.reloadHandler(true).catch(console.error)
    }
  }
}

process.on('uncaughtException', console.error)

let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    process.send('reset')
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }
  conn.handler = handler.handler.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)

  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename))
      const module = await import(file)
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then(() => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true)
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`🔄 updated plugin - '${filename}'`)
      else {
        conn.logger.warn(`❌ deleted plugin - '${filename}'`)
        return delete global.plugins[filename]
      }
    } else conn.logger.info(`🆕 new plugin - '${filename}'`)

    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true
    })
    if (err) return conn.logger.error(`❗ syntax error while loading '${filename}':\n${format(err)}`)

    try {
      const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
      global.plugins[filename] = module.default || module
    } catch (e) {
      conn.logger.error(e)
    }
  }
}

async function _quickTest() {
    const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
    ].map((p) => {
    return Promise.race([
    new Promise((resolve) => {
    p.on('close', (code) => {
    resolve(code !== 127);
    });
    }),
    new Promise((resolve) => {
    p.on('error', (_) => resolve(false));
    })]);
    }));
    const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
    const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
    Object.freeze(global.support);
}

_quickTest().then(() => conn.logger.info("Loading")).catch(console.error)
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()
