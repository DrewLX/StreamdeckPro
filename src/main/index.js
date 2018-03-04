'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
const {dialog} = require('electron')

const Store = require('electron-store')
const store = new Store()
store.delete('config')

var osc = require('node-osc')

const streamDeckApi = require('stream-deck-api')
var streamDeck = streamDeckApi.getStreamDeck()
var streamDeckOnline = false

// Once app is ready, check for streamdeck and bind stuff to it.
app.on('ready', function () {
  // checkForStreamdeck()
  setInterval(checkForStreamdeck, 1000)
})

// This checks for a streamdeck and sets it up if online.
function checkForStreamdeck () {
  if (streamDeck === undefined) {
    console.log('StreamDeck Offline - trying to connect')
    mainWindow.webContents.send('setOnline', false)
    streamDeck = streamDeckApi.getStreamDeck()
  } else {
    if (!streamDeckOnline) {
      console.log('StreamDeck Now Online!')
      mainWindow.webContents.send('setOnline', true)
      setupStreamDeck()
    }
  }
}

function setupStreamDeck () {
  if (streamDeck !== undefined) {
    streamDeckOnline = true
    streamDeck.setBrightness(100)

    streamDeck.on('down', (keyIndex) => {
      config[keyIndex]['pressed'] = true
      sendConfigToWebview()

      var key = config[keyIndex]

      if (key.mode === 'OSC') {
        var client = new osc.Client(key.osc.ip, key.osc.port)
        client.send(key.osc.msg, key.osc.args, function () {
          client.kill()
        })
        console.log('Sent OSC Message: ' + key.osc.msg + ' - to: ' + key.osc.ip + ' - on port: ' + key.osc.port + ' - with args: ' + key.osc.args)
      }

      if (key.mode === 'QLab' && key.qlab.type === 'system') {
        var qlabClient = new osc.Client('127.0.0.1', '53000')
        qlabClient.send(key.qlab.system, '', function () {
          qlabClient.kill()
        })
        console.log('QLab System Press: ' + key.qlab.system)
      }
    })

    streamDeck.on('up', (keyIndex) => {
      config[keyIndex].pressed = false
      sendConfigToWebview()
    })
  }
}

var config = []
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 680,
    resizable: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // if (!store.has('config')) {
  //   config = store.get('config')
  //   console.log('Config loaded from store')
  // } else {
  console.log('Default Config loaded')
  for (var i = 0; i < 16; i++) {
    config[i] = {
      pressed: false,
      mode: 'OSC',
      osc: {
        ip: '127.0.0.1',
        port: '53000',
        args: '',
        msg: '/cue/' + i + '/start'
      },
      qlab: {
        type: 'Cue'
      }
    }
  }
  // }

  sendConfigToWebview()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
    sendConfigToWebview()
  }
})

ipcMain.on('setConfig', (event, arg) => {
  config = arg
  store.set('config', config)
  // console.log('config updated and stored')
})
ipcMain.on('getConfig', (event, arg) => {
  sendConfigToWebview()
  // console.log('Initial config sent to webview')
})

ipcMain.on('setFillColor', (event, arg) => {
  console.log(arg)
  if (streamDeck !== undefined) {
    streamDeck.drawColor(parseInt(arg.color), parseInt(arg.button))
  }
})

ipcMain.on('pickImage', (event, arg) => {
  if (streamDeck !== undefined) {
    var file = dialog.showOpenDialog({title: 'Select Image', properties: ['openFile'], filters: [{name: 'Images', extensions: ['jpg', 'png']}]})
    console.log('File picked for button ' + arg.button + ' - ' + file)
    streamDeck.drawImageFileWithText(String(file), parseInt(arg.button), 'Hello')
  }
})

function sendConfigToWebview () {
  mainWindow.webContents.send('updateConfig', config)
}

process.on('unhandledRejection', (reason, p) => {
  console.log('EEK! Unhandled Rejection at: Promise', p, 'reason:', reason)
})
process.on('uncaughtException', err => {
  console.error(err)
  app.quit()
})

// --
// OSC Server
var oscServer = new osc.Server(4242, '0.0.0.0')
oscServer.on('message', function (msg, rinfo) {
  console.log('Incoming OSC message:' + msg)
  // console.log(msg)
  var addr = msg[0].split('/')
  // console.log(addr)
  if (addr[1] === 'button' && addr[3] === 'color' && streamDeck !== undefined) {
    streamDeck.drawColor(parseInt('0x' + msg[1]), parseInt(addr[2]))
  }
})

var qlabReplies = new osc.Server(53001, '0.0.0.0')
qlabReplies.on('message', function (msg, rinfo) {
  console.log('QLab Reply:' + msg)
})
