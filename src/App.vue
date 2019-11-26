<template>
  <div id="app">
    <Manufacturer></Manufacturer>
    <Wholesaler></Wholesaler>
    <Pharmacy></Pharmacy>
    <Patient></Patient>
  </div>
</template>

<script>

import Manufacturer from '@/components/Manufacturer'
import Wholesaler from '@/components/Wholesaler'
import Pharmacy from '@/components/Pharmacy'
import Patient from '@/components/Patient'

export default {
  name: 'app',
  components: {
    Admin,
    Organization,
    Doctor,
    Patient
  },
  created () {
  }
}

</script>

<style>

body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

h3 {
  padding-top: 7px;
  color: rgb(116, 224, 223) !important;
}

input {
  background-color: rgb(73, 73, 73) !important;
  color: white !important;
}

select {
  background-color: rgb(73, 73, 73) !important;
  color: white !important;
}

::placeholder {
  color: white !important;
  opacity: 0.6 !important;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.tree-view-item-key {
  color: #00ff00;
}

.tree-view-item {
  color: #ffffff;
}

.component-container {
  border: 0.5px solid rgb(73, 73, 73);
  width: 50vw;
  height: 50vh;
  box-sizing: border-box;
  background-color: rgba(23, 23, 23, 1);
}

.expand-panel {
  transition: height 500ms, width 500ms;
  z-index: 9999999;
}

.component-inner-container {
  padding: 20px;
}

.reactive-list {
  height: calc(50vh - 60px);
  overflow: scroll;
}

.top-div {
  height: 110px;
}

.component-shell-container {
  padding: 20px;
  background-color: rgba(73, 73, 73, 1);
  margin-left: 20px;
  margin-right: 20px;
  height: calc(50vh - 158px);
  overflow: scroll;
  text-align: left;
}

</style>
