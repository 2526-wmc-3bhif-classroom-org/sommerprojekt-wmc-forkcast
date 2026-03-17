<script setup lang="ts">
import useFailureHandler from "~/assets/util/failure-handler";
import type {Failure} from "~/assets/model/failure";
import useAuthService from "~/assets/service/auth-service";

const email = ref<HTMLInputElement>();
const password = ref<HTMLInputElement>();

const emailError = ref<HTMLSpanElement>();
const passwordError = ref<HTMLSpanElement>();
const mainError = ref<HTMLSpanElement>();

const localePath = useLocalePath();
const router = useRouter();
const auth = useAuthService();
const failureHandler = useFailureHandler();

const img = useImage();
const bgImage = img('/images/signup-bg.jpg', { quality: 90, format: 'webp' });

failureHandler.addHandler("email", (message) => {
  emailError.value!!.innerText = message;
});

failureHandler.addHandler("password", (message) => {
  passwordError.value!!.innerText = message;
});

failureHandler.setMainHandler(message => {
  mainError.value!!.innerText = message;
});

async function login() {
  if (!email.value?.value || !password.value?.value) {
    failureHandler.fail({ message: "Please fill in all fields." } as Failure);
    return;
  }

  let failure = await auth.login(email.value.value, password.value.value);
  if (!failure.ok) {
    failureHandler.fail(failure.failure as Failure);
    return;
  }

  await router.push(localePath("/dashboard"));
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
            {{$t('login.greeting')}}
          </h1>
          <p class="py-6 w-80 md:w-96 m-auto">
            {{$t('login.prompt')}}
          </p>
        </div>
        <div class="card bg-base-100 rounded-2xl w-full max-w-sm shrink-0 shadow-2xl opacity-0 animate-fade-in-slide-in-up">
          <div class="card-body w-full">
            <form class="fieldset w-full" onsubmit="return false">
              <label class="label">
                <i class="fa-solid fa-at"/>
                <span>{{$t('login.email')}}</span>
              </label>
              <label class="label text-error text-wrap">
                <i v-if="failureHandler.has('email')" class="fa-solid fa-triangle-exclamation"/>
                <span ref="emailError"></span>
              </label>
              <input ref="email" autocomplete="email" type="text" class="input w-full" :placeholder="$t('login.email')" />
              <label class="label">
                <i class="fa-solid fa-key"/>
                <span>{{$t('login.password')}}</span>
              </label>
              <label class="label text-error text-wrap">
                <i v-if="failureHandler.has('password')" class="fa-solid fa-triangle-exclamation"/>
                <span ref="passwordError"></span>
              </label>
              <input ref="password" autocomplete="current-password" type="password" class="input w-full" :placeholder="$t('login.password')" />
              <div>
                <nuxt-link-locale to="/auth/forgot" class="link link-hover">{{$t('login.forgot')}}</nuxt-link-locale>
              </div>
              <label class="label text-error">
                <i v-if="failureHandler.hasMain()" class="fa-solid fa-triangle-exclamation"/>
                <span ref="mainError"></span>
              </label>
              <button class="btn btn-primary mt-4" @click="login">
                <i class="fa-solid fa-arrow-right-to-bracket"/>
                <span>{{$t('login.submit')}}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
