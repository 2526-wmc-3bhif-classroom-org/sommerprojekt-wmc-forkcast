<script setup lang="ts">
import useAuthService from "~/assets/service/auth-service";

const authService = useAuthService();

const img = useImage();
const bgImage = img('/images/hero-bg.jpg', { quality: 90, format: 'webp' });

const revealEls = ref<Element[]>([]);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
});
</script>

<template>
  <div class="bg-[#090B0E] bg-fixed bg-no-repeat " :style="`background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('${bgImage}');`"
  >

    <!-- Hero -->
    <div
        class="hero h-screen bg-cover bg-center animate-zoom-in"
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

    <!-- Features -->
    <section class="py-24 px-6 mx-auto bg-linear-to-t from-base-100 to-transparent">
      <div class="text-center mb-16 scroll-reveal">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">{{$t('index.features.title')}}</h2>
        <p class="text-base-content/60 text-lg max-w-2xl mx-auto">{{$t('index.features.subtitle')}}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card bg-base-100/5 scroll-reveal" style="--reveal-delay: 0ms">
          <div class="card-body items-center text-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <i class="fa-solid fa-calendar-days text-primary text-2xl"/>
            </div>
            <h3 class="font-bold text-lg">{{$t('index.features.1.title')}}</h3>
            <p class="text-base-content/60 text-sm">{{$t('index.features.1.desc')}}</p>
          </div>
        </div>
        <div class="card bg-base-100/5 scroll-reveal" style="--reveal-delay: 80ms">
          <div class="card-body items-center text-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <i class="fa-solid fa-magnifying-glass text-primary text-2xl"/>
            </div>
            <h3 class="font-bold text-lg">{{$t('index.features.2.title')}}</h3>
            <p class="text-base-content/60 text-sm">{{$t('index.features.2.desc')}}</p>
          </div>
        </div>
        <div class="card bg-base-100/5 scroll-reveal" style="--reveal-delay: 160ms">
          <div class="card-body items-center text-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <i class="fa-solid fa-cart-shopping text-primary text-2xl"/>
            </div>
            <h3 class="font-bold text-lg">{{$t('index.features.3.title')}}</h3>
            <p class="text-base-content/60 text-sm">{{$t('index.features.3.desc')}}</p>
          </div>
        </div>
        <div class="card bg-base-100/5 scroll-reveal" style="--reveal-delay: 240ms">
          <div class="card-body items-center text-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <i class="fa-solid fa-hand-pointer text-primary text-2xl"/>
            </div>
            <h3 class="font-bold text-lg">{{$t('index.features.4.title')}}</h3>
            <p class="text-base-content/60 text-sm">{{$t('index.features.4.desc')}}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- App Preview -->
    <section class="py-24 px-6 bg-linear-to-t from-base-200 to-base-100">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16 scroll-reveal">
          <h2 class="text-4xl md:text-5xl font-bold mb-4">{{$t('index.preview.title')}}</h2>
          <p class="text-base-content/60 text-lg max-w-2xl mx-auto">{{$t('index.preview.subtitle')}}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="scroll-reveal" style="--reveal-delay: 0ms">
            <p class="text-sm text-base-content/40 mb-3 text-center font-medium uppercase tracking-wider">{{$t('index.preview.cap.dashboard')}}</p>
            <div class="rounded-2xl overflow-hidden border border-base-content/10 bg-base-100/5 aspect-[9/16] md:aspect-auto">
              <img src="/images/screenshot-dashboard.png" :alt="$t('index.preview.cap.dashboard')" class="w-full h-full object-cover object-top"/>
            </div>
          </div>
          <div class="scroll-reveal" style="--reveal-delay: 100ms">
            <p class="text-sm text-base-content/40 mb-3 text-center font-medium uppercase tracking-wider">{{$t('index.preview.cap.schedule')}}</p>
            <div class="rounded-2xl overflow-hidden border border-base-content/10 bg-base-100/5 aspect-[9/16] md:aspect-auto">
              <img src="/images/screenshot-schedule.png" :alt="$t('index.preview.cap.schedule')" class="w-full h-full object-cover object-top"/>
            </div>
          </div>
          <div class="scroll-reveal" style="--reveal-delay: 200ms">
            <p class="text-sm text-base-content/40 mb-3 text-center font-medium uppercase tracking-wider">{{$t('index.preview.cap.shopping')}}</p>
            <div class="rounded-2xl overflow-hidden border border-base-content/10 bg-base-100/5 aspect-[9/16] md:aspect-auto">
              <img src="/images/screenshot-shopping.png" :alt="$t('index.preview.cap.shopping')" class="w-full h-full object-cover object-top"/>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-24 px-6 mx-auto bg-linear-to-t from-base-300 to-base-200">
      <div class="text-center mb-16 scroll-reveal">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">{{$t('index.how.title')}}</h2>
        <p class="text-base-content/60 text-lg">{{$t('index.how.subtitle')}}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <!-- connector lines (desktop) -->
        <div class="hidden md:block absolute top-8 left-1/5 right-1/5 h-px bg-base-content/10" />

        <div class="flex flex-col items-center text-center gap-4 scroll-reveal" style="--reveal-delay: 0ms">
          <div class="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-2xl bg-primary/10">1</div>
          <h3 class="font-bold text-xl">{{$t('index.how.1.title')}}</h3>
          <p class="text-base-content/60">{{$t('index.how.1.desc')}}</p>
        </div>
        <div class="flex flex-col items-center text-center gap-4 scroll-reveal" style="--reveal-delay: 120ms">
          <div class="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-2xl bg-primary/10">2</div>
          <h3 class="font-bold text-xl">{{$t('index.how.2.title')}}</h3>
          <p class="text-base-content/60">{{$t('index.how.2.desc')}}</p>
        </div>
        <div class="flex flex-col items-center text-center gap-4 scroll-reveal" style="--reveal-delay: 240ms">
          <div class="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-2xl bg-primary/10">3</div>
          <h3 class="font-bold text-xl">{{$t('index.how.3.title')}}</h3>
          <p class="text-base-content/60">{{$t('index.how.3.desc')}}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 px-6 bg-linear-to-t from-base-300 to-base-300">
      <div class="max-w-2xl mx-auto text-center scroll-reveal">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">{{$t('index.cta.title')}}</h2>
        <p class="text-base-content/60 text-lg mb-10">{{$t('index.cta.subtitle')}}</p>
        <nuxt-link-locale v-if="!authService.authenticated.value" to="/auth/signup" class="btn btn-primary">
          <i class="fa-solid fa-user-plus mr-1"/>
          {{$t('index.cta.signup')}}
        </nuxt-link-locale>
        <nuxt-link-locale v-if="authService.authenticated.value" to="/dashboard" class="btn btn-primary">
          <i class="fa-solid fa-chart-line mr-1"/>
          {{$t('index.prompt_dashboard')}}
        </nuxt-link-locale>
      </div>
    </section>

  </div>
</template>
