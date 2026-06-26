// Apply the saved theme before mount so there's no flash of the default theme.
export default defineNuxtPlugin(() => {
  useTheme().init();
});
