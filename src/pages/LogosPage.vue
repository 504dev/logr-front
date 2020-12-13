<template>
  <div class="container">
    <div class="logo logr-single white-black"><span>logr</span></div>
    <div class="logo logr-single white-wheat"><span>logr</span></div>
    <div class="logo logr-single black-white"><span>logr</span></div>
    <div class="logo logr-single black-wheat"><span>logr</span></div>
    <div class="logo logr-single wheat-black"><span>logr</span></div>
    <div class="logo logr-single wheat-white"><span>logr</span></div>
    <br />
    <div class="logo logr-single white-black"><span>logr.</span></div>
    <div class="logo logr-single white-wheat"><span>logr.</span></div>
    <div class="logo logr-single black-white"><span>logr.</span></div>
    <div class="logo logr-single black-wheat"><span>logr.</span></div>
    <div class="logo logr-single wheat-black"><span>logr.</span></div>
    <div class="logo logr-single wheat-white"><span>logr.</span></div>
    <br />
    <div class="logo lo-gr white-black"><span>lo</span><br /><span>gr</span></div>
    <div class="logo lo-gr white-wheat"><span>lo</span><br /><span>gr</span></div>
    <div class="logo lo-gr black-white"><span>lo</span><br /><span>gr</span></div>
    <div class="logo lo-gr black-wheat"><span>lo</span><br /><span>gr</span></div>
    <div class="logo lo-gr wheat-black"><span>lo</span><br /><span>gr</span></div>
    <div class="logo lo-gr wheat-white"><span>lo</span><br /><span>gr</span></div>
    <br />
    <div class="logo lgr white-wheat"><span>lo</span><span>gr</span></div>
    <div class="logo lgr white-gray"><span>lo</span><span>gr</span></div>
    <div class="logo lgr wheat-white"><span>lo</span><span>gr</span></div>
    <div class="logo lgr gray-wheat"><span>lo</span><span>gr</span></div>
    <br />
    <div class="logo logr-info white-black-wheat"><span>logr.</span><span>info</span></div>
    <div class="logo logr-info black-white-wheat"><span>logr.</span><span>info</span></div>
    <div class="logo logr-info wheat-white-black"><span>logr.</span><span>info</span></div>
    <div class="logo logr-info gray-black-wheat"><span>logr.</span><span>info</span></div>
    <br />
    <div class="logo logr-info dia white-black-wheat">
      <span>logr<span>.</span></span
      ><span>info</span>
    </div>
    <div class="logo logr-info dia black-white-wheat">
      <span>logr<span>.</span></span
      ><span>info</span>
    </div>
    <div class="logo logr-info dia wheat-white-black">
      <span>logr<span>.</span></span
      ><span>info</span>
    </div>
    <div class="logo logr-info dia gray-black-wheat">
      <span>logr<span>.</span></span
      ><span>info</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  margin: 50px;
  text-align: center;
}
.logo {
  box-sizing: border-box;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  /*font-family: Arial,sans-serif;*/
  font-weight: bold;
  letter-spacing: -5px;
  text-align: center;
  display: inline-block;
  width: 128px;
  height: 128px;
  font-size: 64px;
  line-height: 128px;
  margin: 100px 20px;
  overflow: hidden;
}
.logr-single {
  padding-right: 2px;
}
.stuck {
  padding-right: 2px;
  letter-spacing: -8px;
}
.lo-gr {
  position: relative;
  padding-top: 25px;
  line-height: 36px;
  span:nth-child(1) {
    //
  }
  span:nth-child(3) {
    margin-right: 3px;
  }
}
.lgr {
  padding-left: -20px;
  span:nth-child(1) {
    color: #111;
    margin-left: -24px;
  }
  span:nth-child(2) {
    position: absolute;
    margin-left: -26px;
    margin-top: 2px;
  }
}
.white-black {
  background-color: white;
  color: #111;
  outline: solid 1px #111;
}
.white-wheat {
  background-color: white;
  color: wheat;
  outline: solid 1px wheat;
}
.white-gray {
  background-color: white;
  color: #eee;
  outline: solid 1px #eee;
}
.black-white {
  background-color: #111;
  color: white;
}
.black-wheat {
  background-color: #111;
  color: wheat;
}
.wheat-black {
  background-color: wheat;
  color: black;
}
.wheat-white {
  background-color: wheat;
  color: white;
}
.gray-wheat {
  background-color: #eee;
  color: wheat;
}
.logr-info {
  width: 256px;
}
.white-black-wheat {
  background-color: white;
  color: #111;
  outline: solid 1px #eee;
  span:nth-child(2) {
    color: wheat;
  }
}
.black-white-wheat {
  background-color: #111;
  color: white;
  span:nth-child(2) {
    color: wheat;
  }
}
.wheat-white-black {
  background-color: wheat;
  color: #111;
  span:nth-child(2) {
    color: white;
  }
}
.gray-black-wheat {
  background-color: #eee;
  color: #111;
  span:nth-child(2) {
    color: wheat;
  }
}
.dia {
  position: relative;
  > span:nth-child(1) {
    position: absolute;
    top: -17px;
    left: 34px;
    z-index: 99999;
    > span {
      color: gray;
      /*display: none;*/
    }
  }
  > span:nth-child(2) {
    position: absolute;
    top: 20px;
  }
}
</style>
