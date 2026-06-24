<script setup lang="ts">
import type { Failure } from "~/assets/model/failure";
import useAuthService from "~/assets/service/auth-service";
import useFailureHandler from "~/assets/util/failure-handler";
import { onMounted, ref, watch } from 'vue';

const props = defineProps(["enteredEmail"]);
const emit = defineEmits(["restart"]);

// Persist the typed code so a reload mid-verification doesn't wipe it.
const CODE_KEY = "signup-pending-code";

// Clears the persisted step and hands control back to the credentials form.
function restart() {
  sessionStorage.removeItem("signup-pending-email");
  sessionStorage.removeItem(CODE_KEY);
  emit("restart");
}

const code = ref(["", "", "", "", "", ""]);
const codeRefs = ref<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
const isPasting = ref(false);

const mainError = ref("");
const loading = ref(false);

const authService = useAuthService();
const failureHandler = useFailureHandler();
const { t } = useI18n();

const localePath = useLocalePath();
const router = useRouter();
const route = useRoute();

// Only honour internal paths so ?redirect can't bounce to an external site.
function redirectTarget(): string {
  const r = route.query.redirect;
  if (typeof r === "string" && r.startsWith("/") && !r.startsWith("//")) return r;
  return localePath("/dashboard");
}

failureHandler.addHandler("code", (message) => {
  mainError.value = message;
});

failureHandler.setMainHandler(message => {
  mainError.value = message;
});

async function verify() {
  const codeStr = code.value.join("");
  if (!codeStr || codeStr.length < 6) {
    failureHandler.fail({ message: t('error.enter_code') } as Failure);
    return;
  }
  loading.value = true;
  const failure = await authService.verify(props.enteredEmail, codeStr);
  loading.value = false;
  if (!failure.ok) {
    // A 401 here means the code itself was rejected, not a session problem.
    if (failure.needsAuth) {
      mainError.value = t('signup.invalid_code');
    } else {
      failureHandler.fail(failure.failure as Failure);
    }
    return;
  }

  // Verified — drop the persisted step so a later visit starts fresh.
  sessionStorage.removeItem("signup-pending-email");
  sessionStorage.removeItem(CODE_KEY);

  // verify() now returns a session token, so the user is logged in even if a
  // reload had wiped the password.
  await router.push(redirectTarget());
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
  const saved = sessionStorage.getItem(CODE_KEY);
  if (saved) {
    saved.replace(/\D/g, "").slice(0, 6).split("").forEach((d, i) => { code.value[i] = d; });
    const firstEmpty = getFirstEmptyIdx();
    focusInput(firstEmpty === -1 ? 5 : firstEmpty);
  } else {
    focusInput(0);
  }
});

// Mirror every change into sessionStorage; restored on the next mount/reload.
watch(code, (val) => {
  sessionStorage.setItem(CODE_KEY, val.join(""));
}, { deep: true });

function onInput(e: Event, idx: number) {
  const i = idx - 1;
  const input = e.target as HTMLInputElement;

  let val = input.value.replace(/\D/g, "");
  // Always use the last digit entered, replacing any existing value
  if (val.length > 1) val = val.slice(-1);

  code.value[i] = val;
  input.value = val;

  // Always focus the first empty field after input, or stay at last if all filled
  const nextIdx = getFirstEmptyIdx();
  if (val && nextIdx !== -1 && nextIdx !== i) {
    focusInput(nextIdx);
  } else if (val && nextIdx === -1 && i < 5) {
    focusInput(5);
  }

  // If all boxes are filled, trigger verify, but skip if pasting
  if (!isPasting.value && code.value.every(c => c.length === 1)) {
    verify();
  }
}

function onKeydown(e: KeyboardEvent, idx: number) {
  const i = idx - 1;
  const input = codeRefs.value[i];
  if (!input) return;

  // Handle Backspace
  if (e.key === "Backspace") {
    if (code.value[i]) {
      code.value[i] = "";
      input.value = "";
      if (i > 0) {
        focusInput(i - 1);
      }
      e.preventDefault();
    } else if (i > 0) {
      // Move focus to previous field and clear it
      const prevInput = codeRefs.value[i - 1];
      code.value[i - 1] = "";
      if (prevInput) prevInput.value = "";
      focusInput(i - 1);
      e.preventDefault();
    }
    return;
  }

  // Handle Arrow navigation
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

  // Allow digit entry, let onInput handle focus advance
  if (/^\d$/.test(e.key)) {
    // No preventDefault: allow input
    return;
  }

  // Prevent non-digit input except allowed keys
  if (!e.ctrlKey && !e.metaKey && !["Tab", "Shift", "Alt"].includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault();
  }
}

function onPaste(e: ClipboardEvent) {
  const paste = e.clipboardData?.getData("text") || "";
  if (!paste) return;

  const chars = paste.replace(/\D/g, "").slice(0, 6).split("");
  isPasting.value = true;
  chars.forEach((c, i) => {
    code.value[i] = c;
    if (codeRefs.value[i]) codeRefs.value[i]!.value = c;
  });
  // Keep isPasting true until after all input events from paste are processed
  setTimeout(() => { isPasting.value = false }, 0);

  // Focus the first empty field after paste, or last if all filled
  const nextIdx = getFirstEmptyIdx();
  if (nextIdx !== -1) focusInput(nextIdx);
  else focusInput(5);

  if (chars.length === 6) verify();
}
</script>

<template>
  <form class="fieldset w-full" @submit.prevent>
    <div class="flex flex-col items-center text-center gap-2 mb-4">
      <div class="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <i class="fa-solid fa-envelope-open-text text-2xl"/>
      </div>
      <h2 class="text-xl font-bold">{{ $t('signup.check_title') }}</h2>
      <p class="text-sm text-base-content/60">
        <i18n-t keypath="signup.check_subtitle">
          <template #email><span class="font-semibold text-base-content">{{ enteredEmail }}</span></template>
        </i18n-t>
      </p>
    </div>

    <label class="label">
      <i class="fa-solid fa-hashtag"/>
      <span>{{$t('signup.code')}}</span>
    </label>
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
    <Transition name="error-reveal">
      <p v-if="mainError" class="label text-error gap-1 text-wrap">
        <i class="fa-solid fa-triangle-exclamation"/><span>{{ mainError }}</span>
      </p>
    </Transition>
    <button class="btn btn-primary mt-4" :disabled="loading" @click="verify">
      <span v-if="loading" class="loading loading-spinner loading-sm"/>
      <i v-else class="fa-solid fa-arrow-right-to-bracket"/>
      <span>{{$t('signup.submit')}}</span>
    </button>
    <p class="text-xs text-base-content/40 text-center mt-2">
      <i class="fa-solid fa-circle-info mr-1"/>{{ $t('signup.check_hint') }}
    </p>
    <button type="button" class="link link-hover text-sm mt-1 self-center" @click="restart">
      <i class="fa-solid fa-arrow-left mr-1"/>{{ $t('signup.different_email') }}
    </button>
  </form>
</template>