<template>
  <n-menu :options="menuOptions" default-value="home" />
</template>

<script setup>
import { h } from "vue";
import { RouterLink } from "vue-router";
import { NIcon } from "naive-ui";
import { Home as HomeIcon, Playlist as PlaylistIcon, Cloud as CloudIcon } from "@vicons/carbon";

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "home"
          }
        },
        { default: () => "首页" }
      ),
    key: "home",
    icon: renderIcon(HomeIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "playlist"
          }
        },
        { default: () => "歌单" }
      ),
    key: "playlist",
    icon: renderIcon(PlaylistIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "cloud"
          }
        },
        { default: () => "云盘" }
      ),
    key: "cloud",
    icon: renderIcon(CloudIcon)
  }
];
</script>
