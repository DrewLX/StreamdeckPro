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
      <h4>Configuration for button: {{ button }}</h4>
      <hr />
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
        <div class="input-group" style="width: 210px; margin-top: 10px; margin-left: 5px;">
          <span class="input-group-addon" id="basic-addon1">Port</span>
          <input type="text" class="form-control" v-model="current.osc.port">
        </div>
      </div>

      <div v-if="current.mode == 'MIDI'">
        Like, so totally not implemented yet.
        {{ config }}
      </div>

      <br />

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

  var conf = [{}]
  for (var i = 0; i < 15; i++) {
    conf[i] = {
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

  export default {
    name: 'control',
    components: { deckButton },
    data: function () {
      return {
        button: 0,
        current: conf[0],
        config: conf
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
        console.log('Selected button: ' + btn)
        this.button = btn
        this.current = this.config[btn]
      },
      saveButton () {
        this.config[this.button] = this.current
        this.sendConfigToMain()
      },
      sendConfigToMain () {
        this.$electron.ipcRenderer.send('setConfig', this.config)
        console.log('Sending config to main')
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
        this.current = arg[this.button]
        // console.log('Config updated from main js')
      })

      ipcRenderer.send('getConfig', {})
      console.log('Request for initial config made')
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
