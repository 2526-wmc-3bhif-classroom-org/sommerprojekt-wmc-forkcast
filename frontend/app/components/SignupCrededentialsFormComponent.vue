<script setup lang="ts">
import type {Failure} from "~/assets/model/failure";
import useFailureHandler from "~/assets/util/failure-handler";
import useAuthService from "~/assets/service/auth-service";

const emit = defineEmits(["continue"]);

const username = ref<HTMLInputElement>();
const email = ref<HTMLInputElement>();
const password = ref<HTMLInputElement>();
const terms = ref<HTMLInputElement>();

const usernameError = ref("");
const emailError = ref("");
const passwordError = ref("");
const mainError = ref("");

const showPassword = ref(false);
const loading = ref(false);

const authService = useAuthService();
const failureHandler = useFailureHandler();
const { t, locale } = useI18n();

failureHandler.addHandler("name", (message) => {
  usernameError.value = message;
});

failureHandler.addHandler("email", (message) => {
  emailError.value = message;
});

failureHandler.addHandler("password", (message) => {
  passwordError.value = message;
});

failureHandler.setMainHandler(message => {
  mainError.value = message;
});

async function signup() {
  if (!username.value?.value || !email.value?.value || !password.value?.value) {
    failureHandler.fail({ message: t('error.fill_all_fields') } as Failure);
    return;
  }

  if (!terms.value?.checked) {
    failureHandler.fail({ message: t('error.accept_terms') } as Failure);
    return;
  }

  const passwordValue = password.value.value;
  const emailValue = email.value.value;

  loading.value = true;
  let failure = await authService.signup(username.value.value, email.value.value, password.value.value, locale.value);
  loading.value = false;
  if (!failure.ok) {
    failureHandler.fail(failure.failure as Failure);
    return;
  }

  emit('continue', emailValue, passwordValue);
}
</script>

<template>
  <form class="fieldset w-full" onsubmit="return false">
    <label class="label">{{$t('signup.name')}}</label>
    <label class="input w-full">
      <i class="fa-solid fa-user opacity-50"/>
      <input ref="username" autocomplete="username" type="text" class="grow" placeholder="janedoe" />
    </label>
    <Transition name="error-reveal">
      <p v-if="usernameError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ usernameError }}</span>
      </p>
    </Transition>

    <label class="label">{{$t('signup.email')}}</label>
    <label class="input w-full">
      <i class="fa-solid fa-at opacity-50"/>
      <input ref="email" autocomplete="email" type="email" class="grow" placeholder="you@example.com" />
    </label>
    <Transition name="error-reveal">
      <p v-if="emailError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ emailError }}</span>
      </p>
    </Transition>

    <label class="label">{{$t('signup.password')}}</label>
    <label class="input w-full">
      <i class="fa-solid fa-key opacity-50"/>
      <input ref="password" autocomplete="new-password" :type="showPassword ? 'text' : 'password'" class="grow" placeholder="••••••••" />
      <button type="button" tabindex="-1" class="opacity-50 hover:opacity-100 cursor-pointer" @click="showPassword = !showPassword">
        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"/>
      </button>
    </label>
    <Transition name="error-reveal">
      <p v-if="passwordError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ passwordError }}</span>
      </p>
    </Transition>

    <label class="label pt-2">
      <input ref="terms" type="checkbox" class="checkbox" />
      {{$t('signup.terms.1')}}
      <nuxt-link-locale to="/terms-of-use" class="link link-hover">
        <i class="fa-solid fa-up-right-from-square"/>
        {{$t('signup.terms.2')}}
      </nuxt-link-locale>
    </label>
    <Transition name="error-reveal">
      <p v-if="mainError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ mainError }}</span>
      </p>
    </Transition>
    <button class="btn btn-primary mt-4" :disabled="loading" @click="signup">
      <span v-if="loading" class="loading loading-spinner loading-sm"/>
      <i v-else class="fa-solid fa-arrow-right-to-bracket"/>
      <span>{{$t('signup.submit')}}</span>
    </button>
  </form>
</template>
