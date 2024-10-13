<template>
  <video ref="videoPlayer" class="video-js vjs-layout-tiny vjs-layout-x-small vjs-layout-small vjs-layout-medium vjs-layout-large vjs-layout-x-large vjs-layout-huge"></video>
</template>

<script>
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: "VideoPlayer",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.options, () => {
      // this.player.log('onPlayerReady', this);
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>
<style scoped>
.video-js >>> .vjs-mute-control {
  display: none;
}
</style>
