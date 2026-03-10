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
      <NuxtLink to="/manual" class="link link-hover">Usage Manual</NuxtLink>
      <NuxtLink to="/documentation" class="link link-hover">Documentation</NuxtLink>
      <NuxtLink to="/faq" class="link link-hover">FAQ</NuxtLink>
    </nav>
    <nav>
      <h6 class="footer-title">Company</h6>
      <NuxtLink to="/about" class="link link-hover">About us</NuxtLink>
      <NuxtLink to="/contact" class="link link-hover">Contact</NuxtLink>
      <NuxtLink to="/source" class="link link-hover">Source</NuxtLink>
    </nav>
    <nav>
      <h6 class="footer-title">Legal</h6>
      <NuxtLink to="/terms-of-use" class="link link-hover">Terms of use</NuxtLink>
      <NuxtLink to="/privacy-policy" class="link link-hover">Privacy policy</NuxtLink>
      <NuxtLink to="/cookie-policy" class="link link-hover">Cookie policy</NuxtLink>
    </nav>
  </footer>
</template>