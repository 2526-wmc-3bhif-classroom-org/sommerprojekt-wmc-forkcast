<script setup lang="ts">
import useApiConnection from '~/assets/util/api-connector';
import {useJwtStore} from '~/assets/store/jwt-store';

const {apiRequest} = useApiConnection();
const jwtStore = useJwtStore();
const { t } = useI18n();

const newUsername = ref("");
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const usernameSuccess = ref(false);
const usernameError = ref("");
const passwordSuccess = ref(false);
const passwordError = ref("");
const usernameLoading = ref(false);
const passwordLoading = ref(false);

async function saveUsername() {
  usernameError.value = "";
  usernameSuccess.value = false;
  if (!newUsername.value.trim()) {
    usernameError.value = t('page.modifyprofile.username.empty');
    return;
  }
  usernameLoading.value = true;
  const result = await apiRequest('/users/me/name', 'PATCH', jwtStore.jwt, {name: newUsername.value.trim()}, false);
  usernameLoading.value = false;
  if (result.ok) {
    usernameSuccess.value = true;
    newUsername.value = "";
  } else {
    const errs = result.failure?.errors;
    usernameError.value = errs?.length
      ? errs.map(e => e.msg).join(' · ')
      : (result.failure?.message ?? t('page.modifyprofile.username.error'));
  }
}

async function savePassword() {
  passwordError.value = "";
  passwordSuccess.value = false;
  if (!currentPassword.value) {
    passwordError.value = t('page.modifyprofile.password.empty_current');
    return;
  }
  if (newPassword.value.length < 8) {
    passwordError.value = t('page.modifyprofile.password.too_short');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = t('page.modifyprofile.password.mismatch');
    return;
  }
  passwordLoading.value = true;
  const result = await apiRequest('/users/me/password', 'PATCH', jwtStore.jwt, {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  }, false);
  passwordLoading.value = false;
  if (result.ok) {
    passwordSuccess.value = true;
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } else {
    const errs = result.failure?.errors;
    passwordError.value = errs?.length
      ? errs.map(e => `${e.path}: ${e.msg}`).join(' · ')
      : (result.failure?.message ?? t('page.modifyprofile.password.error'));
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-10 max-w-xl">

    <div class="flex items-center gap-2 text-sm text-base-content/50 mb-6">
      <nuxt-link-locale to="/dashboard/account" class="hover:text-base-content transition-colors">
        {{ $t('component.navbar.user.account') }}
      </nuxt-link-locale>
      <i class="fa-solid fa-chevron-right text-xs" />
      <span class="text-base-content">{{ $t('page.modifyprofile.title') }}</span>
    </div>

    <h1 class="text-2xl font-bold text-base-content mb-6">{{ $t('page.modifyprofile.title') }}</h1>

    <!-- Change Username -->
    <div class="card bg-base-100 shadow-md border border-base-200 mb-4">
      <div class="card-body gap-4">
        <h2 class="font-semibold text-base-content flex items-center gap-2">
          <i class="fa-solid fa-user text-accent" />
          {{ $t('page.modifyprofile.username.title') }}
        </h2>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-base-content/70">{{ $t('page.modifyprofile.username.label') }}</label>
          <input
            v-model="newUsername"
            type="text"
            :placeholder="$t('page.modifyprofile.username.placeholder')"
            class="input input-bordered w-full"
            @keyup.enter="saveUsername"
          />
        </div>
        <p v-if="usernameError" class="text-error text-sm flex items-center gap-1.5">
          <i class="fa-solid fa-circle-exclamation text-xs" />
          {{ usernameError }}
        </p>
        <p v-if="usernameSuccess" class="text-success text-sm flex items-center gap-1.5">
          <i class="fa-solid fa-circle-check text-xs" />
          {{ $t('page.modifyprofile.username.success') }}
        </p>
        <div class="card-actions justify-end">
          <button
            @click="saveUsername"
            :disabled="usernameLoading"
            class="btn btn-secondary btn-sm text-secondary-content"
          >
            <span v-if="usernameLoading" class="loading loading-spinner loading-xs" />
            {{ $t('page.modifyprofile.username.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password -->
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body gap-4">
        <h2 class="font-semibold text-base-content flex items-center gap-2">
          <i class="fa-solid fa-lock text-accent" />
          {{ $t('page.modifyprofile.password.title') }}
        </h2>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-base-content/70">{{ $t('page.modifyprofile.password.current') }}</label>
          <input
            v-model="currentPassword"
            type="password"
            :placeholder="$t('page.modifyprofile.password.current_placeholder')"
            class="input input-bordered w-full"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-base-content/70">{{ $t('page.modifyprofile.password.new') }}</label>
          <input
            v-model="newPassword"
            type="password"
            :placeholder="$t('page.modifyprofile.password.new_placeholder')"
            class="input input-bordered w-full"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-base-content/70">{{ $t('page.modifyprofile.password.confirm') }}</label>
          <input
            v-model="confirmPassword"
            type="password"
            :placeholder="$t('page.modifyprofile.password.confirm_placeholder')"
            class="input input-bordered w-full"
            @keyup.enter="savePassword"
          />
        </div>
        <p v-if="passwordError" class="text-error text-sm flex items-center gap-1.5">
          <i class="fa-solid fa-circle-exclamation text-xs" />
          {{ passwordError }}
        </p>
        <p v-if="passwordSuccess" class="text-success text-sm flex items-center gap-1.5">
          <i class="fa-solid fa-circle-check text-xs" />
          {{ $t('page.modifyprofile.password.success') }}
        </p>
        <div class="card-actions justify-end">
          <button
            @click="savePassword"
            :disabled="passwordLoading"
            class="btn btn-secondary btn-sm text-secondary-content"
          >
            <span v-if="passwordLoading" class="loading loading-spinner loading-xs" />
            {{ $t('page.modifyprofile.password.save') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
