'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
// const path = require('path')

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
    console.log('Send OSC Message: ' + key.osc.msg + ' - to: ' + key.osc.ip + ' - on port: ' + key.osc.port + ' - with args: ' + key.osc.args)
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
    width: 740,
    resizable: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

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
  // sendConfigToWebview()
  // console.log('config updated')
})
ipcMain.on('getConfig', (event, arg) => {
  sendConfigToWebview()
})

ipcMain.on('clearImage', (event, arg) => {
  myStreamDeck.clearKey(arg)
})
ipcMain.on('setFillColor', (event, arg) => {
  console.log('Set fill color for button: ' + arg['button'])
  myStreamDeck.fillColor(arg['button'], arg['r'], arg['g'], arg['b'])
})

function sendConfigToWebview () {
  mainWindow.webContents.send('updateConfig', config)
}
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
