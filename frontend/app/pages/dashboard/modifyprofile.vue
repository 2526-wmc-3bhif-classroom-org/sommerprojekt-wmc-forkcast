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
        class="inline-flex items-center gap-2 text-[#b3efb2] hover:text-[#e8f1f2] transition-colors text-sm w-fit"
      >
        <i class="fa-solid fa-arrow-left" />
        Back to Account
      </NuxtLink>

      <h1 class="text-3xl font-bold text-[#e8f1f2]">Manage Profile</h1>

      <!-- Change Username -->
      <div class="bg-[#001a23] shadow-lg rounded-2xl p-8 flex flex-col gap-4">
        <h2 class="text-xl font-semibold text-[#e8f1f2]">Change Username</h2>
        <div class="flex flex-col gap-2">
          <label class="text-[#b3efb2] text-sm font-medium">New Username</label>
          <input
            v-model="newUsername"
            type="text"
            placeholder="Enter new username"
            class="input w-full bg-[#002a36] border border-[#31493c] text-[#e8f1f2] placeholder:text-[#b3efb2]/50 focus:outline-none focus:border-[#7a9e7e]"
          />
        </div>
        <p v-if="usernameError" class="text-red-400 text-sm">{{ usernameError }}</p>
        <p v-if="usernameSuccess" class="text-green-400 text-sm">Username updated successfully.</p>
        <div class="flex justify-end">
          <button
            @click="saveUsername"
            class="px-5 py-2.5 bg-[#7a9e7e] hover:bg-[#31493c] text-[#e8f1f2] font-semibold rounded-lg transition-colors"
          >
            Save Username
          </button>
        </div>
      </div>

      <!-- Change Password -->
      <div class="bg-[#001a23] shadow-lg rounded-2xl p-8 flex flex-col gap-4">
        <h2 class="text-xl font-semibold text-[#e8f1f2]">Change Password</h2>
        <div class="flex flex-col gap-2">
          <label class="text-[#b3efb2] text-sm font-medium">Current Password</label>
          <input
            v-model="currentPassword"
            type="password"
            placeholder="Enter current password"
            class="input w-full bg-[#002a36] border border-[#31493c] text-[#e8f1f2] placeholder:text-[#b3efb2]/50 focus:outline-none focus:border-[#7a9e7e]"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[#b3efb2] text-sm font-medium">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
            class="input w-full bg-[#002a36] border border-[#31493c] text-[#e8f1f2] placeholder:text-[#b3efb2]/50 focus:outline-none focus:border-[#7a9e7e]"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[#b3efb2] text-sm font-medium">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            class="input w-full bg-[#002a36] border border-[#31493c] text-[#e8f1f2] placeholder:text-[#b3efb2]/50 focus:outline-none focus:border-[#7a9e7e]"
          />
        </div>
        <p v-if="passwordError" class="text-red-400 text-sm">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="text-green-400 text-sm">Password updated successfully.</p>
        <div class="flex justify-end">
          <button
            @click="savePassword"
            class="px-5 py-2.5 bg-[#7a9e7e] hover:bg-[#31493c] text-[#e8f1f2] font-semibold rounded-lg transition-colors"
          >
            Save Password
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
