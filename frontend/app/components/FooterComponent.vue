<script setup lang="ts">
</script>
<template>
  <footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
    <aside>
      <i class="fa-solid fa-utensils text-5xl"></i>
      <p>
        <strong>Forkcast Solutions</strong>
        <br />
        Planning meals since 2026
      </p>
    </aside>
    <nav>
      <h6 class="footer-title">Services</h6>
      <nuxt-link-locale to="/manual" class="link link-hover">Usage Manual</nuxt-link-locale>
      <nuxt-link-locale to="/documentation" class="link link-hover">Documentation</nuxt-link-locale>
      <nuxt-link-locale to="/faq" class="link link-hover">FAQ</nuxt-link-locale>
    </nav>
    <nav>
      <h6 class="footer-title">Company</h6>
      <nuxt-link-locale to="/about" class="link link-hover">About us</nuxt-link-locale>
      <nuxt-link-locale to="/contact" class="link link-hover">Contact</nuxt-link-locale>
      <nuxt-link-locale to="/source" class="link link-hover">Source</nuxt-link-locale>
    </nav>
    <nav>
      <h6 class="footer-title">Legal</h6>
      <nuxt-link-locale to="/terms-of-use" class="link link-hover">Terms of use</nuxt-link-locale>
      <nuxt-link-locale to="/privacy-policy" class="link link-hover">Privacy policy</nuxt-link-locale>
      <nuxt-link-locale to="/cookie-policy" class="link link-hover">Cookie policy</nuxt-link-locale>
    </nav>
  </footer>
</template>