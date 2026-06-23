<script setup lang="ts">
import type {Failure} from "~/assets/model/failure";
import useFailureHandler from "~/assets/util/failure-handler";
import useAuthService from "~/assets/service/auth-service";

const emit = defineEmits(["continue"]);

const email = ref<HTMLInputElement>();

const emailError = ref("");
const mainError = ref("");

const loading = ref(false);

const authService = useAuthService();
const failureHandler = useFailureHandler();
const { t, locale } = useI18n();

failureHandler.addHandler("email", (message) => {
  emailError.value = message;
});

failureHandler.setMainHandler(message => {
  mainError.value = message;
});

async function request() {
  emailError.value = "";
  if (!email.value?.value) {
    failureHandler.fail({ message: t('error.fill_all_fields') } as Failure);
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email.value.value)) {
    emailError.value = t('error.invalid_email');
    return;
  }

  const emailValue = email.value.value;
  loading.value = true;
  const failure = await authService.forgotPassword(emailValue, locale.value);
  loading.value = false;
  if (!failure.ok) {
    failureHandler.fail(failure.failure as Failure);
    return;
  }

  emit('continue', emailValue);
}
</script>

<template>
  <form class="fieldset w-full" onsubmit="return false">
    <label class="label">{{$t('forgot.email')}}</label>
    <label class="input w-full">
      <i class="fa-solid fa-at opacity-50"/>
      <input ref="email" autocomplete="email" type="text" inputmode="email" class="grow" placeholder="you@example.com" @keyup.enter="request" />
    </label>
    <Transition name="error-reveal">
      <p v-if="emailError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ emailError }}</span>
      </p>
    </Transition>
    <Transition name="error-reveal">
      <p v-if="mainError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ mainError }}</span>
      </p>
    </Transition>
    <button class="btn btn-primary mt-4" :disabled="loading" @click="request">
      <span v-if="loading" class="loading loading-spinner loading-sm"/>
      <i v-else class="fa-solid fa-paper-plane"/>
      <span>{{$t('forgot.send')}}</span>
    </button>
    <div class="mt-2">
      <nuxt-link-locale to="/auth/login" class="link link-hover">{{$t('forgot.back')}}</nuxt-link-locale>
    </div>
  </form>
</template>
