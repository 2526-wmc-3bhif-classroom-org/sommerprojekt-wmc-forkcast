<script setup lang="ts">
import type { Failure } from "~/assets/model/failure";
import useAuthService from "~/assets/service/auth-service";
import useFailureHandler from "~/assets/util/failure-handler";
import { onMounted, ref } from 'vue';

const props = defineProps(["enteredEmail", "enteredPassword"]);

const code = ref(["", "", "", "", "", ""]);
const codeRefs = ref<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

const mainError = ref<HTMLSpanElement>();

const authService = useAuthService();
const failureHandler = useFailureHandler();

const localePath = useLocalePath();
const router = useRouter();

failureHandler.addHandler("code", (message) => {
  if (mainError.value) mainError.value.innerText = message;
});

failureHandler.setMainHandler(message => {
  if (mainError.value) mainError.value.innerText = message;
});

async function verify() {
  const codeStr = code.value.join("");
  if (!codeStr || codeStr.length < 6) {
    failureHandler.fail({ message: "Please enter the verification code." } as Failure);
    return;
  }
  const failure = await authService.verify(props.enteredEmail, props.enteredPassword, codeStr);
  if (!failure.ok) {
    failureHandler.fail(failure.failure as Failure);
    return;
  }
  await router.push(localePath("/dashboard"));
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

  // If all boxes are filled, trigger verify
  if (code.value.every(c => c.length === 1)) {
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
  chars.forEach((c, i) => {
    code.value[i] = c;
    if (codeRefs.value[i]) codeRefs.value[i]!.value = c;
  });

  // Focus the first empty field after paste, or last if all filled
  const nextIdx = getFirstEmptyIdx();
  if (nextIdx !== -1) focusInput(nextIdx);
  else focusInput(5);

  if (chars.length === 6) verify();
}
</script>

<template>
  <form class="fieldset w-full" @submit.prevent>
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
    <label class="label text-error">
      <i v-if="failureHandler.hasMain() || failureHandler.has('code')" class="fa-solid fa-triangle-exclamation"/>
      <span ref="mainError"></span>
    </label>
    <button class="btn btn-primary mt-4" @click="verify">
      <i class="fa-solid fa-arrow-right-to-bracket"/>
      <span>{{$t('signup.submit')}}</span>
    </button>
  </form>
</template>