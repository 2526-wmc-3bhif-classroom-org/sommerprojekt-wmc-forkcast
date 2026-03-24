<script setup lang="ts">
const user = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://via.placeholder.com/150"
};
</script>
<template>
  <div class="container mx-auto p-10 my-10 md:p-30 w-full flex justify-center">
    <div class="w-full max-w-5xl bg-[#001a23] shadow-lg rounded-2xl p-12">
      <div class="flex items-center space-x-8">
        <img :src="user.avatar" alt="Profile Picture" class="w-40 h-40 rounded-full object-cover border-4 border-[#31493c]" />
        <div class="flex flex-col">
          <h2 class="text-4xl font-bold text-[#e8f1f2]">{{ user.name }}</h2>
          <p class="text-lg text-[#b3efb2] opacity-90 mt-2">{{ user.email }}</p>
        </div>
      </div>
      <div class="mt-10 border-t border-[#31493c] pt-8 flex justify-end">
        <NuxtLink to="/dashboard/modifyprofile" class="px-6 py-3 bg-[#7a9e7e] hover:bg-[#31493c] text-[#e8f1f2] font-semibold rounded-lg transition-colors">
          Modify Profile
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
