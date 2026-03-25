import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type ThemeColor = 'green' | 'blue' | 'orange' | 'purple' | 'cyan' | 'red' | 'pink' | 'yellow' | 'gray' | 'brown';
export type ThemeMode = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light');
  const color = ref<ThemeColor>('green');
  const showSetting = ref(false);

  const init = () => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedColor = localStorage.getItem('theme-color') as ThemeColor;
    if (savedMode) mode.value = savedMode;
    if (savedColor) color.value = savedColor;
    applyTheme();
  };

  const applyTheme = () => {
    const html = document.documentElement;
    if (mode.value === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    html.classList.remove('theme-blue', 'theme-orange', 'theme-purple', 'theme-cyan', 'theme-red', 'theme-pink', 'theme-yellow', 'theme-gray', 'theme-brown');
    if (color.value !== 'green') {
      html.classList.add(`theme-${color.value}`);
    }
  };

  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode;
    localStorage.setItem('theme-mode', newMode);
    applyTheme();
  };

  const setColor = (newColor: ThemeColor) => {
    color.value = newColor;
    localStorage.setItem('theme-color', newColor);
    applyTheme();
  };

  const toggleMode = () => {
    setMode(mode.value === 'dark' ? 'light' : 'dark');
  };

  const openSetting = () => {
    showSetting.value = true;
  };

  const closeSetting = () => {
    showSetting.value = false;
  };

  watch([mode, color], applyTheme);

  return { mode, color, showSetting, init, setMode, setColor, toggleMode, openSetting, closeSetting };
});
