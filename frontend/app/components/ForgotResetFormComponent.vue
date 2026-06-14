<script setup lang="ts">
import type { Failure } from "~/assets/model/failure";
import useAuthService from "~/assets/service/auth-service";
import useFailureHandler from "~/assets/util/failure-handler";
import { onMounted, ref } from 'vue';

const props = defineProps(["enteredEmail"]);

const code = ref(["", "", "", "", "", ""]);
const codeRefs = ref<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

const password = ref<HTMLInputElement>();

const passwordError = ref("");
const mainError = ref("");

const showPassword = ref(false);
const loading = ref(false);

const authService = useAuthService();
const failureHandler = useFailureHandler();
const { t } = useI18n();

const localePath = useLocalePath();
const router = useRouter();

failureHandler.addHandler("password", (message) => {
  passwordError.value = message;
});

failureHandler.addHandler("code", (message) => {
  mainError.value = message;
});

failureHandler.setMainHandler(message => {
  mainError.value = message;
});

async function reset() {
  const codeStr = code.value.join("");
  if (!codeStr || codeStr.length < 6) {
    failureHandler.fail({ message: t('error.enter_code') } as Failure);
    return;
  }
  if (!password.value?.value) {
    failureHandler.fail({ message: t('error.fill_all_fields') } as Failure);
    return;
  }

  loading.value = true;
  const failure = await authService.resetPassword(props.enteredEmail, codeStr, password.value.value);
  loading.value = false;
  if (!failure.ok) {
    failureHandler.fail(failure.failure as Failure);
    return;
  }

  await router.push(localePath("/auth/login"));
}

function setCodeRef(el: unknown, idx: number) {
  codeRefs.value[idx] = el as HTMLInputElement | null;
}

function getFirstEmptyIdx() {
  return code.value.findIndex(c => c === "");
}

function onBoxClick(event: MouseEvent) {
  event.preventDefault();
  const nextIdx = getFirstEmptyIdx();
  focusInput(nextIdx === -1 ? 5 : nextIdx);
}

function focusInput(idx: number) {
  codeRefs.value[idx]?.focus();
}

onMounted(() => {
  focusInput(0);
});

function onInput(e: Event, idx: number) {
  const i = idx - 1;
  const input = e.target as HTMLInputElement;

  let val = input.value.replace(/\D/g, "");
  if (val.length > 1) val = val.slice(-1);

  code.value[i] = val;
  input.value = val;

  const nextIdx = getFirstEmptyIdx();
  if (val && nextIdx !== -1 && nextIdx !== i) {
    focusInput(nextIdx);
  } else if (val && nextIdx === -1 && i < 5) {
    focusInput(5);
  }
}

function onKeydown(e: KeyboardEvent, idx: number) {
  const i = idx - 1;
  const input = codeRefs.value[i];
  if (!input) return;

  if (e.key === "Backspace") {
    if (code.value[i]) {
      code.value[i] = "";
      input.value = "";
      if (i > 0) {
        focusInput(i - 1);
      }
      e.preventDefault();
    } else if (i > 0) {
      const prevInput = codeRefs.value[i - 1];
      code.value[i - 1] = "";
      if (prevInput) prevInput.value = "";
      focusInput(i - 1);
      e.preventDefault();
    }
    return;
  }

  if (e.key === "ArrowLeft" && i > 0) {
    focusInput(i - 1);
    e.preventDefault();
    return;
  }
  if (e.key === "ArrowRight" && i < 5) {
    focusInput(i + 1);
    e.preventDefault();
    return;
  }

  if (/^\d$/.test(e.key)) {
    return;
  }

  if (!e.ctrlKey && !e.metaKey && !["Tab", "Shift", "Alt"].includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault();
  }
}

function onPaste(e: ClipboardEvent) {
  const paste = e.clipboardData?.getData("text") || "";
  if (!paste) return;

  const chars = paste.replace(/\D/g, "").slice(0, 6).split("");
  chars.forEach((c, i) => {
    code.value[i] = c;
    if (codeRefs.value[i]) codeRefs.value[i]!.value = c;
  });

  const nextIdx = getFirstEmptyIdx();
  if (nextIdx !== -1) focusInput(nextIdx);
  else focusInput(5);
}
</script>

<template>
  <form class="fieldset w-full" @submit.prevent>
    <label class="label">{{$t('forgot.code')}}</label>
    <div class="inline-flex justify-between">
      <input
        v-for="idx in 6"
        :key="idx"
        :ref="el => setCodeRef(el, idx - 1)"
        :value="code[idx - 1]"
        autocomplete="one-time-code"
        inputmode="numeric"
        maxlength="1"
        type="text"
        class="input w-12 text-center"
        tabindex="-1"
        @input="e => onInput(e, idx)"
        @keydown="e => onKeydown(e, idx)"
        @paste="onPaste"
        @mousedown="onBoxClick"
      />
    </div>

    <label class="label">{{$t('forgot.new_password')}}</label>
    <label class="input w-full">
      <i class="fa-solid fa-key opacity-50"/>
      <input ref="password" autocomplete="new-password" :type="showPassword ? 'text' : 'password'" class="grow" placeholder="••••••••" @keyup.enter="reset" />
      <button type="button" tabindex="-1" class="opacity-50 hover:opacity-100 cursor-pointer" @click="showPassword = !showPassword">
        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"/>
      </button>
    </label>
    <Transition name="error-reveal">
      <p v-if="passwordError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ passwordError }}</span>
      </p>
    </Transition>
    <Transition name="error-reveal">
      <p v-if="mainError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ mainError }}</span>
      </p>
    </Transition>
    <button class="btn btn-primary mt-4" :disabled="loading" @click="reset">
      <span v-if="loading" class="loading loading-spinner loading-sm"/>
      <i v-else class="fa-solid fa-arrow-right-to-bracket"/>
      <span>{{$t('forgot.submit')}}</span>
    </button>
  </form>
</template>
