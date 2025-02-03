<template>
  <div class="home">
    <n-card v-if="userStore.cookie" title="用户信息">
      <n-space vertical>
        <n-space align="center">
          <n-avatar round :size="80" :src="userStore.profile.avatarUrl" />
          <n-space vertical>
            <n-text strong style="font-size: 20px">{{ userStore.profile.nickname }}</n-text>
            <n-text depth="3">用户ID: {{ userStore.account.id }}</n-text>
          </n-space>
        </n-space>

        <n-divider />

        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-space vertical>
              <n-text strong>最近播放</n-text>
              <n-spin :show="recentPlaysLoading">
                <n-list>
                  <n-list-item v-for="item in recentPlays" :key="item.id">
                    <n-space align="center">
                      <n-image :src="item.picUrl" width="50" height="50" />
                      <n-space vertical>
                        <n-text>{{ item.name }}</n-text>
                        <n-text depth="3" style="font-size: 12px">{{ item.artists }}</n-text>
                      </n-space>
                    </n-space>
                  </n-list-item>
                </n-list>
              </n-spin>
            </n-space>
          </n-gi>
          <n-gi>
            <!-- 这里可以放置其他内容 -->
          </n-gi>
        </n-grid>
      </n-space>
    </n-card>

    <n-alert v-else type="info" title="提示">
      请先登录以查看您的个人信息
    </n-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import * as userApi from "@/api/user";
import { NAvatar, NText, NSpace, NCard, NDivider, NList, NListItem, NImage, NAlert, NSpin, NGrid, NGi } from "naive-ui";

const userStore = useUserStore();

// 最近播放
const recentPlays = ref([]);
const recentPlaysLoading = ref(false);

// 获取歌手名称
function getArtistName(artists) {
  if (!artists) return "";
  return artists.map(artist => artist.name).join(" / ");
}

// 获取最近播放
async function getRecentPlays() {
  recentPlaysLoading.value = true;
  try {
    const result = await userApi.getRecentPlays();
    console.log("最近播放数据:", result); // 调试用
    if (result.data && result.data.list) {
      recentPlays.value = result.data.list
        .slice(0, 5)
        .map(item => ({
          id: item.data.id,
          name: item.data.name,
          picUrl: item.data.al?.picUrl || "",
          artists: getArtistName(item.data.ar) // 获取歌手信息
        }));
    }
  } catch (err) {
    console.error("获取最近播放失败", err);
  } finally {
    recentPlaysLoading.value = false;
  }
}

onMounted(() => {
  if (userStore.cookie) {
    getRecentPlays();
  }
});
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;

  .n-card {
    border-radius: 8px;
  }

  .n-list {
    /* 去掉 max-height 和 overflow-y */
  }
}
</style>
