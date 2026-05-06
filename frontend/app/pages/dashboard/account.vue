<script setup lang="ts">
import type {User} from '~/assets/model/user';
import useApiConnection from '~/assets/util/api-connector';
import {useJwtStore} from '~/assets/store/jwt-store';

type PublicUser = {
  id: number;
  name: string;
  profilePicture: string | null;
  isVerified: boolean;
};

type FavoriteFood = {
  userId: number;
  recipeId: number;
};

type Recipe = {
  id: number;
  name: string;
  image: string;
};

type FavoriteEntry = {
  recipeId: number;
  name: string;
  image: string;
};

const {apiRequest} = useApiConnection();
const jwtStore = useJwtStore();

const user = ref<User | null>(null);
const favorites = ref<FavoriteEntry[]>([]);
const friends = ref<PublicUser[]>([]);
const friendToRemove = ref<PublicUser | null>(null);

async function loadData() {
  const jwt = jwtStore.jwt;

  const profileResult = await apiRequest<User>('/users/me', 'GET', jwt);
  if (profileResult.ok && profileResult.value) {
    user.value = profileResult.value;
  }

  const favResult = await apiRequest<FavoriteFood[]>('/users/me/favorites', 'GET', jwt);
  if (favResult.ok && favResult.value) {
    favorites.value = await Promise.all(
      favResult.value.map(async (fav) => {
        const recipeResult = await apiRequest<Recipe>(`/recipes/${fav.recipeId}`, 'GET', jwt);
        if (recipeResult.ok && recipeResult.value) {
          return {recipeId: fav.recipeId, name: recipeResult.value.name, image: recipeResult.value.image};
        }
        return {recipeId: fav.recipeId, name: `Recipe #${fav.recipeId}`, image: ''};
      })
    );
  }

  const friendsResult = await apiRequest<PublicUser[]>('/users/me/friends', 'GET', jwt);
  if (friendsResult.ok && friendsResult.value) {
    friends.value = friendsResult.value;
  }
}

onMounted(loadData);

function confirmRemove(friend: PublicUser) {
  friendToRemove.value = friend;
}

function cancelRemove() {
  friendToRemove.value = null;
}

async function removeFriend() {
  if (!friendToRemove.value) return;
  const result = await apiRequest(`/users/me/friends/${friendToRemove.value.id}`, 'DELETE', jwtStore.jwt);
  if (result.ok) {
    friends.value = friends.value.filter(f => f.id !== friendToRemove.value!.id);
  }
  friendToRemove.value = null;
}
</script>

<template>
  <div class="container mx-auto px-4 py-10 flex justify-center">
    <div class="w-full max-w-3xl flex flex-col gap-6">

      <!-- Profile Header -->
      <div class="bg-base-100 shadow-lg rounded-2xl p-8">
        <div class="flex items-center gap-6">
          <img
              v-if="user?.profilePicture"
              :src="`data:image/png;base64,${user.profilePicture}`"
              alt="Profile Picture"
              class="w-20 h-20 rounded-full object-cover border-4 border-accent shrink-0"
          />
          <div
              v-else
              class="w-20 h-20 rounded-full border-4 border-accent shrink-0 bg-accent flex items-center justify-center"
          >
            <span class="text-accent-content text-2xl font-bold select-none">{{ user?.name?.charAt(0).toUpperCase() }}</span>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-base-content">{{ user?.name }}</h2>
            <p class="text-primary mt-1">{{ user?.email }}</p>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <NuxtLink
              to="/dashboard/modifyprofile"
              class="px-5 py-2.5 bg-secondary hover:bg-accent text-secondary-content font-semibold rounded-lg transition-colors"
          >
            Manage Profile
          </NuxtLink>
        </div>
      </div>

      <!-- Favorite Foods -->
      <div class="bg-base-100 shadow-lg rounded-2xl p-8">
        <h3 class="text-xl font-semibold text-base-content mb-4">
          Favorite Foods
          <span class="text-primary font-normal text-base ml-1">({{ favorites.length }} total)</span>
        </h3>
        <div v-if="favorites.length === 0" class="text-primary opacity-60 text-sm py-6 text-center">
          No favorites yet.
        </div>
        <ul v-else class="overflow-y-auto max-h-72 flex flex-col gap-3 pr-1">
          <li
              v-for="fav in favorites"
              :key="fav.recipeId"
              class="flex items-center gap-4 bg-base-300 rounded-xl p-3"
          >
            <img
                :src="fav.image || 'https://via.placeholder.com/56'"
                :alt="fav.name"
                class="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <span class="text-base-content font-medium">{{ fav.name }}</span>
          </li>
        </ul>
      </div>

      <!-- Friends -->
      <div class="bg-base-100 shadow-lg rounded-2xl p-8">
        <h3 class="text-xl font-semibold text-base-content mb-4">
          Friends
          <span class="text-primary font-normal text-base ml-1">({{ friends.length }} total)</span>
        </h3>
        <div v-if="friends.length === 0" class="text-primary opacity-60 text-sm py-6 text-center">
          No friends added yet.
        </div>
        <ul v-else class="overflow-y-auto max-h-72 flex flex-col gap-3 pr-1">
          <li
              v-for="friend in friends"
              :key="friend.id"
              class="flex items-center gap-4 bg-base-300 rounded-xl p-3"
          >
            <img
                v-if="friend.profilePicture"
                :src="`data:image/png;base64,${friend.profilePicture}`"
                :alt="friend.name"
                class="w-10 h-10 rounded-full object-cover border-2 border-accent shrink-0"
            />
            <div
                v-else
                class="w-10 h-10 rounded-full border-2 border-accent shrink-0 bg-accent flex items-center justify-center"
            >
              <span class="text-accent-content text-sm font-bold select-none">{{ friend.name.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="text-base-content font-medium flex-1">{{ friend.name }}</span>
            <button
                @click="confirmRemove(friend)"
                class="px-3 py-1.5 bg-error/30 hover:bg-error text-error hover:text-error-content font-medium rounded-lg transition-colors text-sm"
            >
              Remove
            </button>
          </li>
        </ul>
      </div>

    </div>

    <!-- Remove Friend Confirmation Modal -->
    <dialog :open="friendToRemove !== null" class="modal">
      <div class="modal-box bg-base-100 border border-accent">
        <h3 class="font-bold text-lg text-base-content">Remove Friend</h3>
        <p class="py-4 text-primary">
          Are you sure you want to remove
          <strong class="text-base-content">{{ friendToRemove?.name }}</strong>
          from your friends?
        </p>
        <div class="modal-action">
          <button @click="cancelRemove" class="btn btn-ghost text-primary">Cancel</button>
          <button @click="removeFriend" class="btn btn-error">
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
