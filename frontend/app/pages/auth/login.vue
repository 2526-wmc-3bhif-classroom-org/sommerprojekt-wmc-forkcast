<script setup lang="ts">
definePageMeta({
  layout: "minimal",
})
</script>

<template>
  <div class="hero min-h-screen
                bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.8)),url('/images/register-bg.jpg')]
                bg-center">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left lg:ml-24">
        <h1 class="text-3xl md:text-5xl font-bold text-nowrap">
          <i class="fa-solid fa-hand-peace mr-2"/>
          Welcome back!
        </h1>
        <p class="py-6 w-96 m-auto">
          Please enter your username and
          password to access your account.
          If you don't have an account, you can sign up for one.
          We look forward to seeing you again!
        </p>
      </div>
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body w-full">
          <fieldset class="fieldset w-full">
            <label class="label">
              <i class="fa-solid fa-user"/>
              Username
            </label>
            <input type="text" class="input w-full" placeholder="Username" />
            <label class="label">
              <i class="fa-solid fa-key"/>
              Password
            </label>
            <input type="password" class="input w-full" placeholder="Password" />
            <div>
              <NuxtLink to="/auth/forgot" class="link link-hover">Forgot password?</NuxtLink>
            </div>
            <button class="btn btn-primary mt-4">
              <i class="fa-solid fa-arrow-right-to-bracket"/>
              Login
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>