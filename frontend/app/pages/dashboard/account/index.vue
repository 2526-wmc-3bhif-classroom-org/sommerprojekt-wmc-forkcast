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

definePageMeta({ showFooter: false })

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
  <div class="grid grid-rows-[4rem_1fr] grid-cols-2 w-screen h-screen px-4 pb-4 gap-x-4">

    <!-- Navbar spacer -->
    <div class="col-span-2" />

    <!-- Left column: profile card + friends card -->
    <div class="flex flex-col gap-4 overflow-hidden">

      <!-- Profile stats card -->
      <div class="bg-base-100 rounded-2xl shrink-0">
        <div class="stats stats-horizontal w-full rounded-2xl">
          <div class="stat">
            <div class="stat-figure flex items-center justify-center">
              <div class="avatar placeholder">
                <div v-if="!user?.profilePicture" class="bg-primary text-primary-content rounded-full w-14 flex items-center justify-center">
                  <span class="text-xl font-bold">{{ user?.name?.charAt(0).toUpperCase() }}</span>
                </div>
                <div v-else class="rounded-full w-14">
                  <img :src="`data:image/png;base64,${user.profilePicture}`" :alt="$t('page.account.profile_picture')" />
                </div>
              </div>
            </div>
            <div class="stat-title">{{ user?.email }}</div>
            <div class="stat-value text-base-content">{{ user?.name }}</div>
            <div class="stat-desc mt-2">
              <nuxt-link-locale to="/dashboard/account/edit" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-pen-to-square" />
                {{ $t('page.account.manage_profile') }}
              </nuxt-link-locale>
            </div>
          </div>
          <div class="stat">
            <div class="stat-figure text-primary">
              <i class="fa-solid fa-heart text-3xl" />
            </div>
            <div class="stat-title">{{ $t('page.account.favorite_foods') }}</div>
            <div class="stat-value text-primary">{{ favorites.length }}</div>
          </div>
          <div class="stat">
            <div class="stat-figure text-secondary">
              <i class="fa-solid fa-user-group text-3xl" />
            </div>
            <div class="stat-title">{{ $t('page.account.friends') }}</div>
            <div class="stat-value text-secondary">{{ friends.length }}</div>
          </div>
        </div>
      </div>

      <!-- Friends card -->
      <div class="bg-base-100 rounded-2xl flex flex-col flex-1 overflow-hidden">
        <div class="flex items-center gap-3 px-4 py-3 border-b border-base-200 shrink-0">
          <i class="fa-solid fa-user-group text-primary" />
          <span class="font-semibold text-base-content">{{ $t('page.account.friends') }}</span>
        </div>
        <div v-if="friends.length === 0" class="flex-1 flex items-center justify-center text-base-content/30 select-none flex-col gap-3">
          <i class="fa-solid fa-user-group text-4xl" />
          <span class="text-sm font-medium">{{ $t('page.account.no_friends') }}</span>
        </div>
        <div v-else class="flex-1 overflow-y-auto">
          <table class="table table-zebra w-full">
            <thead class="sticky top-0 bg-base-200 z-10">
              <tr>
                <th></th>
                <th>{{ $t('page.account.friends') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="friend in friends" :key="friend.id">
                <td class="w-16">
                  <div class="avatar placeholder">
                    <div v-if="!friend.profilePicture" class="bg-neutral text-neutral-content rounded-full w-10 flex items-center justify-center">
                      <span class="text-sm font-bold">{{ friend.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div v-else class="rounded-full w-10">
                      <img :src="`data:image/png;base64,${friend.profilePicture}`" :alt="friend.name" />
                    </div>
                  </div>
                </td>
                <td class="font-medium text-base-content">{{ friend.name }}</td>
                <td class="text-right">
                  <button @click="confirmRemove(friend)" class="btn btn-error btn-sm">
                    {{ $t('page.account.remove') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Right column: favorites card -->
    <div class="bg-base-100 rounded-2xl flex flex-col overflow-hidden">
      <div class="flex items-center gap-3 px-4 py-3 border-b border-base-200 shrink-0">
        <i class="fa-solid fa-heart text-primary" />
        <span class="font-semibold text-base-content">{{ $t('page.account.favorite_foods') }}</span>
      </div>
      <div v-if="favorites.length === 0" class="flex-1 flex items-center justify-center text-base-content/30 select-none flex-col gap-3">
        <i class="fa-solid fa-heart text-4xl" />
        <span class="text-sm font-medium">{{ $t('page.account.no_favorites') }}</span>
      </div>
      <div v-else class="flex-1 overflow-y-auto">
        <table class="table table-zebra w-full">
          <thead class="sticky top-0 bg-base-200 z-10">
            <tr>
              <th></th>
              <th>{{ $t('page.account.favorite_foods') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fav in favorites" :key="fav.recipeId">
              <td class="w-16">
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img :src="fav.image || 'https://via.placeholder.com/48'" :alt="fav.name" />
                  </div>
                </div>
              </td>
              <td class="font-medium text-base-content">{{ fav.name }}</td>
              <td class="text-right">
                <button @click="confirmRemoveFavorite(fav)" class="btn btn-error btn-sm">
                  {{ $t('page.account.remove') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <!-- Remove Favorite Modal -->
  <dialog :open="favoriteToRemove !== null" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('page.account.remove_favorite_title') }}</h3>
      <p class="py-4">
        {{ $t('page.account.remove_confirm') }}
        <strong>{{ favoriteToRemove?.name }}</strong>
        {{ $t('page.account.remove_from_favorites') }}
      </p>
      <div class="modal-action">
        <button @click="cancelRemoveFavorite" class="btn btn-ghost">{{ $t('page.account.cancel') }}</button>
        <button @click="removeFavorite" class="btn btn-error">{{ $t('page.account.remove') }}</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="cancelRemoveFavorite">
      <button>close</button>
    </form>
  </dialog>

  <!-- Remove Friend Modal -->
  <dialog :open="friendToRemove !== null" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('page.account.remove_friend_title') }}</h3>
      <p class="py-4">
        {{ $t('page.account.remove_confirm') }}
        <strong>{{ friendToRemove?.name }}</strong>
        {{ $t('page.account.remove_from_friends') }}
      </p>
      <div class="modal-action">
        <button @click="cancelRemove" class="btn btn-ghost">{{ $t('page.account.cancel') }}</button>
        <button @click="removeFriend" class="btn btn-error">{{ $t('page.account.remove') }}</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="cancelRemove">
      <button>close</button>
    </form>
  </dialog>
</template>
