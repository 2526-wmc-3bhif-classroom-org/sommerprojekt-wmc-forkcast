<script setup lang="ts">
import type {Failure} from "~/assets/model/failure";
import useFailureHandler from "~/assets/util/failure-handler";
import useAuthService from "~/assets/service/auth-service";

const emit = defineEmits(["continue"]);

const username = ref<HTMLInputElement>();
const email = ref<HTMLInputElement>();
const password = ref<HTMLInputElement>();
const terms = ref<HTMLInputElement>();

const usernameError = ref<HTMLSpanElement>();
const emailError = ref<HTMLSpanElement>();
const passwordError = ref<HTMLSpanElement>();
const mainError = ref<HTMLSpanElement>();

const authService = useAuthService();
const failureHandler = useFailureHandler();
const { t, locale } = useI18n();

failureHandler.addHandler("name", (message) => {
  usernameError.value!!.innerText = message;
});

failureHandler.addHandler("email", (message) => {
  emailError.value!!.innerText = message;
});

failureHandler.addHandler("password", (message) => {
  passwordError.value!!.innerText = message;
});

failureHandler.setMainHandler(message => {
  mainError.value!!.innerText = message;
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

  let failure = await authService.signup(username.value.value, email.value.value, password.value.value, locale.value);
  if (!failure.ok) {
    failureHandler.fail(failure.failure as Failure);
    return;
  }

  emit('continue', emailValue, passwordValue);
}
</script>

<template>
  <form class="fieldset w-full" onsubmit="return false">
    <label class="label">
      <i class="fa-solid fa-user"/>
      <span>{{$t('signup.name')}}</span>
    </label>
    <label class="label text-error text-wrap">
      <i v-if="failureHandler.has('name')" class="fa-solid fa-triangle-exclamation"/>
      <span ref="usernameError"></span>
    </label>
    <input ref="username" autocomplete="username" type="text" class="input w-full" :placeholder="$t('signup.name')" />
    <label class="label">
      <i class="fa-solid fa-at"/>
      <span>{{$t('signup.email')}}</span>
    </label>
    <label class="label text-error text-wrap">
      <i v-if="failureHandler.has('email')" class="fa-solid fa-triangle-exclamation"/>
      <span ref="emailError"></span>
    </label>
    <input ref="email" autocomplete="email" type="email" class="input w-full" :placeholder="$t('signup.email')" />
    <label class="label">
      <i class="fa-solid fa-key"/>
      <span>{{$t('signup.password')}}</span>
    </label>
    <label class="label text-error text-wrap">
      <i v-if="failureHandler.has('password')" class="fa-solid fa-triangle-exclamation"/>
      <span ref="passwordError"></span>
    </label>
    <input ref="password" autocomplete="current-password" type="password" class="input w-full" :placeholder="$t('signup.password')" />
    <label class="label pt-2">
      <input ref="terms" type="checkbox"  class="checkbox" />
      {{$t('signup.terms.1')}}
      <nuxt-link-locale to="/terms-of-use" class="link link-hover">
        <i class="fa-solid fa-up-right-from-square"/>
        {{$t('signup.terms.2')}}
      </nuxt-link-locale>
    </label>
    <label class="label text-error">
      <i v-if="failureHandler.hasMain()" class="fa-solid fa-triangle-exclamation"/>
      <span ref="mainError"></span>
    </label>
    <button class="btn btn-primary mt-4" @click="signup">
      <i class="fa-solid fa-arrow-right-to-bracket"/>
      <span>{{$t('signup.submit')}}</span>
    </button>
  </form>
</template>