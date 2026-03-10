<script setup lang="ts">
definePageMeta({
  layout: "minimal",
})
</script>

<template>
  <div class="sm:hero min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-3xl md:text-5xl font-bold text-nowrap">
          <i class="fa-solid fa-hand-peace mr-2"/>
          Glad to have you!
        </h1>
        <p class="py-6 w-full lg:w-96">
          Please enter your username and
          password to create your account.
          If you already have an account, you can log in to it.
          We look forward to seeing you!
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
            <label class="label pt-2">
              <input type="checkbox"  class="checkbox" />
              I accept the
              <NuxtLink to="/terms" class="link link-hover">
                <i class="fa-solid fa-up-right-from-square"/>
                Terms of use
              </NuxtLink>
            </label>
            <button class="btn btn-neutral mt-4">
              <i class="fa-solid fa-arrow-right-to-bracket"/>
              Register
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>