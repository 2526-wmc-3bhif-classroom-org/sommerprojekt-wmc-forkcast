<script setup lang="ts">
import type {Failure} from "~/assets/model/failure";
import useFailureHandler from "~/assets/util/failure-handler";
import useAuthService from "~/assets/service/auth-service";

const emit = defineEmits(["continue"]);

const email = ref<HTMLInputElement>();

const emailError = ref<HTMLSpanElement>();
const mainError = ref<HTMLSpanElement>();

const authService = useAuthService();
const failureHandler = useFailureHandler();
const { t, locale } = useI18n();

failureHandler.addHandler("email", (message) => {
  emailError.value!!.innerText = message;
});

failureHandler.setMainHandler(message => {
  mainError.value!!.innerText = message;
});

async function request() {
  if (!email.value?.value) {
    failureHandler.fail({ message: t('error.fill_all_fields') } as Failure);
    return;
  }

  const emailValue = email.value.value;
  const failure = await authService.forgotPassword(emailValue, locale.value);
  if (!failure.ok) {
    failureHandler.fail(failure.failure as Failure);
    return;
  }

  emit('continue', emailValue);
}
</script>

<template>
  <form class="fieldset w-full" onsubmit="return false">
    <label class="label">
      <i class="fa-solid fa-at"/>
      <span>{{$t('forgot.email')}}</span>
    </label>
    <label class="label text-error text-wrap">
      <i v-if="failureHandler.has('email')" class="fa-solid fa-triangle-exclamation"/>
      <span ref="emailError"></span>
    </label>
    <input ref="email" autocomplete="email" type="email" class="input w-full" :placeholder="$t('forgot.email')" />
    <label class="label text-error">
      <i v-if="failureHandler.hasMain()" class="fa-solid fa-triangle-exclamation"/>
      <span ref="mainError"></span>
    </label>
    <button class="btn btn-primary mt-4" @click="request">
      <i class="fa-solid fa-paper-plane"/>
      <span>{{$t('forgot.send')}}</span>
    </button>
    <div class="mt-2">
      <nuxt-link-locale to="/auth/login" class="link link-hover">{{$t('forgot.back')}}</nuxt-link-locale>
    </div>
  </form>
</template>
