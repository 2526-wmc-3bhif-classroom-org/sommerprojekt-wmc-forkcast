<script setup lang="ts">
</script>
<template>

  <section class="hero">
    <div class="hero bg-base-200 min-h-screen
                bg-[linear-gradient(rgba(0,0,0,0), rgba(255,255,255,10)),url('../assets/images/hero-bg.jpg')]
                bg-center">
      <div class="hero-content flex-col lg:flex-row">
        <div>
          <h1 class="text-6xl font-bold mb-2.5">Meet Forkcast,</h1>
          <h1 class="text-5xl font-bold">the #1 app for meal planning and cooking</h1>
          <p class="py-6 text-xl">
            Organize weekly meals, discover new recipes, and cook stress free.
          </p>
          <NuxtLink to="/auth/register" class="btn btn-primary mr-5">
            <i class="fa-solid fa-user-plus mr-1"/>
            Start Planning Free
          </NuxtLink>
          <NuxtLink to="/auth/login" class="btn btn-outline">
            <i class="fa-solid fa-user-check mr-1"/>
            Login
          </NuxtLink>
        </div>
        <!--TODO add img/interactive of example meal plan-->
      </div>
    </div>
  </section>


</template>
