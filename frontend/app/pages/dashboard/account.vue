<script setup lang="ts">
const user = {
  name: "John Doe",
  email: "john.doe@example.com",
  profilePicture: null as string | null,
};

const favorites = [
  { id: 1, name: "Spaghetti Carbonara", image: "https://via.placeholder.com/56" },
  { id: 2, name: "Margherita Pizza", image: "https://via.placeholder.com/56" },
  { id: 3, name: "Chicken Tikka Masala", image: "https://via.placeholder.com/56" },
  { id: 4, name: "Caesar Salad", image: "https://via.placeholder.com/56" },
  { id: 5, name: "Beef Tacos", image: "https://via.placeholder.com/56" },
];

const friends = ref([
  { id: 1, name: "Alice Müller", profilePicture: null as string | null },
  { id: 2, name: "Ben Wagner", profilePicture: null as string | null },
  { id: 3, name: "Clara Hofer", profilePicture: null as string | null },
]);

const friendToRemove = ref<{ id: number; name: string } | null>(null);

function confirmRemove(friend: { id: number; name: string }) {
  friendToRemove.value = friend;
}

function cancelRemove() {
  friendToRemove.value = null;
}

function removeFriend() {
  if (!friendToRemove.value) return;
  friends.value = friends.value.filter(f => f.id !== friendToRemove.value!.id);
  friendToRemove.value = null;
}
</script>

<template>
  <div class="container mx-auto px-4 py-10 flex justify-center">
    <div class="w-full max-w-3xl flex flex-col gap-6">

      <!-- Profile Header -->
      <div class="bg-[#001a23] shadow-lg rounded-2xl p-8">
        <div class="flex items-center gap-6">
          <img
            :src="user.profilePicture ? `data:image/png;base64,${user.profilePicture}` : 'https://via.placeholder.com/80'"
            alt="Profile Picture"
            class="w-20 h-20 rounded-full object-cover border-4 border-[#31493c] shrink-0"
          />
          <div>
            <h2 class="text-3xl font-bold text-[#e8f1f2]">{{ user.name }}</h2>
            <p class="text-[#b3efb2] mt-1">{{ user.email }}</p>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <NuxtLink
            to="/dashboard/modifyprofile"
            class="px-5 py-2.5 bg-[#7a9e7e] hover:bg-[#31493c] text-[#e8f1f2] font-semibold rounded-lg transition-colors"
          >
            Manage Profile
          </NuxtLink>
        </div>
      </div>

      <!-- Favorite Foods -->
      <div class="bg-[#001a23] shadow-lg rounded-2xl p-8">
        <h3 class="text-xl font-semibold text-[#e8f1f2] mb-4">
          Favorite Foods
          <span class="text-[#b3efb2] font-normal text-base ml-1">({{ favorites.length }} total)</span>
        </h3>
        <div v-if="favorites.length === 0" class="text-[#b3efb2] opacity-60 text-sm py-6 text-center">
          No favorites yet.
        </div>
        <ul v-else class="overflow-y-auto max-h-72 flex flex-col gap-3 pr-1">
          <li
            v-for="fav in favorites"
            :key="fav.id"
            class="flex items-center gap-4 bg-[#002a36] rounded-xl p-3"
          >
            <img
              :src="fav.image ?? 'https://via.placeholder.com/56'"
              :alt="fav.name"
              class="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <span class="text-[#e8f1f2] font-medium">{{ fav.name }}</span>
          </li>
        </ul>
      </div>

      <!-- Friends -->
      <div class="bg-[#001a23] shadow-lg rounded-2xl p-8">
        <h3 class="text-xl font-semibold text-[#e8f1f2] mb-4">
          Friends
          <span class="text-[#b3efb2] font-normal text-base ml-1">({{ friends.length }} total)</span>
        </h3>
        <div v-if="friends.length === 0" class="text-[#b3efb2] opacity-60 text-sm py-6 text-center">
          No friends added yet.
        </div>
        <ul v-else class="overflow-y-auto max-h-72 flex flex-col gap-3 pr-1">
          <li
            v-for="friend in friends"
            :key="friend.id"
            class="flex items-center gap-4 bg-[#002a36] rounded-xl p-3"
          >
            <img
              :src="friend.profilePicture ? `data:image/png;base64,${friend.profilePicture}` : 'https://via.placeholder.com/40'"
              :alt="friend.name"
              class="w-10 h-10 rounded-full object-cover border-2 border-[#31493c] shrink-0"
            />
            <span class="text-[#e8f1f2] font-medium flex-1">{{ friend.name }}</span>
            <button
              @click="confirmRemove(friend)"
              class="px-3 py-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 hover:text-white font-medium rounded-lg transition-colors text-sm"
            >
              Remove
            </button>
          </li>
        </ul>
      </div>

    </div>

    <!-- Remove Friend Confirmation Modal -->
    <dialog :open="friendToRemove !== null" class="modal">
      <div class="modal-box bg-[#001a23] border border-[#31493c]">
        <h3 class="font-bold text-lg text-[#e8f1f2]">Remove Friend</h3>
        <p class="py-4 text-[#b3efb2]">
          Are you sure you want to remove
          <strong class="text-[#e8f1f2]">{{ friendToRemove?.name }}</strong>
          from your friends?
        </p>
        <div class="modal-action">
          <button @click="cancelRemove" class="btn btn-ghost text-[#b3efb2]">Cancel</button>
          <button @click="removeFriend" class="btn bg-red-700 hover:bg-red-800 border-none text-white">
            Remove
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="cancelRemove">
        <button>close</button>
      </form>
    </dialog>

  </div>
</template>
