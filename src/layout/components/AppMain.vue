<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition :enter-active-class="animate" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component :is="Component" v-if="!isIframeLink(route.meta.link)" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
    <iframe-toggle />
  </section>
</template>

<script setup name="AppMain" lang="ts">
import animateConfig from '@/animate';
import { useFullHeightTable } from '@/hooks/table/useFullHeightTable';
import { useSettingsStore } from '@/store/modules/settings';
import { useTagsViewStore } from '@/store/modules/tagsView';
import { isHttp } from '@/utils/validate';
import IframeToggle from './IframeToggle/index.vue';

const route = useRoute();
const tagsViewStore = useTagsViewStore();
useFullHeightTable();

const isIframeLink = (link: unknown) => typeof link === 'string' && isHttp(link);

// 随机动画集合
const animate = ref<string>('');
watch(
  () => useSettingsStore().animationEnable,
  (val: boolean) => {
    if (val) {
      animate.value = animateConfig.animateList[Math.floor(Math.random() * animateConfig.animateList.length)] as string;
    } else {
      animate.value = animateConfig.defaultAnimate as string;
    }
  },
  { immediate: true }
);

watchEffect(() => {
  addIframe();
});

function addIframe() {
  if (isIframeLink(route.meta.link)) {
    useTagsViewStore().addIframeView(route);
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  flex: 1 1 auto;
  min-height: calc(100vh - 40px);
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 12px;

  &:fullscreen,
  &:-webkit-full-screen,
  &:-moz-full-screen,
  &:-ms-fullscreen {
    background: var(--el-bg-color);
    overflow-y: auto;
  }
}

.app-main:not(.with-fixed-header) {
  min-height: calc(100vh - 64px - 40px);
}

.app-main.with-tags-view:not(.with-fixed-header) {
  min-height: calc(100vh - 105px - 40px);
}

.app-main.with-fixed-header {
  // 顶栏 48 + 内容间距 12；预留页脚 40
  padding-top: 60px;
  min-height: calc(100vh - 48px - 40px);
}

.app-main.with-fixed-header.with-tags-view {
  // 顶栏 48 + TagsView 38 + 内容间距 12；预留页脚 40
  min-height: calc(100vh - 86px - 40px);
  padding-top: 98px;
}
</style>
<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 6px;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: var(--el-fill-color-lighter);
}

::-webkit-scrollbar-thumb {
  background-color: var(--el-text-color-placeholder);
  border-radius: 999px;
}
</style>
