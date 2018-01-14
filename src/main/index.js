'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
const {dialog} = require('electron')
const path = require('path')
const Store = require('electron-store')
const store = new Store()

const StreamDeck = require('elgato-stream-deck')
var osc = require('node-osc')

const myStreamDeck = new StreamDeck()
myStreamDeck.setBrightness(100)

myStreamDeck.on('down', keyIndex => {
  var key = config[keyIndex]

  if (key.mode === 'OSC') {
    var client = new osc.Client(key.osc.ip, key.osc.port)
    client.send(key.osc.msg, key.osc.args, function () {
      client.kill()
    })
    console.log('Sent OSC Message: ' + key.osc.msg + ' - to: ' + key.osc.ip + ' - on port: ' + key.osc.port + ' - with args: ' + key.osc.args)
  }

  config[keyIndex]['pressed'] = true
  sendConfigToWebview()
})

myStreamDeck.on('up', keyIndex => {
  config[keyIndex]['pressed'] = false
  sendConfigToWebview()
})

myStreamDeck.on('error', error => {
  console.error(error)
})

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
  /**
   * Initial window options
   */
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

  if (store.has('config')) {
    config = store.get('config')
    console.log('Config loaded from store')
  } else {
    for (var i = 0; i < 15; i++) {
      config[i] = {
        pressed: false,
        mode: 'OSC',
        osc: {
          ip: '127.0.0.1',
          port: '53000',
          args: '',
          msg: '/cue/' + i + '/start'
        }
      }
    }
  }

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

ipcMain.on('clearImage', (event, arg) => {
  myStreamDeck.clearKey(arg)
})
ipcMain.on('setFillColor', (event, arg) => {
  // console.log('Set fill color for button: ' + arg['button'])
  myStreamDeck.fillColor(arg['button'], arg['r'], arg['g'], arg['b'])
})
ipcMain.on('pickImage', (event, arg) => {
  var file = dialog.showOpenDialog({title: 'Select Image', properties: ['openFile'], filters: [{name: 'Images', extensions: ['jpg', 'png']}]})
  console.log('File picked for button ' + arg.button + ' - ' + file)
  myStreamDeck.fillImageFromFile(arg.button, String(file)).then(() => {
    console.log('Successfully wrote a logo')
  }).catch(err => {
    console.error(err)
  })
  // myStreamDeck.fillColor(arg['button'], arg['r'], arg['g'], arg['b'])
})

function sendConfigToWebview () {
  mainWindow.webContents.send('updateConfig', config)
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
