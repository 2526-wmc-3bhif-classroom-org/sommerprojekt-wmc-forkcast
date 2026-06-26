<script setup lang="ts">
import type {RecipePreview} from '~/assets/model/recipe-preview';
import type {PublicUser, IncomingRequest} from '~/assets/model/public-user';
import {useAuthStore} from '~/assets/store/auth-store';
import {useFavoritesStore} from '~/assets/store/favorites-store';
import useAuthService from '~/assets/service/auth-service';
import useFriendService from '~/assets/service/friend-service';

definePageMeta({ showFooter: false })

const authStore = useAuthStore();
const favStore = useFavoritesStore();
const authService = useAuthService();
const friendService = useFriendService();
const { t } = useI18n();

const user = computed(() => authStore.user ?? null);

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
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

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
  const name = newUsername.value.trim();
  usernameLoading.value = true;
  const result = await authService.updateName(name);
  usernameLoading.value = false;
  if (result.ok) {
    usernameSuccess.value = true;
    newUsername.value = '';
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
  const result = await authService.updatePassword(currentPassword.value, newPassword.value);
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
const FAV_PAGE_SIZE = 20;
const favorites = ref<RecipePreview[]>([]);
const favOffset = ref(0);
const favHasMore = ref(false);
const favLoading = ref(false);
const favCount = ref(0);

const friends = ref<PublicUser[]>([]);
const friendsLoading = ref(true);
const friendProfile = ref<PublicUser | null>(null);
const profileFriends = ref<PublicUser[]>([]);
const profileFavorites = ref<RecipePreview[]>([]);
const profileFavCount = ref(0);
const profileLoading = ref(false);
const incomingRequests = ref<IncomingRequest[]>([]);
const addUsername = ref('');
const addLoading = ref(false);
const addError = ref('');
const addSuccess = ref('');
const friendToRemove = ref<PublicUser | null>(null);
const favoriteToRemove = ref<RecipePreview | null>(null);
const favSentinelRef = ref<HTMLElement | null>(null);

async function loadMoreFavorites() {
  if (favLoading.value || !favHasMore.value) return;
  favLoading.value = true;
  const result = await favStore.getPopulated(favOffset.value, FAV_PAGE_SIZE);
  favLoading.value = false;
  if (result.ok && result.value) {
    favorites.value.push(...result.value.recipes);
    favCount.value = result.value.count;
    favOffset.value += result.value.recipes.length;
    favHasMore.value = result.value.recipes.length >= FAV_PAGE_SIZE;
  } else {
    favHasMore.value = false;
  }
}

async function loadData() {
  friendsLoading.value = true;
  const friendsResult = await friendService.getFriends();
  if (friendsResult.ok && friendsResult.value) friends.value = friendsResult.value;
  friendsLoading.value = false;

  const requestsResult = await friendService.getRequests();
  if (requestsResult.ok && requestsResult.value) incomingRequests.value = requestsResult.value;
}

async function sendFriendRequest() {
  addError.value = '';
  addSuccess.value = '';
  const name = addUsername.value.trim();
  if (!name) { addError.value = t('page.account.add_friend.empty'); return; }
  addLoading.value = true;
  const result = await friendService.sendRequest(name);
  addLoading.value = false;
  if (result.ok && result.value) {
    if (result.value.status === 'accepted') {
      friends.value.push(result.value.user);
      addSuccess.value = t('page.account.add_friend.accepted', { name: result.value.user.name });
    } else {
      addSuccess.value = t('page.account.add_friend.sent');
    }
    addUsername.value = '';
  } else {
    addError.value = result.failure?.message ?? t('page.account.add_friend.error');
  }
}

async function acceptRequest(req: IncomingRequest) {
  const result = await friendService.acceptRequest(req.requestId);
  if (result.ok && result.value) {
    friends.value.push(result.value);
    incomingRequests.value = incomingRequests.value.filter(r => r.requestId !== req.requestId);
  }
}

async function declineRequest(req: IncomingRequest) {
  const result = await friendService.declineRequest(req.requestId);
  if (result.ok) {
    incomingRequests.value = incomingRequests.value.filter(r => r.requestId !== req.requestId);
  }
}

async function initialLoadFavorites() {
  favLoading.value = true;
  const result = await favStore.getPopulated(0, FAV_PAGE_SIZE);
  favLoading.value = false;
  if (result.ok && result.value) {
    favorites.value = result.value.recipes;
    favCount.value = result.value.count;
    favOffset.value = result.value.recipes.length;
    favHasMore.value = result.value.recipes.length >= FAV_PAGE_SIZE;
  }
}

onMounted(() => {
  loadData();
  initialLoadFavorites();

  const observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) loadMoreFavorites();
  }, { threshold: 0 });
  watch(favSentinelRef, (el) => { if (el) observer.observe(el); }, { immediate: true });
  onUnmounted(() => observer.disconnect());
});

function confirmRemoveFavorite(fav: RecipePreview) {
  favoriteToRemove.value = fav;
}

function cancelRemoveFavorite() {
  favoriteToRemove.value = null;
}

async function removeFavorite() {
  if (!favoriteToRemove.value) return;
  const ok = await favStore.remove(favoriteToRemove.value.id);
  if (ok) {
    favorites.value = favorites.value.filter(f => f.id !== favoriteToRemove.value!.id);
    favCount.value = Math.max(0, favCount.value - 1);
  }
  favoriteToRemove.value = null;
}

async function openProfile(friend: PublicUser) {
  friendProfile.value = friend;
  profileFriends.value = [];
  profileFavorites.value = [];
  profileFavCount.value = 0;
  profileLoading.value = true;

  const [friendsRes, favsRes] = await Promise.all([
    friendService.getFriendFriends(friend.id),
    favStore.getFriendPopulated(friend.id),
  ]);

  // Ignore if the user already opened a different profile while this was loading.
  if (friendProfile.value?.id !== friend.id) return;

  if (friendsRes.ok && friendsRes.value) profileFriends.value = friendsRes.value;
  if (favsRes.ok && favsRes.value) {
    profileFavCount.value = favsRes.value.count;
    profileFavorites.value = favsRes.value.recipes;
  }
  profileLoading.value = false;
}

async function toggleMyFavorite(recipe: RecipePreview) {
  const wasFav = favStore.has(recipe.id);
  await favStore.toggle(recipe.id);
  const isFav = favStore.has(recipe.id);
  if (isFav && !wasFav) {
    if (!favorites.value.some(f => f.id === recipe.id)) {
      // Stamp isFavorited so the mounted RecipeListComponent doesn't re-seed the
      // favorite state to the stale (false) value it had in the friend profile.
      favorites.value.unshift({ ...recipe, isFavorited: true });
      favCount.value++;
    }
  } else if (!isFav && wasFav) {
    favorites.value = favorites.value.filter(f => f.id !== recipe.id);
    favCount.value = Math.max(0, favCount.value - 1);
  }
}

function removeFromProfile() {
  if (!friendProfile.value) return;
  friendToRemove.value = friendProfile.value;
  friendProfile.value = null;
}

function confirmRemove(friend: PublicUser) {
  friendToRemove.value = friend;
}

function cancelRemove() {
  friendToRemove.value = null;
}

async function removeFriend() {
  if (!friendToRemove.value) return;
  const result = await friendService.removeFriend(friendToRemove.value.id);
  if (result.ok) {
    friends.value = friends.value.filter(f => f.id !== friendToRemove.value!.id);
  }
  friendToRemove.value = null;
}
</script>

<template>
  <div class="grid grid-rows-[4rem_auto] md:grid-rows-[4rem_1fr] grid-cols-1 md:grid-cols-2 w-screen min-h-screen md:h-screen px-4 pb-4 gap-4">

    <!-- Navbar spacer -->
    <div class="col-span-full" />

    <!-- Left column: profile card + friends card -->
    <div class="flex flex-col gap-4 overflow-visible md:overflow-hidden opacity-0 animate-fade-in-slide-in-left">

      <!-- Profile stats card -->
      <div class="bg-base-200 rounded-2xl shrink-0">
        <div class="stats stats-vertical sm:stats-horizontal w-full rounded-2xl">
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
      <div class="bg-base-200 rounded-2xl flex flex-col flex-1 overflow-hidden">
        <div class="flex items-center gap-3 px-4 py-3 border-b border-base-200 shrink-0">
          <i class="fa-solid fa-user-group text-primary" />
          <span class="font-semibold text-base-content">{{ $t('page.account.friends') }}</span>
        </div>

        <!-- Add friend by username -->
        <div class="px-4 py-3 border-b border-base-200 shrink-0">
          <div class="flex gap-2">
            <label class="input input-sm flex-1">
              <i class="fa-solid fa-user opacity-50" />
              <input
                  v-model="addUsername"
                  type="text"
                  autocomplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-bwignore
                  :placeholder="$t('page.account.add_friend.placeholder')"
                  class="grow"
                  @keyup.enter="sendFriendRequest"
              />
            </label>
            <button @click="sendFriendRequest" :disabled="addLoading" class="btn btn-primary btn-sm">
              <span v-if="addLoading" class="loading loading-spinner loading-xs" />
              <i v-else class="fa-solid fa-user-plus" />
              {{ $t('page.account.add_friend.button') }}
            </button>
          </div>
          <Transition name="error-reveal" mode="out-in">
            <p v-if="addError" class="text-error text-sm mt-2">
              <i class="fa-solid fa-triangle-exclamation mr-1" />{{ addError }}
            </p>
            <p v-else-if="addSuccess" class="text-success text-sm mt-2">
              <i class="fa-solid fa-circle-check mr-1" />{{ addSuccess }}
            </p>
          </Transition>
        </div>

        <!-- Incoming friend requests -->
        <div v-if="incomingRequests.length" class="shrink-0 border-b border-base-200">
          <div class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            {{ $t('page.account.friend_requests') }}
          </div>
          <ul>
            <li v-for="req in incomingRequests" :key="req.requestId" class="flex items-center gap-3 px-4 py-2">
              <div class="avatar placeholder">
                <div v-if="!req.profilePicture" class="bg-neutral text-neutral-content rounded-full w-10 flex items-center justify-center">
                  <span class="text-sm font-bold">{{ req.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div v-else class="rounded-full w-10">
                  <img :src="`data:image/png;base64,${req.profilePicture}`" :alt="req.name" />
                </div>
              </div>
              <span class="font-medium text-base-content flex-1">{{ req.name }}</span>
              <button @click="acceptRequest(req)" class="btn btn-success btn-sm">{{ $t('page.account.accept') }}</button>
              <button @click="declineRequest(req)" class="btn btn-ghost btn-sm">{{ $t('page.account.decline') }}</button>
            </li>
          </ul>
        </div>

        <!-- Loading skeleton -->
        <div v-if="friendsLoading && friends.length === 0" class="flex-1 flex flex-col">
          <div v-for="n in 4" :key="n" class="flex items-center gap-3 px-4 py-3">
            <div class="skeleton h-10 w-10 rounded-full shrink-0" />
            <div class="skeleton h-4 flex-1 max-w-[8rem]" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="friends.length === 0" class="flex-1 flex items-center justify-center text-base-content/30 select-none flex-col gap-3 py-8">
          <i class="fa-solid fa-user-group text-4xl" />
          <span class="text-sm font-medium">{{ $t('page.account.no_friends') }}</span>
        </div>

        <!-- Friends list -->
        <ul v-else class="flex-1 overflow-y-auto md:overflow-y-auto overflow-visible divide-y divide-base-200">
          <li v-for="friend in friends" :key="friend.id">
            <button
                type="button"
                @click="openProfile(friend)"
                class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-base-200 transition-colors cursor-pointer"
            >
              <div class="avatar placeholder">
                <div v-if="!friend.profilePicture" class="bg-neutral text-neutral-content rounded-full w-10 flex items-center justify-center">
                  <span class="text-sm font-bold">{{ friend.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div v-else class="rounded-full w-10">
                  <img :src="`data:image/png;base64,${friend.profilePicture}`" :alt="friend.name" />
                </div>
              </div>
              <span class="font-medium text-base-content flex-1 truncate">{{ friend.name }}</span>
              <i class="fa-solid fa-chevron-right text-base-content/30" />
            </button>
          </li>
        </ul>
      </div>

    </div>

    <!-- Right column: favorites card -->
    <div class="bg-base-200 rounded-2xl flex flex-col overflow-visible md:overflow-hidden opacity-0 animate-fade-in-slide-in-right min-h-64 md:min-h-0">
      <div class="flex items-center gap-3 px-4 py-3 border-b border-base-200 shrink-0">
        <i class="fa-solid fa-heart text-primary" />
        <span class="font-semibold text-base-content">{{ $t('page.account.favorite_foods') }}</span>
      </div>
      <div v-if="!favLoading && favorites.length === 0" class="flex-1 flex items-center justify-center text-base-content/30 select-none flex-col gap-3">
        <i class="fa-solid fa-heart text-4xl" />
        <span class="text-sm font-medium">{{ $t('page.account.no_favorites') }}</span>
      </div>
      <ul v-else class="list flex-1 overflow-y-auto md:overflow-y-auto overflow-visible">
        <recipe-list-component v-for="fav in favorites" :key="fav.id" :data="fav" />
        <li v-if="favHasMore || favLoading" ref="favSentinelRef" class="flex justify-center py-3">
          <span class="loading loading-spinner loading-sm text-base-content/30"/>
        </li>
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
        <button @click="editModal = 'username'" class="btn btn-base-200 w-full justify-start gap-3 h-auto py-4">
          <i class="fa-solid fa-user text-primary text-xl w-6" />
          <span class="text-left flex flex-col">
            <span class="font-semibold">{{ $t('page.modifyprofile.username.title') }}</span>
            <span class="text-xs text-base-content/50 font-normal">{{ $t('page.modifyprofile.username.label') }}</span>
          </span>
          <i class="fa-solid fa-chevron-right ml-auto text-base-content/30" />
        </button>
        <button @click="editModal = 'password'" class="btn btn-base-200 w-full justify-start gap-3 h-auto py-4">
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
        <label class="label">{{ $t('page.modifyprofile.username.label') }}</label>
        <label class="input w-full">
          <i class="fa-solid fa-user opacity-50" />
          <input v-model="newUsername" type="text" :placeholder="$t('page.modifyprofile.username.placeholder')" class="grow" @keyup.enter="saveUsername" />
        </label>
        <Transition name="error-reveal">
          <p v-if="usernameError" class="label text-error gap-1 text-wrap">
            <i class="fa-solid fa-triangle-exclamation" /><span>{{ usernameError }}</span>
          </p>
        </Transition>
        <Transition name="error-reveal">
          <p v-if="usernameSuccess" class="label text-success gap-1">
            <i class="fa-solid fa-circle-check" /><span>{{ $t('page.modifyprofile.username.success') }}</span>
          </p>
        </Transition>
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
        <!-- Hidden username for accessibility / password managers -->
        <input type="text" autocomplete="username" :value="user?.email" class="hidden" tabindex="-1" aria-hidden="true" readonly />
        <label class="label">{{ $t('page.modifyprofile.password.current') }}</label>
        <label class="input w-full">
          <i class="fa-solid fa-key opacity-50" />
          <input v-model="currentPassword" :type="showCurrentPassword ? 'text' : 'password'" autocomplete="current-password" :placeholder="$t('page.modifyprofile.password.current_placeholder')" class="grow" />
          <button type="button" tabindex="-1" class="opacity-50 hover:opacity-100 cursor-pointer" @click="showCurrentPassword = !showCurrentPassword">
            <i :class="showCurrentPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
          </button>
        </label>
        <label class="label">{{ $t('page.modifyprofile.password.new') }}</label>
        <label class="input w-full">
          <i class="fa-solid fa-lock opacity-50" />
          <input v-model="newPassword" :type="showNewPassword ? 'text' : 'password'" autocomplete="new-password" :placeholder="$t('page.modifyprofile.password.new_placeholder')" class="grow" />
          <button type="button" tabindex="-1" class="opacity-50 hover:opacity-100 cursor-pointer" @click="showNewPassword = !showNewPassword">
            <i :class="showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
          </button>
        </label>
        <label class="label">{{ $t('page.modifyprofile.password.confirm') }}</label>
        <label class="input w-full">
          <i class="fa-solid fa-lock-open opacity-50" />
          <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password" :placeholder="$t('page.modifyprofile.password.confirm_placeholder')" class="grow" @keyup.enter="savePassword" />
          <button type="button" tabindex="-1" class="opacity-50 hover:opacity-100 cursor-pointer" @click="showConfirmPassword = !showConfirmPassword">
            <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
          </button>
        </label>
        <Transition name="error-reveal">
          <p v-if="passwordError" class="label text-error gap-1 text-wrap">
            <i class="fa-solid fa-triangle-exclamation" /><span>{{ passwordError }}</span>
          </p>
        </Transition>
        <Transition name="error-reveal">
          <p v-if="passwordSuccess" class="label text-success gap-1">
            <i class="fa-solid fa-circle-check" /><span>{{ $t('page.modifyprofile.password.success') }}</span>
          </p>
        </Transition>
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

  <!-- Friend Profile Modal -->
  <dialog :open="friendProfile !== null" class="modal">
    <div class="modal-box max-w-md">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-lg">{{ $t('page.account.profile_title') }}</h3>
        <button @click="friendProfile = null" class="btn btn-ghost btn-sm btn-circle">
          <i class="fa-solid fa-xmark" />
        </button>
      </div>
      <div class="flex flex-col items-center gap-3 py-4">
        <div class="avatar placeholder">
          <div v-if="!friendProfile?.profilePicture" class="bg-primary text-primary-content rounded-full w-24 flex items-center justify-center">
            <span class="text-3xl font-bold">{{ friendProfile?.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div v-else class="rounded-full w-24">
            <img :src="`data:image/png;base64,${friendProfile.profilePicture}`" :alt="friendProfile.name" />
          </div>
        </div>
        <span class="text-xl font-bold">{{ friendProfile?.name }}</span>
      </div>

      <div v-if="profileLoading" class="flex justify-center py-6">
        <span class="loading loading-spinner text-base-content/30" />
      </div>

      <div v-else class="flex flex-col gap-4 max-h-[40vh] overflow-y-auto">
        <!-- Their friends -->
        <div>
          <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-base-content/60">
            <i class="fa-solid fa-user-group text-secondary" />
            <span>{{ $t('page.account.friends') }}</span>
            <span v-if="profileFriends.length" class="badge badge-secondary badge-xs">{{ profileFriends.length }}</span>
          </div>
          <div v-if="profileFriends.length === 0" class="text-sm text-base-content/30 py-1">{{ $t('page.account.no_friends') }}</div>
          <div v-else class="flex flex-wrap gap-2">
            <div v-for="pf in profileFriends" :key="pf.id" class="flex items-center gap-1.5 bg-base-200 rounded-full pl-1 pr-3 py-1">
              <div class="avatar placeholder">
                <div v-if="!pf.profilePicture" class="bg-neutral text-neutral-content rounded-full w-6 flex items-center justify-center">
                  <span class="text-xs font-bold">{{ pf.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div v-else class="rounded-full w-6">
                  <img :src="`data:image/png;base64,${pf.profilePicture}`" :alt="pf.name" />
                </div>
              </div>
              <span class="text-xs font-medium">{{ pf.name }}</span>
            </div>
          </div>
        </div>

        <!-- Their favorites -->
        <div>
          <div class="flex items-center gap-2 mb-2 text-sm font-semibold text-base-content/60">
            <i class="fa-solid fa-heart text-primary" />
            <span>{{ $t('page.account.favorite_foods') }}</span>
            <span v-if="profileFavCount" class="badge badge-primary badge-xs">{{ profileFavCount }}</span>
          </div>
          <div v-if="profileFavorites.length === 0" class="text-sm text-base-content/30 py-1">{{ $t('page.account.no_favorites') }}</div>
          <ul v-else class="flex flex-col gap-1.5">
            <li v-for="recipe in profileFavorites" :key="recipe.id" class="flex items-center gap-3 bg-base-200 rounded-lg p-1.5">
              <img v-if="recipe.image" :src="recipe.image" :alt="recipe.title" class="w-10 h-10 rounded-md object-cover shrink-0" />
              <div v-else class="w-10 h-10 rounded-md bg-base-300 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-utensils text-base-content/30" />
              </div>
              <span class="text-sm font-medium truncate flex-1">{{ recipe.title }}</span>
              <button
                  type="button"
                  @click="toggleMyFavorite(recipe)"
                  class="btn btn-ghost btn-sm btn-circle shrink-0"
                  :class="favStore.has(recipe.id) ? 'text-error' : 'text-base-content/30'"
                  :title="favStore.has(recipe.id) ? $t('page.account.in_my_favorites') : $t('page.account.add_to_my_favorites')"
              >
                <i :class="favStore.has(recipe.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" />
              </button>
            </li>
          </ul>
          <p v-if="profileFavCount > profileFavorites.length" class="text-xs text-base-content/40 mt-1.5">
            +{{ profileFavCount - profileFavorites.length }}
          </p>
        </div>
      </div>

      <div class="modal-action">
        <button @click="removeFromProfile" class="btn btn-error btn-sm">
          <i class="fa-solid fa-user-minus" />{{ $t('page.account.remove') }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="friendProfile = null"><button>close</button></form>
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
