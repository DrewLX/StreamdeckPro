<template>
  <div class="deckButton" :class="{pressed: pressed, selected: selected}">
    <div class="deckButtonLabel" v-on:click="selectButton(id);">{{ id }}</div>
  </div>
</template>

 <script>
   export default {
     props: {
       id: {
         type: String,
         default: '?'
       },
       buttSelected: {
         type: Number,
         default: 0
       },
       config: {
         type: Array
       }
     },
     computed: {
       pressed: function () {
         if (this.config[this.id].pressed) {
           return true
         } else {
           return false
         }
       },
       selected: function () {
         if (this.buttSelected === parseInt(this.id)) {
           return true
         } else {
           return false
         }
       }
     },
     methods: {
       selectButton: function (btn) {
         this.$emit('selected')
       }
     }
   }
</script>

<style scoped>
  .deckButton {
    float: left;
    border: 2px solid #800;
    width: 100px;
    height: 100px;
    font-size: 60px;
    font-weight: bolder;
    text-align: center;
    vertical-align: middle;
    background: -webkit-radial-gradient(center, ellipse cover, rgba(50,0,0,0.5) 0%,rgba(0,0,0,0) 100%);
    border-radius: 15px;
    letter-spacing: .25px;
    margin: 5px;
    margin-left: 15px;
    color: #c00 ;
  }

  .deckButton:hover {
    border: 2px solid #c00;
    background: -webkit-radial-gradient(center, ellipse cover, rgba(169,3,41,1) 0%,rgba(143,2,34,1) 44%,rgba(109,0,25,1) 100%);
    color: white;
  }

  .deckButtonLabel {
    margin-top: 0px;
    margin-bottom: 0px;
  }
  .pressed {
    border: 2px solid white;
    color: white;
  }
  .selected {
    border: 2px solid #337ab7;
  }

</style>
