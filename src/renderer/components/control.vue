<template>
  <div id="controlPage">
    <div id="streamdeck" class="row">
      <div class="streamdeckLogo">STREAMDECK PRO</div>
      <div class="online" v-if="online">ONLINE</div>
      <div class="offline" v-if="!online">OFFLINE</div>
      <div class="deckButtonRow">
        <deckButton id=1 v-on:selected="buttonSelected(1);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=2 v-on:selected="buttonSelected(2);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=3 v-on:selected="buttonSelected(3);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=4 v-on:selected="buttonSelected(4);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=5 v-on:selected="buttonSelected(5);" :config="config" :buttSelected="button"></deckButton>
      </div>
      <div class="deckButtonRow">
        <deckButton id=6 v-on:selected="buttonSelected(6);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=7 v-on:selected="buttonSelected(7);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=8 v-on:selected="buttonSelected(8);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=9 v-on:selected="buttonSelected(9);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=10 v-on:selected="buttonSelected(10);" :config="config" :buttSelected="button"></deckButton>
      </div>
      <div class="deckButtonRow">
        <deckButton id=11 v-on:selected="buttonSelected(11);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=12 v-on:selected="buttonSelected(12);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=13 v-on:selected="buttonSelected(13);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=14 v-on:selected="buttonSelected(14);" :config="config" :buttSelected="button"></deckButton>
        <deckButton id=15 v-on:selected="buttonSelected(15);" :config="config" :buttSelected="button"></deckButton>
      </div>
  </div>
  <hr />
  <div class="panel panel-primary form-group">

    <div class="panel-heading">Configuration for button: {{ button }}</div>
    <div class="panel-body">

      <label>Select Button Mode:</label>
      <select v-model="current.mode">
        <option>OSC</option>
        <option>MIDI</option>
      </select>

      <br /><br />

      <div v-if="this.current.mode == 'OSC'">
        <div class="input-group">
          <span class="input-group-addon" id="basic-addon1">OSC Command</span>
          <input type="text" class="form-control" v-model="current.osc.msg">
        </div>
        <div class="input-group" style="margin-top: 10px;">
          <span class="input-group-addon" id="basic-addon1">Arguments</span>
          <input type="text" class="form-control" v-model="current.osc.args">
        </div>
        <div class="input-group" style="width: 400px; margin-top: 10px; float: left; margin-right: 15px;">
          <span class="input-group-addon" id="basic-addon1">IP Address</span>
          <input type="text" class="form-control" v-model="current.osc.ip">
        </div>
        <div class="input-group" style="width: 200px; margin-top: 10px; margin-left: 5px;">
          <span class="input-group-addon" id="basic-addon1">Port</span>
          <input type="text" class="form-control" v-model="current.osc.port">
        </div>
      </div>


      <div v-if="current.mode == 'QLab'">
        <label>QLab Button Type:</label>
        <select v-model="current.qlab.type">
          <option value="system">System</option>
          <option value="cue">Cue</option>
        </select>

        <div v-if="current.qlab.type == 'cue'">
          <div class="input-group" style="margin-top: 10px;">
            <span class="input-group-addon" id="basic-addon1">Cue Number</span>
            <input type="text" class="form-control" v-model="current.qlab.cue">
          </div>
        </div>
        <br /><br />
        <div v-if="current.qlab.type == 'system'">
          <label>System Function: </label>
          <select v-model="current.qlab.system">
            <option value="/go">Go</option>
            <option value="/panic">Panic</option>
            <option value="/playhead/next">Playhead Next</option>
            <option value="/playhead/prev">Playhead Previous</option>
          </select>
        </div>
      </div>

      <div v-if="current.mode == 'MIDI'">
        Not implemented yet. Soz.
      </div>

      <hr />

      <button class="btn btn-primary" v-on:click="setFillColor('0x000000');">Clear Image</button>
      <button class="btn btn-primary" v-on:click="setFillColor('0xFF0000');">Red</button>
      <button class="btn btn-primary" v-on:click="setFillColor('0x00FF00');">Green</button>
      <button class="btn btn-primary" v-on:click="setFillColor('0x0000FF');">Blue</button>
      <button class="btn btn-primary" v-on:click="setFillColor('0xFFFFFF');">White</button>

      <button class="btn btn-primary" v-on:click="pickImage();">Pick Image</button>

    </div>
  </div>
</div>
</template>

<script>
  import deckButton from './deckButton'
  const {ipcRenderer} = require('electron')

  var conf = [{}]
  for (var i = 0; i < 16; i++) {
    conf[i] = {
      pressed: false,
      mode: 'OSC',
      osc: {
        ip: '127.0.0.1',
        port: '53000',
        args: '',
        msg: '/cue/' + i + '/start'
      },
      qlab: {
        type: 'system',
        cue: i,
        system: '/go'
      }
    }
  }

  export default {
    name: 'control',
    components: { deckButton },
    data: function () {
      return {
        button: 1,
        current: conf[1],
        config: conf,
        online: false
      }
    },
    watch: {
      current: {
        handler: function (val) {
          this.config[this.button] = val
          this.sendConfigToMain()
        },
        deep: true
      }
    },
    methods: {
      buttonSelected (btn) {
        // console.log('Selected button: ' + btn)
        this.button = btn
        this.current = this.config[btn]
      },
      sendConfigToMain () {
        this.$electron.ipcRenderer.send('setConfig', this.config)
        // console.log('Sending config to main')
      },
      setFillColor (color) {
        this.$electron.ipcRenderer.send('setFillColor', {button: this.button, color: color})
      },
      pickImage () {
        this.$electron.ipcRenderer.send('pickImage', {button: this.button})
      }
    },
    created () {
      ipcRenderer.on('updateConfig', (event, arg) => {
        this.config = arg
        this.current = arg[this.button]
      })
      ipcRenderer.on('setOnline', (event, arg) => {
        this.online = arg
      })

      ipcRenderer.send('getConfig', {})
      console.log('Request for initial config made')
    }

  }
</script>

<style>

body {
  font-family: 'Verdana', sans-serif;
}

#streamdeck {
  border: 5px solid black;
  width: 640px;
  height: 390px;
  border-radius: 25px;
  padding: 15px;
  margin: auto;
  margin-top: 20px;
  background: -webkit-radial-gradient(center, ellipse cover, rgba(75,75,75,1) 0%,rgba(25,25,25,1) 100%);
  user-select: none;
  cursor: default;
}

.deckButtonRow {
  width: 640px;
  margin-top: 5px;
}

.streamdeckLogo {
  color: #ccc;
  width: 300px;
  padding-left: 15px;
  font-weight: bold;
  float: left;
}

.online {
  width: 250px;
  float: right;
  padding-right: 15px;
  color: #29b40d;
  font-weight: bold;
  text-align: right;
}
.offline {
  width: 250px;
  float: right;
  padding-right: 15px;
  color: #d20909;
  font-weight: bold;
  text-align: right;
}
</style>
