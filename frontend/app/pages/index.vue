<script setup lang="ts">
import useAuthService from "~/assets/service/auth-service";

const authService = useAuthService();

const img = useImage();
const bgImage = img('/images/hero-bg.jpg', { quality: 90, format: 'webp' });

const steps = [
  { n: '01', title: 'index.how.1.title', desc: 'index.how.1.desc', img: '/images/screenshot-schedule.png' },
  { n: '02', title: 'index.how.2.title', desc: 'index.how.2.desc', img: '/images/screenshot-shopping.png' },
  { n: '03', title: 'index.how.3.title', desc: 'index.how.3.desc', img: '/images/screenshot-dashboard.png' },
];

// Count-up targets; suffix kept locale-neutral, label translated.
const stats = [
  { to: 5000, suffix: '+', label: 'index.stats.1.label' },
  { to: 35, suffix: '+', label: 'index.stats.2.label' },
  { to: 9, suffix: '', label: 'index.stats.3.label' },
  { to: 100, suffix: '%', label: 'index.stats.4.label' },
];
const statDisplay = ref(stats.map(s => s.to));
// Fixed locale so SSR and client format identically (avoids hydration mismatch).
const fmtStat = (n: number) => n.toLocaleString('en-US');

// TODO(assets): provide real screenshots for these views (see filenames below).
const showcase = [
  { title: 'index.showcase.1.title', desc: 'index.showcase.1.desc', img: '/images/showcase-cooking.png', alt: 'index.showcase.1.alt' },
  { title: 'index.showcase.2.title', desc: 'index.showcase.2.desc', img: '/images/showcase-discovery.png', alt: 'index.showcase.2.alt' },
  { title: 'index.showcase.3.title', desc: 'index.showcase.3.desc', img: '/images/showcase-friends.png', alt: 'index.showcase.3.alt' },
];

const why = [
  { icon: 'fa-bowl-food', title: 'index.why.1.title', desc: 'index.why.1.desc' },
  { icon: 'fa-code-branch', title: 'index.why.2.title', desc: 'index.why.2.desc' },
  { icon: 'fa-language', title: 'index.why.3.title', desc: 'index.why.3.desc' },
];

const faqs = [
  { q: 'index.faq.1.q', a: 'index.faq.1.a' },
  { q: 'index.faq.2.q', a: 'index.faq.2.a' },
  { q: 'index.faq.3.q', a: 'index.faq.3.a' },
  { q: 'index.faq.4.q', a: 'index.faq.4.a' },
  { q: 'index.faq.5.q', a: 'index.faq.5.a' },
];

const lightbox = ref<string | null>(null);
const activeStep = ref(0);
const trackRef = ref<HTMLElement | null>(null);
const statsRef = ref<HTMLElement | null>(null);

// Scroll-driven demo: progress through the pinned track maps to the active step.
let ticking = false;
function updateStep() {
  const el = trackRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const scrolled = Math.min(Math.max(-rect.top, 0), total);
  const progress = total > 0 ? scrolled / total : 0;
  activeStep.value = Math.min(steps.length - 1, Math.floor(progress * steps.length));
}
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateStep(); ticking = false; });
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') lightbox.value = null;
}

// Count-up: animate stat numbers from 0 to target when the strip scrolls into view.
function runCountUp() {
  const start = performance.now();
  const duration = 1400;
  function frame(now: number) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    statDisplay.value = stats.map(s => Math.round(s.to * eased));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

let statsObserver: IntersectionObserver | undefined;

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('keydown', onKey);
  updateStep();

  if (statsRef.value) {
    statDisplay.value = stats.map(() => 0);
    statsObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        runCountUp();
        statsObserver?.disconnect();
      }
    }, { threshold: 0.4 });
    statsObserver.observe(statsRef.value);
  }
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  window.removeEventListener('keydown', onKey);
  statsObserver?.disconnect();
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
          <!-- Auth-dependent CTAs: client-only because auth state (sessionStorage)
               is unknown on the server and would otherwise mismatch on hydration. -->
          <client-only>
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
          </client-only>
        </div>
      </div>
    </div>

    <!-- Features -->
    <section class="py-20 px-6 bg-linear-to-b from-transparent to-base-100">
      <div class="max-w-6xl mx-auto">
        <div class="max-w-xl mb-14 scroll-reveal">
          <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{{$t('index.features.title')}}</h2>
          <p class="text-base-content/50 text-lg">{{$t('index.features.subtitle')}}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
          <div class="flex gap-4 scroll-reveal">
            <i class="fa-solid fa-calendar-days text-primary text-xl mt-0.5 w-6 text-center shrink-0"/>
            <div>
              <h3 class="font-semibold text-lg mb-1.5">{{$t('index.features.1.title')}}</h3>
              <p class="text-base-content/50 text-sm leading-relaxed">{{$t('index.features.1.desc')}}</p>
            </div>
          </div>
          <div class="flex gap-4 scroll-reveal">
            <i class="fa-solid fa-magnifying-glass text-primary text-xl mt-0.5 w-6 text-center shrink-0"/>
            <div>
              <h3 class="font-semibold text-lg mb-1.5">{{$t('index.features.2.title')}}</h3>
              <p class="text-base-content/50 text-sm leading-relaxed">{{$t('index.features.2.desc')}}</p>
            </div>
          </div>
          <div class="flex gap-4 scroll-reveal">
            <i class="fa-solid fa-cart-shopping text-primary text-xl mt-0.5 w-6 text-center shrink-0"/>
            <div>
              <h3 class="font-semibold text-lg mb-1.5">{{$t('index.features.3.title')}}</h3>
              <p class="text-base-content/50 text-sm leading-relaxed">{{$t('index.features.3.desc')}}</p>
            </div>
          </div>
          <div class="flex gap-4 scroll-reveal">
            <i class="fa-solid fa-hand-pointer text-primary text-xl mt-0.5 w-6 text-center shrink-0"/>
            <div>
              <h3 class="font-semibold text-lg mb-1.5">{{$t('index.features.4.title')}}</h3>
              <p class="text-base-content/50 text-sm leading-relaxed">{{$t('index.features.4.desc')}}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats (count-up on scroll) -->
    <section ref="statsRef" class="px-6 bg-base-100 border-t border-base-content/10">
      <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-base-content/10">
        <div v-for="(s, i) in stats" :key="s.label" class="py-12 px-6 text-center">
          <div class="text-4xl md:text-5xl font-semibold tracking-tight text-primary mb-1 tabular-nums">{{ fmtStat(statDisplay[i]) }}{{ s.suffix }}</div>
          <div class="text-sm text-base-content/50">{{$t(s.label)}}</div>
        </div>
      </div>
    </section>

    <!-- Product demo (scroll-driven) -->
    <section class="bg-base-100 border-t border-base-content/10">
      <div ref="trackRef" class="relative h-[240vh]">
        <div class="sticky top-0 h-[100svh] flex flex-col justify-center overflow-hidden">
          <div class="max-w-7xl mx-auto w-full px-6">
            <div class="max-w-xl mb-10">
              <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{{$t('index.preview.title')}}</h2>
              <p class="text-base-content/50 text-lg">{{$t('index.preview.subtitle')}}</p>
            </div>
            <div class="grid md:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-center">

              <!-- Steps -->
              <div class="flex flex-col gap-7 order-2 md:order-1">
                <div
                  v-for="(s, i) in steps"
                  :key="s.n"
                  class="flex gap-5 transition-opacity duration-500"
                  :class="activeStep === i ? 'opacity-100' : 'opacity-30'"
                >
                  <span
                    class="text-4xl md:text-5xl font-semibold tabular-nums shrink-0 transition-colors duration-500"
                    :class="activeStep === i ? 'text-primary' : 'text-base-content/20'"
                  >{{ s.n }}</span>
                  <div>
                    <h3 class="font-semibold text-xl mb-1.5">{{$t(s.title)}}</h3>
                    <p class="text-base-content/50 leading-relaxed">{{$t(s.desc)}}</p>
                  </div>
                </div>
              </div>

              <!-- Screenshot (cross-fades per step, click to zoom) -->
              <button
                type="button"
                class="relative order-1 md:order-2 w-full aspect-video rounded-2xl overflow-hidden border border-base-content/10 bg-base-200 shadow-2xl shadow-black/30 cursor-zoom-in"
                @click="lightbox = steps[activeStep].img"
              >
                <nuxt-img
                  v-for="(s, i) in steps"
                  :key="s.img"
                  :src="s.img"
                  :alt="$t(s.title)"
                  format="webp"
                  sizes="100vw md:600px"
                  class="absolute inset-0 w-full h-full object-contain transition-opacity duration-700"
                  :class="activeStep === i ? 'opacity-100' : 'opacity-0'"
                />
              </button>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Showcase (zigzag) -->
    <section class="py-24 px-6 bg-base-100 border-t border-base-content/10">
      <div class="max-w-6xl mx-auto">
        <div class="max-w-xl mb-16 scroll-reveal">
          <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{{$t('index.showcase.title')}}</h2>
          <p class="text-base-content/50 text-lg">{{$t('index.showcase.subtitle')}}</p>
        </div>
        <div class="flex flex-col gap-20 md:gap-28">
          <div
            v-for="(item, i) in showcase"
            :key="item.img"
            class="grid md:grid-cols-2 gap-10 lg:gap-16 items-center scroll-reveal"
          >
            <div :class="i % 2 === 1 ? 'md:order-2' : ''">
              <h3 class="text-2xl md:text-3xl font-semibold tracking-tight mb-4">{{$t(item.title)}}</h3>
              <p class="text-base-content/50 text-lg leading-relaxed">{{$t(item.desc)}}</p>
            </div>
            <button
              type="button"
              class="relative w-full aspect-video rounded-2xl overflow-hidden border border-base-content/10 bg-base-200 shadow-2xl shadow-black/30 cursor-zoom-in"
              :class="i % 2 === 1 ? 'md:order-1' : ''"
              @click="lightbox = item.img"
            >
              <!-- Placeholder shown until real screenshot is provided -->
              <div class="absolute inset-0 flex items-center justify-center text-base-content/15">
                <i class="fa-regular fa-image text-5xl"/>
              </div>
              <nuxt-img
                :src="item.img"
                :alt="$t(item.alt)"
                format="webp"
                sizes="100vw md:600px"
                loading="lazy"
                class="relative w-full h-full object-cover object-top parallax-media"
                @error="($event.target as HTMLImageElement).style.opacity = '0'"
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Forkcast -->
    <section class="py-24 px-6 bg-base-100 border-t border-base-content/10">
      <div class="max-w-6xl mx-auto">
        <div class="max-w-xl mb-14 scroll-reveal">
          <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{{$t('index.why.title')}}</h2>
          <p class="text-base-content/50 text-lg">{{$t('index.why.subtitle')}}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-10 lg:gap-14">
          <div v-for="w in why" :key="w.title" class="scroll-reveal">
            <i class="fa-solid text-primary text-2xl mb-4" :class="w.icon"/>
            <h3 class="font-semibold text-xl mb-2">{{$t(w.title)}}</h3>
            <p class="text-base-content/50 leading-relaxed">{{$t(w.desc)}}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-24 px-6 bg-base-100 border-t border-base-content/10">
      <div class="max-w-3xl mx-auto">
        <div class="mb-14 scroll-reveal">
          <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{{$t('index.faq.title')}}</h2>
          <p class="text-base-content/50 text-lg">{{$t('index.faq.subtitle')}}</p>
        </div>
        <div class="join join-vertical w-full flex flex-col gap-1">
          <div v-for="(f, i) in faqs" :key="f.q" class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-home" :checked="i === 0" />
            <div class="collapse-title font-semibold text-base-content">{{$t(f.q)}}</div>
            <div class="collapse-content text-base-content opacity-70">{{$t(f.a)}}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA banner -->
    <section class="py-24 px-6 bg-base-100 border-t border-base-content/10">
      <div class="max-w-6xl mx-auto relative overflow-hidden rounded-3xl">
        <nuxt-img
          src="/images/signup-bg.jpg"
          format="webp"
          quality="80"
          sizes="100vw lg:1152px"
          loading="lazy"
          alt=""
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/55 to-black/70"/>
        <div class="relative px-6 py-20 md:py-28 text-center scroll-reveal">
          <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-3 text-white">{{$t('index.cta.title')}}</h2>
          <p class="text-white/70 text-lg mb-8">{{$t('index.cta.subtitle')}}</p>
          <client-only>
            <nuxt-link-locale v-if="!authService.authenticated.value" to="/auth/signup" class="btn btn-primary btn-lg">
              <i class="fa-solid fa-user-plus mr-1"/>
              {{$t('index.cta.signup')}}
            </nuxt-link-locale>
            <nuxt-link-locale v-if="authService.authenticated.value" to="/dashboard" class="btn btn-primary btn-lg">
              <i class="fa-solid fa-chart-line mr-1"/>
              {{$t('index.prompt_dashboard')}}
            </nuxt-link-locale>
          </client-only>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <client-only>
      <teleport to="body">
        <transition name="fade">
          <div
            v-if="lightbox"
            class="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            @click="lightbox = null"
          >
            <img :src="lightbox" alt="" class="max-w-full max-h-full rounded-xl shadow-2xl" @click.stop/>
            <button class="btn btn-circle btn-ghost absolute top-4 right-4 text-white" @click="lightbox = null">
              <i class="fa-solid fa-xmark text-xl"/>
            </button>
          </div>
        </transition>
      </teleport>
    </client-only>

  </div>
</template>
