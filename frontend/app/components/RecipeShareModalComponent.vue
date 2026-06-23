<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import type { RecipePreview } from '~/assets/model/recipe-preview';

const props = defineProps<{ data: RecipePreview }>();
const localePath = useLocalePath();
const dialog = ref<HTMLDialogElement>();
const copied = ref(false);

// Link drops the recipient on the schedule page with the recipe pinned, ready
// to drag onto a day. Absolute URL is only meaningful client-side.
const link = computed(() => {
  const path = `${localePath('/dashboard/schedule')}?share=${props.data.id}`;
  return import.meta.client ? `${window.location.origin}${path}` : path;
});

// Native share sheet is mostly a mobile affordance; hide it where unsupported.
const canNativeShare = ref(false);
onMounted(() => { canNativeShare.value = import.meta.client && !!navigator.share; });

async function nativeShare() {
  try {
    await navigator.share({ title: props.data.title, url: link.value });
  } catch {
    // User dismissed the sheet — nothing to do.
  }
}

function open() {
  copied.value = false;
  dialog.value?.showModal();
}

async function copyLink() {
  await navigator.clipboard.writeText(link.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

defineExpose({ open });
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-sm">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg mb-1">{{ $t('component.recipe.share.title') }}</h3>
      <p class="text-sm text-base-content/60 mb-4">{{ $t('component.recipe.share.description') }}</p>

      <div class="flex justify-center mb-4">
        <div class="bg-white p-3 rounded-xl">
          <QrcodeVue :value="link" :size="180" level="M" />
        </div>
      </div>

      <div class="flex gap-2">
        <input :value="link" readonly class="input input-sm flex-1 text-xs" @focus="($event.target as HTMLInputElement).select()" />
        <button @click="copyLink" class="btn btn-primary btn-sm shrink-0">
          <i :class="copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'" />
          {{ copied ? $t('component.recipe.share.copied') : $t('component.recipe.share.copy') }}
        </button>
      </div>

      <button v-if="canNativeShare" @click="nativeShare" class="btn btn-soft btn-sm w-full mt-2">
        <i class="fa-solid fa-arrow-up-from-bracket" />
        {{ $t('component.recipe.menu.share') }}
      </button>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<style scoped>
/* Keep the dialog in the top layer for the whole close transition so the box
   animates out smoothly instead of snapping once it leaves the overlay. */
.modal {
  transition-property: visibility, background-color, opacity, overlay, display;
  transition-duration: 0.18s;
  transition-behavior: allow-discrete;
}
.modal-box {
  transition-duration: 0.18s;
}
</style>
