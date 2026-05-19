<script setup lang="ts">
import useApiConnection from '~/assets/util/api-connector';
import {useJwtStore} from '~/assets/store/jwt-store';

const {apiRequest} = useApiConnection();
const jwtStore = useJwtStore();
const router = useRouter();

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
    usernameError.value = "Username cannot be empty.";
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
      : (result.failure?.message ?? "Failed to update username.");
  }
}

async function savePassword() {
  passwordError.value = "";
  passwordSuccess.value = false;
  if (!currentPassword.value) {
    passwordError.value = "Please enter your current password.";
    return;
  }
  if (newPassword.value.length < 8) {
    passwordError.value = "New password must be at least 8 characters.";
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "New passwords do not match.";
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
      : (result.failure?.message ?? "Failed to update password.");
  }
}
</script>

<template>
  <div class="container mx-auto px-4 pt-20 pb-10 flex justify-center">
    <div class="w-full max-w-xl flex flex-col gap-6">

      <!-- Back button -->
      <button
        @click="router.push('/dashboard/account')"
        class="btn btn-ghost w-fit"
      >
        <i class="fa-solid fa-arrow-left" />
        Back to Account
      </button>

      <h1 class="text-3xl font-bold text-base-content">Manage Profile</h1>

      <!-- Change Username -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body flex flex-col gap-4">
          <h2 class="card-title text-xl font-semibold text-base-content">Change Username</h2>
          <div class="flex flex-col gap-2">
            <label class="text-base-content text-sm font-medium">New Username</label>
            <input
              v-model="newUsername"
              type="text"
              placeholder="Enter new username"
              class="input input-bordered w-full"
              @keyup.enter="saveUsername"
            />
          </div>
          <p v-if="usernameError" class="text-error text-sm">{{ usernameError }}</p>
          <p v-if="usernameSuccess" class="text-success text-sm">Username updated successfully.</p>
          <div class="card-actions justify-end mt-2">
            <button
              @click="saveUsername"
              :disabled="usernameLoading"
              class="btn btn-secondary text-secondary-content"
            >
              <span v-if="usernameLoading" class="loading loading-spinner loading-sm" />
              Save Username
            </button>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body flex flex-col gap-4">
          <h2 class="card-title text-xl font-semibold text-base-content">Change Password</h2>
          <div class="flex flex-col gap-2">
            <label class="text-base-content text-sm font-medium">Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="Enter current password"
              class="input input-bordered w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-base-content text-sm font-medium">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Enter new password"
              class="input input-bordered w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-base-content text-sm font-medium">Confirm New Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              class="input input-bordered w-full"
              @keyup.enter="savePassword"
            />
          </div>
          <p v-if="passwordError" class="text-error text-sm">{{ passwordError }}</p>
          <p v-if="passwordSuccess" class="text-success text-sm">Password updated successfully.</p>
          <div class="card-actions justify-end mt-2">
            <button
              @click="savePassword"
              :disabled="passwordLoading"
              class="btn btn-secondary text-secondary-content"
            >
              <span v-if="passwordLoading" class="loading loading-spinner loading-sm" />
              Save Password
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
