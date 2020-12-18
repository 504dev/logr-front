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

<style lang="scss">
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  position: absolute;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

select,
input,
button {
  display: inline-block;
  box-sizing: border-box;
  vertical-align: top;
  width: 100%;
  max-width: 200px;
  height: 30px;
  line-height: 28px;
  font-size: 13px;
  background-color: white;
  margin: 0;
  padding: 0 10px;
  border: solid 1px #999;
  border-bottom-width: 2px;
  border-radius: 4px;
  outline: none;
  &.selected {
    border-color: black;
    color: black;
  }
}

input:focus {
  border-bottom: solid 2px green;
}

select {
  color: #777;
}

@font-face {
  font-family: "Logr";
  src: url(../static/fonts/Logr.ttf) format("truetype");
}
</style>
