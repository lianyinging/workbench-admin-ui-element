<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <transition :enter-active-class="animateConfig.logoAnimate.enter" mode="out-in">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" alt="logo" />
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" alt="logo" />
        <div class="sidebar-logo-text">
          <h1 class="sidebar-title" :title="title">{{ title }}</h1>
          <p class="sidebar-subtitle">{{ subtitle }}</p>
        </div>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import animateConfig from '@/animate';
import logo from '@/assets/logo/logo.png';
import { NavTypeEnum } from '@/enums/NavTypeEnum';
import { useSettingsStore } from '@/store/modules/settings';

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
});

const title = import.meta.env.VITE_APP_LOGO_TITLE;
const subtitle = '管理控制台';
const settingsStore = useSettingsStore();
const sideTheme = computed(() => settingsStore.sideTheme);
const isTopNav = computed(() => settingsStore.navType === NavTypeEnum.TOP);
const isDarkSide = computed(() => !isTopNav.value && sideTheme.value === 'theme-dark');
const logoTextColor = computed(() => (isDarkSide.value ? '#f8fbff' : '#1f2937'));
const logoSubColor = computed(() => (isDarkSide.value ? 'rgba(226, 232, 240, 0.7)' : '#6b7280'));
const logoDivider = computed(() => (isDarkSide.value ? 'rgba(148, 163, 184, 0.18)' : 'var(--app-sidebar-border)'));
</script>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  flex-shrink: 0;
  height: 48px;
  margin: 0;
  padding: 0 14px;
  background: transparent;
  border-bottom: 1px solid v-bind(logoDivider);
  box-sizing: border-box;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex !important; // 覆盖侧栏全局 a { display: inline-block }
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 0;
    border: none;
    background: transparent;
    box-sizing: border-box;
    text-decoration: none;
    min-width: 0;
    overflow: hidden;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      border-radius: 6px;
      object-fit: cover;
      display: block;
    }
  }

  &.collapse {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .sidebar-logo-link {
      width: auto;
      justify-content: center;

      .sidebar-logo {
        width: 28px;
        height: 28px;
      }
    }
  }
}

.sidebar-logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.sidebar-title {
  margin: 0;
  color: v-bind(logoTextColor);
  font-weight: 600;
  line-height: 1.2;
  font-size: 14px;
  letter-spacing: 0;
  font-family: 'MiSans', 'HarmonyOS Sans SC', 'PingFang SC', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.sidebar-subtitle {
  margin: 0;
  color: v-bind(logoSubColor);
  font-size: 12px;
  line-height: 1.15;
  font-weight: 400;
  white-space: nowrap;
}
</style>
