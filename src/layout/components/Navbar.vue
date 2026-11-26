<template>
  <div class="navbar" :class="'nav' + navType">
    <div class="navbar-left">
      <div
        v-if="navType !== NavTypeEnum.TOP"
        class="hamburger-shell"
        title="双击打开布局设置"
        @dblclick.stop="emits('setLayout')"
      >
        <hamburger
          id="hamburger-container"
          :is-active="appStore.sidebar.opened"
          class="hamburger-container"
          @toggle-click="toggleSideBar"
        />
      </div>
      <router-link v-else-if="showLogo" to="/" class="navtop-logo-shell">
        <img :src="appLogo" class="navtop-logo-icon" alt="logo" />
      </router-link>

      <div v-if="navType !== NavTypeEnum.LEFT" class="nav-context">
        <top-nav v-if="navType == NavTypeEnum.MIX" id="topmenu-container" class="topmenu-container" />
        <template v-if="navType == NavTypeEnum.TOP">
          <top-bar id="topbar-container" class="topbar-container" />
        </template>
      </div>
    </div>

    <div class="right-menu">
      <div class="theme-switch">
        <el-switch
          v-model="lightMode"
          inline-prompt
          :active-icon="Sunny"
          :inactive-icon="Moon"
          :width="44"
        />
      </div>

      <el-dropdown
        class="lang-dropdown"
        trigger="click"
        placement="bottom-end"
        popper-class="navbar-lang-dropdown-popper"
        @command="handleLanguageChange"
      >
        <button type="button" class="lang-text">
          {{ languageLabel }}
          <el-icon class="lang-caret"><caret-bottom /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :disabled="appStore.language === 'zh_CN'" command="zh_CN">中文</el-dropdown-item>
            <el-dropdown-item :disabled="appStore.language === 'en_US'" command="en_US">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown
        class="user-dropdown"
        trigger="click"
        placement="bottom-end"
        popper-class="navbar-user-dropdown-popper"
        :popper-options="{ modifiers: [{ name: 'preventOverflow', options: { padding: 8 } }] }"
        @command="handleUserCommand"
      >
        <button type="button" class="user-trigger">
          <img :src="userStore.avatar" class="user-avatar" alt="avatar" />
          <span class="user-name">{{ displayName }}</span>
          <el-icon class="user-caret"><caret-bottom /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown-menu">
            <el-dropdown-item command="profile">
              <el-icon><user /></el-icon>
              <span>个人中心</span>
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><lock /></el-icon>
              <span>修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><switch-button /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ElMessageBoxOptions } from 'element-plus';
import { CaretBottom, Lock, Moon, Sunny, SwitchButton, User } from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import appLogo from '@/assets/logo/logo.png';
import { NavTypeEnum } from '@/enums/NavTypeEnum';
import { SideThemeEnum } from '@/enums/SideThemeEnum';
import tab from '@/plugins/tab';
import router from '@/router';
import { useAppStore } from '@/store/modules/app';
import { useSettingsStore } from '@/store/modules/settings';
import { useUserStore } from '@/store/modules/user';
import TopBar from './TopBar/index.vue';

const appStore = useAppStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { locale } = useI18n();

const navType = computed(() => settingsStore.navType);
const showLogo = computed(() => settingsStore.sidebarLogo);
const displayName = computed(() => userStore.name || userStore.nickname || 'admin');
const languageLabel = computed(() => (appStore.language === 'en_US' ? 'English' : '中文'));

const isDark = useDark({
  storageKey: 'useDarkKey',
  valueDark: 'dark',
  valueLight: 'light'
});
const toggleDark = useToggle(isDark);

const lightMode = computed({
  get: () => !isDark.value,
  set: value => {
    if (value === isDark.value) {
      toggleDark();
    }
  }
});

watch(isDark, dark => {
  settingsStore.sideTheme = dark ? SideThemeEnum.DARK : SideThemeEnum.LIGHT;
});

const handleLanguageChange = (lang: string) => {
  locale.value = lang;
  appStore.changeLanguage(lang);
  ElMessage.success(lang === 'en_US' ? 'Switch Language Successful!' : '切换语言成功！');
};

const emits = defineEmits(['setLayout']);

const toggleSideBar = () => {
  appStore.toggleSideBar(false);
};

const handleUserCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/user/profile');
    return;
  }
  if (command === 'password') {
    router.push({ path: '/user/profile', query: { tab: 'resetPwd' } });
    return;
  }
  if (command === 'logout') {
    logout();
  }
};

const logout = async () => {
  await ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  } as ElMessageBoxOptions);
  userStore.logout().then(() => {
    router.replace({
      path: '/login',
      query: {
        redirect: encodeURIComponent(router.currentRoute.value.fullPath || '/')
      }
    });
    tab.closeAllPage();
  });
};
</script>

<style lang="scss" scoped>
.navbar.navtop {
  .nav-context {
    flex: 1;
  }

  .navtop-logo-shell {
    width: 40px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .navtop-logo-icon {
    width: 28px;
    height: 28px;
    display: block;
    border-radius: var(--app-radius-sm);
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    margin-left: 0;
    padding: 4px 8px;
  }
}

.navbar {
  min-height: 48px;
  height: 48px;
  overflow: hidden;
  position: relative;
  background: var(--app-navbar-bg);
  border: none;
  border-bottom: 1px solid var(--app-navbar-border);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0;
  padding: 0 16px;
  box-sizing: border-box;

  .navbar-left {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 8px;
    flex: 1;
  }

  .hamburger-shell {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--app-radius-md);
    background: transparent;
    color: var(--app-text-title);
    flex-shrink: 0;
    border: none;
  }

  .hamburger-container {
    line-height: 32px;
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .nav-context {
    min-width: 0;
    display: flex;
    align-items: center;
  }

  .topmenu-container,
  .topbar-container {
    min-width: 0;
  }

  .right-menu {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    flex-shrink: 0;
  }
}

.theme-switch {
  display: inline-flex;
  align-items: center;
  height: 32px;
}

.lang-dropdown {
  outline: none;
}

.lang-text {
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--app-text-title);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  outline: none;

  &:hover {
    color: var(--app-accent-strong);
  }
}

.lang-caret {
  font-size: 12px;
  color: var(--app-text-muted);
}

.user-dropdown {
  outline: none;
}

.user-trigger {
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--app-text-title);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;

  &:hover {
    color: var(--app-accent-strong);

    .user-caret {
      color: var(--app-accent-strong);
    }
  }
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.user-name {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.user-caret {
  font-size: 12px;
  color: var(--app-text-muted);
}

.user-dropdown-menu {
  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>

<style lang="scss">
.navbar-user-dropdown-popper.el-dropdown__popper,
.navbar-lang-dropdown-popper.el-dropdown__popper {
  .el-dropdown-menu {
    padding: 2px !important;
    min-width: 88px !important;
    border-radius: 4px !important;
  }

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 24px !important;
    margin: 0 !important;
    padding: 2px 8px !important;
    line-height: 1.25 !important;
    border-radius: 2px !important;
    min-width: 0 !important;
    font-size: 13px !important;
  }

  .el-dropdown-menu__item--divided {
    margin-top: 2px !important;

    &::before {
      top: -2px !important;
    }
  }
}

.navbar-user-dropdown-popper.el-dropdown__popper .el-dropdown-menu {
  min-width: 120px !important;
}
</style>
