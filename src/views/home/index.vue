<template>
  <n-spin :show="loading">
    <div class="home">
      <n-card v-if="userStore.cookie" title="用户信息" class="user-info-card">
        <div class="user-info-container">
          <!-- 左侧：用户头像、昵称、ID -->
          <div class="user-info-left">
            <n-avatar round :size="80" :src="userStore.profile.avatarUrl" />
            <n-space vertical align="center">
              <n-text strong style="font-size: 20px">{{ userStore.profile.nickname }}</n-text>
              <n-text depth="3">用户ID: {{ userStore.account.id }}</n-text>
            </n-space>
          </div>

          <!-- 右侧：用户等级和社交信息 -->
          <div class="user-info-right">
            <n-space vertical>
              <n-text>等级: {{ userLevel }}</n-text>
              <n-text>关注数: {{ followCount }}</n-text>
              <n-text>粉丝数: {{ fansCount }}</n-text>
            </n-space>
          </div>
        </div>
      </n-card>

      <n-card v-if="userStore.cookie" title="最近播放" class="recent-plays-card">
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
      </n-card>

      <n-alert v-else type="info" title="提示">
        请先登录以查看您的个人信息
      </n-alert>
    </div>
  </n-spin>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import * as userApi from "@/api/user";
import { NAvatar, NText, NSpace, NCard, NDivider, NList, NListItem, NImage, NAlert, NSpin } from "naive-ui";

const userStore = useUserStore();

// 用户等级
const userLevel = ref(0);

// 社交信息
const followCount = ref(0);
const fansCount = ref(0);

// 最近播放
const recentPlays = ref([]);

// 加载状态
const loading = ref(false);

// 获取用户等级和社交信息
async function getUserDetail() {
  try {
    const result = await userApi.getUserDetail(userStore.account.id);
    console.log("用户详情数据:", result); // 调试用
    if (result.level) {
      userLevel.value = result.level;
    }
    if (result.profile) {
      followCount.value = result.profile.follows || 0;
      fansCount.value = result.profile.followeds || 0;
    }
  } catch (err) {
    console.error("获取用户详情失败", err);
  }
}

// 获取歌手名称
function getArtistName(artists) {
  if (!artists) return "";
  return artists.map(artist => artist.name).join(" / ");
}

// 获取最近播放
async function getRecentPlays() {
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
  }
}

onMounted(async () => {
  if (userStore.cookie) {
    loading.value = true;
    try {
      await Promise.all([getUserDetail(), getRecentPlays()]);
    } catch (err) {
      console.error("初始化数据失败", err);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .user-info-card,
  .recent-plays-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .user-info-card {
    background-color: var(--color-background-light);

    .user-info-container {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .user-info-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .user-info-right {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }

  .recent-plays-card {
    background-color: var(--color-background-light);
  }
}
</style>
