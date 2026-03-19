<script setup lang="ts">

const img = useImage();
const bgImage = img('/images/signup-bg.jpg', { quality: 90, format: 'webp' });
const mode = ref<"credentials" | "code">("credentials")
const enteredEmail = ref("");
const enteredPassword = ref("");

function continueWithCredentials(email: string, password: string) {
  enteredEmail.value = email;
  enteredPassword.value = password;
  mode.value = "code";
}
</script>

<template>
  <div class="bg-[#070709]">
    <div
        class="hero h-screen bg-fixed bg-no-repeat bg-cover bg-center animate-zoom-in"
        :style="`background-image: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('${bgImage}');`"
    >
      <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left lg:ml-24 opacity-0 animate-fade-in-slide-in-up-delay">
          <h1 class="text-3xl md:text-5xl font-bold text-nowrap">
            {{$t('signup.greeting')}}
          </h1>
          <p class="py-6 w-80 md:w-96 m-auto">
            {{$t('signup.prompt')}}
          </p>
        </div>
        <div class="card bg-base-100 rounded-2xl w-full max-w-sm shrink-0 shadow-2xl opacity-0 animate-fade-in-slide-in-up">
          <div class="card-body w-full">
            <signup-code-form-component v-if="mode == 'code'" :enteredEmail="enteredEmail" :enteredPassword="enteredPassword"/>
            <signup-crededentials-form-component v-else :mode="mode" @continue="continueWithCredentials"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>