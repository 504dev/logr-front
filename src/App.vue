<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  position: absolute;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
