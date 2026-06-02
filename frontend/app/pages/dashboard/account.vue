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
const favoriteToRemove = ref<FavoriteEntry | null>(null);

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

function confirmRemoveFavorite(fav: FavoriteEntry) {
  favoriteToRemove.value = fav;
}

function cancelRemoveFavorite() {
  favoriteToRemove.value = null;
}

async function removeFavorite() {
  if (!favoriteToRemove.value) return;
  const result = await apiRequest(`/users/me/favorites/${favoriteToRemove.value.recipeId}`, 'DELETE', jwtStore.jwt);
  if (result.ok) {
    favorites.value = favorites.value.filter(f => f.recipeId !== favoriteToRemove.value!.recipeId);
  }
  favoriteToRemove.value = null;
}

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
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-6">
            <img
                v-if="user?.profilePicture"
                :src="`data:image/png;base64,${user.profilePicture}`"
                :alt="$t('page.account.profile_picture')"
                class="w-20 h-20 rounded-full object-cover border-4 border-accent shrink-0"
            />
            <div
                v-else
                class="w-20 h-20 rounded-full border-4 border-accent shrink-0 bg-accent flex items-center justify-center"
            >
              <span class="text-accent-content text-2xl font-bold select-none">{{ user?.name?.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <h2 class="card-title text-3xl font-bold text-base-content">{{ user?.name }}</h2>
              <p class="text-primary mt-1">{{ user?.email }}</p>
            </div>
          </div>
          <div class="card-actions justify-end mt-4">
            <nuxt-link-locale
                to="/dashboard/modifyprofile"
                class="btn btn-secondary text-secondary-content"
            >
              {{ $t('page.account.manage_profile') }}
            </nuxt-link-locale>
          </div>
        </div>
      </div>

      <!-- Favorite Foods -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title text-xl font-semibold text-base-content mb-4">
            {{ $t('page.account.favorite_foods') }}
            <span class="text-primary font-normal text-base ml-1">({{ favorites.length }} {{ $t('page.account.total') }})</span>
          </h3>
          <div v-if="favorites.length === 0" class="text-primary opacity-60 text-sm py-6 text-center">
            {{ $t('page.account.no_favorites') }}
          </div>
          <ul v-else class="overflow-y-auto max-h-72 flex flex-col gap-3 pr-1">
            <li
                v-for="fav in favorites"
                :key="fav.recipeId"
                class="flex items-center gap-4 bg-base-200 rounded-box p-3 shadow-sm"
            >
              <img
                  :src="fav.image || 'https://via.placeholder.com/56'"
                  :alt="fav.name"
                  class="w-14 h-14 rounded-lg object-cover shrink-0"
              />
              <span class="text-base-content font-medium flex-1">{{ fav.name }}</span>
              <button
                  @click="confirmRemoveFavorite(fav)"
                  class="btn btn-error btn-sm text-error-content"
              >
                {{ $t('page.account.remove') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Friends -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title text-xl font-semibold text-base-content mb-4">
            {{ $t('page.account.friends') }}
            <span class="text-primary font-normal text-base ml-1">({{ friends.length }} {{ $t('page.account.total') }})</span>
          </h3>
          <div v-if="friends.length === 0" class="text-primary opacity-60 text-sm py-6 text-center">
            {{ $t('page.account.no_friends') }}
          </div>
          <ul v-else class="overflow-y-auto max-h-72 flex flex-col gap-3 pr-1">
            <li
                v-for="friend in friends"
                :key="friend.id"
                class="flex items-center gap-4 bg-base-200 rounded-box p-3 shadow-sm"
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
                  class="btn btn-error btn-sm text-error-content"
              >
                {{ $t('page.account.remove') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

    </div>

    <!-- Remove Favorite Confirmation Modal -->
    <dialog :open="favoriteToRemove !== null" class="modal">
      <div class="modal-box bg-base-100 border border-accent">
        <h3 class="font-bold text-lg text-base-content">{{ $t('page.account.remove_favorite_title') }}</h3>
        <p class="py-4 text-primary">
          {{ $t('page.account.remove_confirm') }}
          <strong class="text-base-content">{{ favoriteToRemove?.name }}</strong>
          {{ $t('page.account.remove_from_favorites') }}
        </p>
        <div class="modal-action">
          <button @click="cancelRemoveFavorite" class="btn btn-ghost text-primary">{{ $t('page.account.cancel') }}</button>
          <button @click="removeFavorite" class="btn btn-error">{{ $t('page.account.remove') }}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="cancelRemoveFavorite">
        <button>close</button>
      </form>
    </dialog>

    <!-- Remove Friend Confirmation Modal -->
    <dialog :open="friendToRemove !== null" class="modal">
      <div class="modal-box bg-base-100 border border-accent">
        <h3 class="font-bold text-lg text-base-content">{{ $t('page.account.remove_friend_title') }}</h3>
        <p class="py-4 text-primary">
          {{ $t('page.account.remove_confirm') }}
          <strong class="text-base-content">{{ friendToRemove?.name }}</strong>
          {{ $t('page.account.remove_from_friends') }}
        </p>
        <div class="modal-action">
          <button @click="cancelRemove" class="btn btn-ghost text-primary">{{ $t('page.account.cancel') }}</button>
          <button @click="removeFriend" class="btn btn-error">{{ $t('page.account.remove') }}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="cancelRemove">
        <button>close</button>
      </form>
    </dialog>

  </div>
</template>
