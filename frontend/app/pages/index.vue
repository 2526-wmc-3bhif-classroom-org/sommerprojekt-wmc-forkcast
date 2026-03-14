<script setup lang="ts">
</script>
<template>
    <div class="hero min-h-screen
                bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.8)),url('/images/hero-bg.jpg')]
                bg-center bg-fixed bg-no-repeat bg-cover animate-zoom-in">
      <div class="hero-content flex-col lg:flex-row">
        <div>
          <h1 class="text-8xl font-bold mb-2.5 opacity-0 animate-fade-in-slide-in-left">Meet Forkcast,</h1>
          <h1 class="text-5xl font-bold opacity-0 animate-fade-in-slide-in-right-delay">the #1 app for meal planning and cooking</h1>
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
        <!--TODO add img/interactive of example meal plan-->
      </div>
    </div>

</template>
