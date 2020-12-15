<template>
  <div class="logo">
    <!--    <img class="template" src="/static/logr.png" />-->
    <template v-if="pattern.includes('l')">
      <div class="letter l"></div>
      <div class="letter l-u"></div>
    </template>

    <template v-if="pattern.includes('o')">
      <div class="letter o"></div>
    </template>

    <template v-if="pattern.includes('g')">
      <div class="letter g"></div>
      <div class="letter g-u"></div>
    </template>

    <template v-if="pattern.includes('r')">
      <div class="letter r"></div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    pattern: { type: String, default: 'logr' }
  }
}
</script>

<style scoped lang="scss">
.logo {
  display: inline-block;
  position: relative;
  width: 128px;
  height: 128px;
  img.template {
    width: 128px;
    height: 128px;
    outline: dashed 1px red;
  }
  .letter {
    border: solid 10px black;
  }
  .o,
  .g {
    position: absolute;
    display: block;
    top: 39px;
    width: 32px;
    height: 32px;
    border-radius: 32px;
  }
  .o {
    left: 17px;
  }
  .g {
    left: 60px;
  }
  .g-u {
    position: absolute;
    display: block;
    top: 89px;
    left: 73px;
    width: 16px;
    height: 16px;
    border-left: none;
    border-top: none;
    border-bottom-right-radius: 32px;
    transform: rotate(45deg);
  }
  .r {
    position: absolute;
    display: block;
    top: 39px;
    left: 102px;
    width: 16px;
    height: 16px;
    border-right: none;
    border-bottom: none;
    border-top-left-radius: 32px;
  }
  .l {
    position: absolute;
    display: block;
    top: 19px;
    left: 0;
    width: 0;
    height: 58px;
    border-left: none;
    border-top: none;
    border-bottom: none;
  }
  .l-u {
    position: absolute;
    display: block;
    top: 77px;
    left: 0;
    width: 16px;
    height: 16px;
    border-right: none;
    border-top: none;
    border-bottom-left-radius: 32px;
  }
}
</style>
