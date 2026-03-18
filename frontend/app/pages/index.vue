<script setup lang="ts">
import useAuthService from "~/assets/service/auth-service";

const authService = useAuthService();

const img = useImage();
const bgImage = img('/images/hero-bg.jpg', { quality: 90, format: 'webp' });
</script>
<template>
  <div class="bg-[#090B0E]">
    <div
        class="hero h-screen bg-fixed bg-no-repeat bg-cover bg-center animate-zoom-in"
        :style="`background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('${bgImage}');`"
    >
      <div role="main" class="hero-content flex-col lg:flex-row">
        <div>
          <h1 class="text-6xl md:text-8xl font-bold mb-2.5 opacity-0 animate-fade-in-slide-in-left">
            {{$t('index.title')}}
          </h1>
          <h1 class="text-3xl md:text-5xl font-bold opacity-0 animate-fade-in-slide-in-right-delay">
            <span>{{$t('index.nr1') + " "}}</span>
            <span class="text-rotate duration-7000">
              <span class="italic font-extralight text-primary">
                <span>{{$t('index.rotator.1')}}</span>
                <span>{{$t('index.rotator.2')}}</span>
                <span>{{$t('index.rotator.3')}}</span>
                <span>{{$t('index.rotator.4')}}</span>
              </span>
            </span>
          </h1>
          <p class="py-6 text-md md:text-xl opacity-0 animate-fade-in">
            {{$t('index.subtitle')}}
          </p>
          <nuxt-link-locale v-if="!authService.authenticated.value" to="/auth/signup" class="btn btn-primary mr-2 opacity-0 animate-fade-in">
            <i class="fa-solid fa-user-plus mr-1"/>
            <span>{{$t('index.prompt_signup')}}</span>
          </nuxt-link-locale>
          <nuxt-link-locale v-if="!authService.authenticated.value" to="/auth/login" class="btn btn-outline opacity-0 animate-fade-in">
            <i class="fa-solid fa-user-check mr-1"/>
            <span>{{$t('index.prompt_login')}}</span>
          </nuxt-link-locale>
          <nuxt-link-locale v-if="authService.authenticated.value" to="/dashboard" class="btn btn-outline opacity-0 animate-fade-in">
            <i class="fa-solid fa-chart-line mr-1"/>
            <span>{{$t('index.prompt_dashboard')}}</span>
          </nuxt-link-locale>
        </div>
      </div>
    </div>
  </div>
</template>
