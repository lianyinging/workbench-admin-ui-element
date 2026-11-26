<template>
  <footer class="layout-footer">
    版权所有 © {{ yearRange }} {{ company }} 保留所有权利
  </footer>
</template>

<script setup lang="ts">
const company = import.meta.env.VITE_APP_COMPANY || '比特萝卜';
const yearRange = '2021-2026';
</script>

<style lang="scss" scoped>
.layout-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 16px;
  box-sizing: border-box;
  border-top: none;
  background: transparent;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  user-select: none;
}
</style>
