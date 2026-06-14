<script setup lang="ts">
import useFailureHandler from "~/assets/util/failure-handler";
import type {Failure} from "~/assets/model/failure";
import useAuthService from "~/assets/service/auth-service";

const identifier = ref<HTMLInputElement>();
const password = ref<HTMLInputElement>();

const identifierError = ref("");
const passwordError = ref("");
const mainError = ref("");

const showPassword = ref(false);
const loading = ref(false);

const localePath = useLocalePath();
const router = useRouter();
const auth = useAuthService();
const failureHandler = useFailureHandler();
const { t } = useI18n();

const img = useImage();
const bgImage = img('/images/signup-bg.jpg', { quality: 90, format: 'webp' });

failureHandler.addHandler("identifier", (message) => {
  identifierError.value = message;
});

failureHandler.addHandler("password", (message) => {
  passwordError.value = message;
});

failureHandler.setMainHandler(message => {
  mainError.value = message;
});

async function login() {
  if (!identifier.value?.value || !password.value?.value) {
    failureHandler.fail({ message: t('error.fill_all_fields') } as Failure);
    return;
  }

  loading.value = true;
  let failure = await auth.login(identifier.value.value, password.value.value);
  loading.value = false;
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
              <label class="label">{{$t('login.identifier')}}</label>
              <label class="input w-full">
                <i class="fa-solid fa-at opacity-50"/>
                <input ref="identifier" autocomplete="username or email" type="text" class="grow" placeholder="you@example.com" @keyup.enter="login" />
              </label>
              <Transition name="error-reveal">
                <p v-if="identifierError" class="label text-error gap-1 text-wrap">
                  <i class="fa-solid fa-triangle-exclamation"/><span>{{ identifierError }}</span>
                </p>
              </Transition>

              <label class="label">{{$t('login.password')}}</label>
              <label class="input w-full">
                <i class="fa-solid fa-key opacity-50"/>
                <input ref="password" autocomplete="current-password" :type="showPassword ? 'text' : 'password'" class="grow" placeholder="••••••••" @keyup.enter="login" />
                <button type="button" tabindex="-1" class="opacity-50 hover:opacity-100 cursor-pointer" @click="showPassword = !showPassword">
                  <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"/>
                </button>
              </label>
              <Transition name="error-reveal">
                <p v-if="passwordError" class="label text-error gap-1 text-wrap">
                  <i class="fa-solid fa-triangle-exclamation"/><span>{{ passwordError }}</span>
                </p>
              </Transition>

              <div class="mt-1">
                <nuxt-link-locale to="/auth/forgot" class="link link-hover">{{$t('login.forgot')}}</nuxt-link-locale>
              </div>
              <Transition name="error-reveal">
                <p v-if="mainError" class="label text-error gap-1 text-wrap">
                  <i class="fa-solid fa-triangle-exclamation"/><span>{{ mainError }}</span>
                </p>
              </Transition>
              <button class="btn btn-primary mt-4" :disabled="loading" @click="login">
                <span v-if="loading" class="loading loading-spinner loading-sm"/>
                <i v-else class="fa-solid fa-arrow-right-to-bracket"/>
                <span>{{$t('login.submit')}}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
