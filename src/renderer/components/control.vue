<template>
  <div id="controlPage">
    <div id="streamdeck" class="row">
      <div class="streamdeckLogo">Streamdeck</div>
      <div class="deckButtonRow">
        <deckButton id=4 v-on:selected="buttonSelected(4);" :config="config"></deckButton>
        <deckButton id=3 v-on:selected="buttonSelected(3);" :config="config"></deckButton>
        <deckButton id=2 v-on:selected="buttonSelected(2);" :config="config"></deckButton>
        <deckButton id=1 v-on:selected="buttonSelected(1);" :config="config"></deckButton>
        <deckButton id=0 v-on:selected="buttonSelected(0);" :config="config"></deckButton>
      </div>
      <div class="deckButtonRow">
        <deckButton id=9 v-on:selected="buttonSelected(9);" :config="config"></deckButton>
        <deckButton id=8 v-on:selected="buttonSelected(8);" :config="config"></deckButton>
        <deckButton id=7 v-on:selected="buttonSelected(7);" :config="config"></deckButton>
        <deckButton id=6 v-on:selected="buttonSelected(6);" :config="config"></deckButton>
        <deckButton id=5 v-on:selected="buttonSelected(5);" :config="config"></deckButton>
      </div>
      <div class="deckButtonRow">
        <deckButton id=14 v-on:selected="buttonSelected(14);" :config="config"></deckButton>
        <deckButton id=13 v-on:selected="buttonSelected(13);" :config="config"></deckButton>
        <deckButton id=12 v-on:selected="buttonSelected(12);" :config="config"></deckButton>
        <deckButton id=11 v-on:selected="buttonSelected(11);" :config="config"></deckButton>
        <deckButton id=10 v-on:selected="buttonSelected(10);" :config="config"></deckButton>
      </div>
  </div>
  <hr />
  <div class="row">
    <div id="buttonControl" class="from-group">
      Configuration for button: {{ button }}
      <hr />
      <label>Select Button Mode:</label>
      <select v-model="curMode">
        <option>OSC</option>
        <option>MIDI</option>
      </select>

      <br /><br />

      <div v-if="curMode == 'OSC'">
        <div class="input-group">
          <span class="input-group-addon" id="basic-addon1">OSC Command</span>
          <input type="text" class="form-control" v-model="curOSC">
        </div>
        <div class="input-group" style="margin-top: 10px;">
          <span class="input-group-addon" id="basic-addon1">Arguments</span>
          <input type="text" class="form-control" v-model="curOSCArgs">
        </div>
        <div class="input-group" style="width: 400px; margin-top: 10px; float: left; margin-right: 15px;">
          <span class="input-group-addon" id="basic-addon1">IP Address</span>
          <input type="text" class="form-control" v-model="curIp">
        </div>
        <div class="input-group" style="width: 210px; margin-top: 10px; margin-left: 5px;">
          <span class="input-group-addon" id="basic-addon1">Port</span>
          <input type="text" class="form-control" v-model="curPort">
        </div>
      </div>

      <div v-if="curMode == 'MIDI'">
        Like, so totally not implemented yet.
      </div>

      <hr />

      <button class="btn btn-primary" v-on:click="clearImage();">Clear Image</button>
      <button class="btn btn-primary" v-on:click="setFillColor(255, 0, 0);">Red</button>
      <button class="btn btn-primary" v-on:click="setFillColor(0, 255, 0);">Green</button>
      <button class="btn btn-primary" v-on:click="setFillColor(0, 0, 255);">Blue</button>

    </div>
  </div>
</div>
</template>

<script>
  import deckButton from './deckButton'
  const {ipcRenderer} = require('electron')

  var conf = {}
  for (var i = 0; i < 15; i++) {
    conf[i] = {
      'osc': '/cue/' + i + '/start',
      'ip': '127.0.0.1',
      'port': '53000',
      'args': '',
      'pressed': false
    }
  }

  export default {
    name: 'control',
    components: { deckButton },
    data: function () {
      return {
        button: 0,
        curOSC: '',
        curPort: '',
        curIp: '',
        curOSCArgs: '',
        curMode: 'OSC',
        config: conf
      }
    },
    watch: {
      curOSC: function (val) {
        this.config[this.button]['osc'] = val
        this.sendConfigToMain()
      },
      curOSCArgs: function (val) {
        this.config[this.button]['args'] = val
        this.sendConfigToMain()
      },
      curPort: function (val) {
        this.config[this.button]['port'] = val
        this.sendConfigToMain()
      },
      curIp: function (val) {
        this.config[this.button]['ip'] = val
        this.sendConfigToMain()
      },
      curMode: function (val) {
        this.config[this.button]['mode'] = val
        this.sendConfigToMain()
      },
      config: function (val) {
        this.curOSC = val[this.button]['osc']
        this.curIp = val[this.button]['ip']
        this.curPort = val[this.button]['port']
        this.curMode = val[this.button]['mode']
      }
    },
    methods: {
      buttonSelected (btn) {
        console.log('Selected button: ' + btn)
        this.button = btn
        this.curOSC = this.config[btn]['osc']
        this.curIp = this.config[btn]['ip']
        this.curPort = this.config[btn]['port']
      },
      sendConfigToMain () {
        this.$electron.ipcRenderer.send('setConfig', this.config)
      },
      setMode (val) {
        this.curMode = val
        this.config[this.button]['mode'] = val
        this.sendConfigToMain()
      },
      clearImage () {
        this.$electron.ipcRenderer.send('clearImage', this.button)
      },
      setFillColor (r, g, b) {
        this.$electron.ipcRenderer.send('setFillColor', {'button': this.button, 'r': r, 'g': g, 'b': b})
      }
    },
    created () {
      ipcRenderer.on('updateConfig', (event, arg) => {
        this.config = arg
      })
      ipcRenderer.send('getConfig', {})
    }

  }
</script>

<style>

  body { font-family: 'Verdana', sans-serif; }


#streamdeck {
  border: 5px solid black;
  width: 640px;
  height: 390px;
  border-radius: 25px;
  padding: 15px;
  margin: auto;
  margin-top: 20px;
  background: -webkit-radial-gradient(center, ellipse cover, rgba(75,75,75,1) 0%,rgba(25,25,25,1) 100%);
}

#buttonControl {
  padding: 15px;
  width: 660px;
  margin: auto;
  border: 2px solid black;
  border-radius: 20px;
}

.deckButtonRow {
  width: 640px;
  margin-top: 5px;
}

.streamdeckLogo {
  color: #ccc;
  text-align: center;
  font-weight: bold;
}

</style>
