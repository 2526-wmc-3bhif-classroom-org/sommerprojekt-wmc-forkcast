<script setup lang="ts">

const img = useImage();
const bgImage = img('/images/signup-bg.jpg', { quality: 90, format: 'webp' });
const mode = ref<"request" | "reset">("request");
const enteredEmail = ref("");

// Survive a reload mid-reset: the pending email keeps us on the reset step.
// The new password is typed fresh on that step, so nothing sensitive is stored.
const PENDING_EMAIL_KEY = "forgot-pending-email";

onMounted(() => {
  const saved = sessionStorage.getItem(PENDING_EMAIL_KEY);
  if (saved) {
    enteredEmail.value = saved;
    mode.value = "reset";
  }
});

function continueWithEmail(email: string) {
  enteredEmail.value = email;
  sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  mode.value = "reset";
}

function restartForgot() {
  enteredEmail.value = "";
  mode.value = "request";
}
</script>

<template>
  <div class="bg-[#07070B]">
    <div
        class="hero h-screen bg-fixed bg-no-repeat bg-cover bg-center animate-zoom-in"
        :style="`background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('${bgImage}');`"
    >
      <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left lg:ml-24 opacity-0 animate-fade-in-slide-in-up-delay">
          <h1 class="text-3xl md:text-5xl font-bold text-nowrap">
            {{$t('forgot.greeting')}}
          </h1>
          <p class="py-6 w-80 md:w-96 m-auto">
            {{ mode == 'reset' ? $t('forgot.reset_prompt') : $t('forgot.prompt') }}
          </p>
        </div>
        <div class="card bg-base-100 rounded-2xl w-full max-w-sm shrink-0 shadow-2xl opacity-0 animate-fade-in-slide-in-up">
          <div class="card-body w-full">
            <forgot-reset-form-component v-if="mode == 'reset'" :enteredEmail="enteredEmail" @restart="restartForgot"/>
            <forgot-request-form-component v-else @continue="continueWithEmail"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
