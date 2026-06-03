<script setup lang="ts">
import type {User} from '~/assets/model/user';
import type {RecipePreview} from '~/assets/model/recipe-preview';
import useApiConnection from '~/assets/util/api-connector';
import {useAuthStore} from '~/assets/store/auth-store';
import {useFavoritesStore} from '~/assets/store/favorites-store';
import {useRecipeStore} from '~/assets/store/recipe-store';

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

definePageMeta({ showFooter: false })

const {apiRequest} = useApiConnection();
const authStore = useAuthStore();
const favStore = useFavoritesStore();
const recipeStore = useRecipeStore();
const { t } = useI18n();

const user = ref<User | null>(null);

// Edit modal: null | 'chooser' | 'username' | 'password'
const editModal = ref<null | 'chooser' | 'username' | 'password'>(null);
const newUsername = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const usernameSuccess = ref(false);
const usernameError = ref('');
const passwordSuccess = ref(false);
const passwordError = ref('');
const usernameLoading = ref(false);
const passwordLoading = ref(false);

function openEditModal() {
  newUsername.value = '';
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  usernameSuccess.value = false;
  usernameError.value = '';
  passwordSuccess.value = false;
  passwordError.value = '';
  editModal.value = 'chooser';
}

async function saveUsername() {
  usernameError.value = '';
  usernameSuccess.value = false;
  if (!newUsername.value.trim()) { usernameError.value = t('page.modifyprofile.username.empty'); return; }
  usernameLoading.value = true;
  const result = await apiRequest('/users/me/name', 'PATCH', authStore.jwt, {name: newUsername.value.trim()}, false);
  usernameLoading.value = false;
  if (result.ok) {
    usernameSuccess.value = true;
    newUsername.value = '';
    if (user.value) user.value = {...user.value, name: newUsername.value || user.value.name};
  } else {
    const errs = result.failure?.errors;
    usernameError.value = errs?.length ? errs.map(e => e.msg).join(' · ') : (result.failure?.message ?? t('page.modifyprofile.username.error'));
  }
}

async function savePassword() {
  passwordError.value = '';
  passwordSuccess.value = false;
  if (!currentPassword.value) { passwordError.value = t('page.modifyprofile.password.empty_current'); return; }
  if (newPassword.value.length < 8) { passwordError.value = t('page.modifyprofile.password.too_short'); return; }
  if (newPassword.value !== confirmPassword.value) { passwordError.value = t('page.modifyprofile.password.mismatch'); return; }
  passwordLoading.value = true;
  const result = await apiRequest('/users/me/password', 'PATCH', authStore.jwt, {currentPassword: currentPassword.value, newPassword: newPassword.value}, false);
  passwordLoading.value = false;
  if (result.ok) {
    passwordSuccess.value = true;
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } else {
    const errs = result.failure?.errors;
    passwordError.value = errs?.length ? errs.map(e => `${e.path}: ${e.msg}`).join(' · ') : (result.failure?.message ?? t('page.modifyprofile.password.error'));
  }
}
const favorites = ref<RecipePreview[]>([]);
const favCount = computed(() => favorites.value.filter(f => favStore.has(f.id)).length);
const friends = ref<PublicUser[]>([]);
const friendToRemove = ref<PublicUser | null>(null);
const favoriteToRemove = ref<RecipePreview | null>(null);

async function loadData() {
  const jwt = authStore.jwt;

  const profileResult = await apiRequest<User>('/users/me', 'GET', jwt);
  if (profileResult.ok && profileResult.value) {
    user.value = profileResult.value;
  }

  const favResult = await apiRequest<FavoriteFood[]>('/users/me/favorites', 'GET', jwt);
  if (favResult.ok && favResult.value) {
    const results = await Promise.all(favResult.value.map(fav => recipeStore.getRecipe(fav.recipeId)));
    favorites.value = results.filter(r => r.ok && r.value).map(r => r.value!);
  }

  const friendsResult = await apiRequest<PublicUser[]>('/users/me/friends', 'GET', jwt);
  if (friendsResult.ok && friendsResult.value) {
    friends.value = friendsResult.value;
  }
}

onMounted(() => { loadData(); favStore.load(); });

function confirmRemoveFavorite(fav: RecipePreview) {
  favoriteToRemove.value = fav;
}

function cancelRemoveFavorite() {
  favoriteToRemove.value = null;
}

async function removeFavorite() {
  if (!favoriteToRemove.value) return;
  const result = await apiRequest(`/users/me/favorites/${favoriteToRemove.value.id}`, 'DELETE', authStore.jwt);
  if (result.ok) {
    favorites.value = favorites.value.filter(f => f.id !== favoriteToRemove.value!.id);
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
  const result = await apiRequest(`/users/me/friends/${friendToRemove.value.id}`, 'DELETE', authStore.jwt);
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
    <div class="flex flex-col gap-4 overflow-hidden opacity-0 animate-fade-in-slide-in-left">

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
            <div class="stat-value text-base-content flex items-center gap-2">
              {{ user?.name }}
              <button @click="openEditModal" class="btn btn-ghost btn-xs btn-circle">
                <i class="fa-solid fa-pen text-base-content/40" />
              </button>
            </div>
          </div>
          <div class="stat">
            <div class="stat-figure text-primary">
              <i class="fa-solid fa-heart text-3xl" />
            </div>
            <div class="stat-title">{{ $t('page.account.favorite_foods') }}</div>
            <div class="stat-value text-primary">{{ favCount }}</div>
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
    <div class="bg-base-100 rounded-2xl flex flex-col overflow-hidden opacity-0 animate-fade-in-slide-in-right">
      <div class="flex items-center gap-3 px-4 py-3 border-b border-base-200 shrink-0">
        <i class="fa-solid fa-heart text-primary" />
        <span class="font-semibold text-base-content">{{ $t('page.account.favorite_foods') }}</span>
      </div>
      <div v-if="favorites.length === 0" class="flex-1 flex items-center justify-center text-base-content/30 select-none flex-col gap-3">
        <i class="fa-solid fa-heart text-4xl" />
        <span class="text-sm font-medium">{{ $t('page.account.no_favorites') }}</span>
      </div>
      <ul v-else class="list flex-1 overflow-y-auto">
        <recipe-list-component v-for="fav in favorites" :key="fav.id" :data="fav" />
      </ul>
    </div>

  </div>

  <!-- Chooser Modal -->
  <dialog :open="editModal === 'chooser'" class="modal">
    <div class="modal-box max-w-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-lg">{{ $t('page.modifyprofile.title') }}</h3>
        <button @click="editModal = null" class="btn btn-ghost btn-sm btn-circle">
          <i class="fa-solid fa-xmark" />
        </button>
      </div>
      <div class="flex flex-col gap-3">
        <button @click="editModal = 'username'" class="btn btn-soft w-full justify-start gap-3 h-auto py-4">
          <i class="fa-solid fa-user text-primary text-xl w-6" />
          <span class="text-left flex flex-col">
            <span class="font-semibold">{{ $t('page.modifyprofile.username.title') }}</span>
            <span class="text-xs text-base-content/50 font-normal">{{ $t('page.modifyprofile.username.label') }}</span>
          </span>
          <i class="fa-solid fa-chevron-right ml-auto text-base-content/30" />
        </button>
        <button @click="editModal = 'password'" class="btn btn-soft w-full justify-start gap-3 h-auto py-4">
          <i class="fa-solid fa-key text-primary text-xl w-6" />
          <span class="text-left flex flex-col">
            <span class="font-semibold">{{ $t('page.modifyprofile.password.title') }}</span>
            <span class="text-xs text-base-content/50 font-normal">{{ $t('page.modifyprofile.password.current') }}</span>
          </span>
          <i class="fa-solid fa-chevron-right ml-auto text-base-content/30" />
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="editModal = null"><button>close</button></form>
  </dialog>

  <!-- Username Modal -->
  <dialog :open="editModal === 'username'" class="modal">
    <div class="modal-box">
      <div class="flex items-center gap-3 mb-4">
        <button @click="editModal = 'chooser'" class="btn btn-ghost btn-sm btn-circle">
          <i class="fa-solid fa-arrow-left" />
        </button>
        <h3 class="font-bold text-lg">{{ $t('page.modifyprofile.username.title') }}</h3>
      </div>
      <form class="fieldset w-full" onsubmit="return false">
        <label class="label">
          <i class="fa-solid fa-user" />
          <span>{{ $t('page.modifyprofile.username.label') }}</span>
        </label>
        <input v-model="newUsername" type="text" :placeholder="$t('page.modifyprofile.username.placeholder')" class="input w-full" @keyup.enter="saveUsername" />
        <label v-if="usernameError" class="label text-error">
          <i class="fa-solid fa-triangle-exclamation" />
          <span>{{ usernameError }}</span>
        </label>
        <label v-if="usernameSuccess" class="label text-success">
          <i class="fa-solid fa-circle-check" />
          <span>{{ $t('page.modifyprofile.username.success') }}</span>
        </label>
        <button @click="saveUsername" :disabled="usernameLoading" class="btn btn-primary mt-4 w-full">
          <span v-if="usernameLoading" class="loading loading-spinner loading-sm" />
          <i v-else class="fa-solid fa-user-pen" />
          {{ $t('page.modifyprofile.username.save') }}
        </button>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click="editModal = null"><button>close</button></form>
  </dialog>

  <!-- Password Modal -->
  <dialog :open="editModal === 'password'" class="modal">
    <div class="modal-box">
      <div class="flex items-center gap-3 mb-4">
        <button @click="editModal = 'chooser'" class="btn btn-ghost btn-sm btn-circle">
          <i class="fa-solid fa-arrow-left" />
        </button>
        <h3 class="font-bold text-lg">{{ $t('page.modifyprofile.password.title') }}</h3>
      </div>
      <form class="fieldset w-full" onsubmit="return false">
        <label class="label">
          <i class="fa-solid fa-key" />
          <span>{{ $t('page.modifyprofile.password.current') }}</span>
        </label>
        <input v-model="currentPassword" type="password" :placeholder="$t('page.modifyprofile.password.current_placeholder')" class="input w-full" />
        <label class="label">
          <i class="fa-solid fa-lock" />
          <span>{{ $t('page.modifyprofile.password.new') }}</span>
        </label>
        <input v-model="newPassword" type="password" :placeholder="$t('page.modifyprofile.password.new_placeholder')" class="input w-full" />
        <label class="label">
          <i class="fa-solid fa-lock-open" />
          <span>{{ $t('page.modifyprofile.password.confirm') }}</span>
        </label>
        <input v-model="confirmPassword" type="password" :placeholder="$t('page.modifyprofile.password.confirm_placeholder')" class="input w-full" @keyup.enter="savePassword" />
        <label v-if="passwordError" class="label text-error">
          <i class="fa-solid fa-triangle-exclamation" />
          <span>{{ passwordError }}</span>
        </label>
        <label v-if="passwordSuccess" class="label text-success">
          <i class="fa-solid fa-circle-check" />
          <span>{{ $t('page.modifyprofile.password.success') }}</span>
        </label>
        <button @click="savePassword" :disabled="passwordLoading" class="btn btn-primary mt-4 w-full">
          <span v-if="passwordLoading" class="loading loading-spinner loading-sm" />
          <i v-else class="fa-solid fa-key" />
          {{ $t('page.modifyprofile.password.save') }}
        </button>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click="editModal = null"><button>close</button></form>
  </dialog>

  <!-- Remove Favorite Modal -->
  <dialog :open="favoriteToRemove !== null" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('page.account.remove_favorite_title') }}</h3>
      <p class="py-4">
        {{ $t('page.account.remove_confirm') }}
        <strong>{{ favoriteToRemove?.title }}</strong>
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
