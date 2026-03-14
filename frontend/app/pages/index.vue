<script setup lang="ts">
definePageMeta({
  description: 'Discover Forkcast, the ultimate meal planning app. Organize weekly meals, discover new recipes, and cook stress free.',
})
</script>
<template>
  <div class="bg-[#050405]">
    <div class="hero h-screen
                bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.8)),url('/images/hero-bg.jpg')]
                bg-fixed bg-no-repeat bg-cover bg-center animate-zoom-in">
      <div class="hero-content flex-col lg:flex-row">
        <div>
          <h1 class="text-8xl font-bold mb-2.5 opacity-0 animate-fade-in-slide-in-left">Meet Forkcast,</h1>
          <h1 class="text-5xl font-bold opacity-0 animate-fade-in-slide-in-right-delay">
            <span>the #1 app for </span>
            <span class="text-rotate duration-7000">
              <span class="italic font-extralight text-primary">
                <span>MEAL PLANNING</span>
                <span>COOKING</span>
                <span>RECIPE DISCOVERY</span>
                <span>HEALTHY EATING</span>
              </span>
            </span>
          </h1>
          <p class="py-6 text-xl opacity-0 animate-fade-in">
            Organize weekly meals, discover new recipes, and cook stress free.
          </p>
          <NuxtLink to="/auth/register" class="btn btn-primary mr-2 opacity-0 animate-fade-in">
            <i class="fa-solid fa-user-plus mr-1"/>
            Start Planning Free
          </NuxtLink>
          <NuxtLink to="/auth/login" class="btn btn-outline opacity-0 animate-fade-in">
            <i class="fa-solid fa-user-check mr-1"/>
            Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
