<script setup lang="ts">
const newUsername = ref("");
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const usernameSuccess = ref(false);
const usernameError = ref("");
const passwordSuccess = ref(false);
const passwordError = ref("");

function saveUsername() {
  usernameError.value = "";
  usernameSuccess.value = false;
  if (!newUsername.value.trim()) {
    usernameError.value = "Username cannot be empty.";
    return;
  }
  // TODO: wire up to PATCH /api/users/me/name
  usernameSuccess.value = true;
}

function savePassword() {
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
  // TODO: wire up to PATCH /api/users/me/password
  passwordSuccess.value = true;
}
</script>

<template>
  <div class="container mx-auto px-4 py-10 flex justify-center">
    <div class="w-full max-w-xl flex flex-col gap-6">

      <!-- Back link -->
      <NuxtLink
        to="/dashboard/account"
        class="btn btn-ghost w-fit pl-0"
      >
        <i class="fa-solid fa-arrow-left" />
        Back to Account
      </NuxtLink>

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
            />
          </div>
          <p v-if="usernameError" class="text-error text-sm">{{ usernameError }}</p>
          <p v-if="usernameSuccess" class="text-success text-sm">Username updated successfully.</p>
          <div class="card-actions justify-end mt-2">
            <button
              @click="saveUsername"
              class="btn btn-secondary text-secondary-content"
            >
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
            />
          </div>
          <p v-if="passwordError" class="text-error text-sm">{{ passwordError }}</p>
          <p v-if="passwordSuccess" class="text-success text-sm">Password updated successfully.</p>
          <div class="card-actions justify-end mt-2">
            <button
              @click="savePassword"
              class="btn btn-secondary text-secondary-content"
            >
              Save Password
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
