<template>
  <div class="fixed top-0 navbar bg-transparent shadow-sm">
    <div class="flex-1">
      <nuxt-link-locale to="/" class="btn btn-ghost text-xl">
        <i class="fa-solid fa-utensils"/>
        <span>{{$t('component.navbar.title')}}</span>
      </nuxt-link-locale>
    </div>
    <div class="flex-none">
      <language-switcher-component class="mr-2"/>

      <nuxt-link-locale to="/auth/signup" class="btn btn-primary mr-2">
        <i class="fa-solid fa-user-plus"/>
        <span class="hidden md:block md:ml-1">
          {{$t('component.navbar.prompt_signup')}}
        </span>
      </nuxt-link-locale>
      <nuxt-link-locale to="/auth/login" class="btn btn-soft">
        <i class="fa-solid fa-user-check"/>
        <span class="hidden md:block md:ml-1">
          {{$t('component.navbar.prompt_login')}}
        </span>
      </nuxt-link-locale>
    </div>
  </div>
</template>