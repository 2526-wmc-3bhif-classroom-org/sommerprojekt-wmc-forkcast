<script setup lang="ts">
import type { RecipePreview } from '~/assets/model/recipe-preview';
import useApiConnection from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';

definePageMeta({ showFooter: false });

type CookingStep = { number: number; step: string; lengthMinutes: number | null };
type CookingSection = { name: string; steps: CookingStep[] };
type InstructionsResponse = { recipeId: number; sections: CookingSection[] };

const route = useRoute();
const api = useApiConnection();
const authStore = useAuthStore();

const recipeId = computed(() => Number(route.params.id));

const recipe = ref<RecipePreview | null>(null);
const instructions = ref<InstructionsResponse | null>(null);
const loading = ref(true);
const error = ref(false);
const currentStepIndex = ref(0);
const showIngredients = ref(false);
const scale = ref(1);
const useMetric = ref(true);
const timerSeconds = ref(0);
const timerRunning = ref(false);
const timerDone = ref(false);
const isDone = ref(false);
const stepDirection = ref<'forward' | 'backward'>('forward');
let timerInterval: ReturnType<typeof setInterval> | null = null;

const allSteps = computed<CookingStep[]>(() =>
  (instructions.value?.sections ?? []).flatMap(s => s.steps)
);
const currentStep = computed(() => allSteps.value[currentStepIndex.value] ?? null);
const totalSteps = computed(() => allSteps.value.length);
const progress = computed(() =>
  totalSteps.value > 0 ? Math.round(((currentStepIndex.value + 1) / totalSteps.value) * 100) : 0
);

const scaledIngredients = computed(() =>
  (recipe.value?.ingredients ?? []).map(ing => {
    const base = useMetric.value
      ? { amount: ing.measures?.metric?.amount ?? ing.amount, unit: ing.measures?.metric?.unitShort ?? ing.unit }
      : { amount: ing.measures?.us?.amount ?? ing.amount, unit: ing.measures?.us?.unitShort ?? ing.unit };
    return { name: ing.name, amount: Math.round(base.amount * scale.value * 10) / 10, unit: base.unit };
  })
);

const timerDisplay = computed(() => {
  const s = timerSeconds.value;
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
});

const timerPercent = computed(() => {
  const step = currentStep.value;
  if (!step?.lengthMinutes) return 0;
  const total = step.lengthMinutes * 60;
  return Math.round(((total - timerSeconds.value) / total) * 100);
});

function setTimerForStep() {
  stopTimer();
  timerDone.value = false;
  timerSeconds.value = currentStep.value?.lengthMinutes ? currentStep.value.lengthMinutes * 60 : 0;
}

function startTimer() {
  if (timerRunning.value || timerSeconds.value <= 0) return;
  timerRunning.value = true;
  timerInterval = setInterval(() => {
    if (timerSeconds.value <= 0) {
      stopTimer();
      timerDone.value = true;
      return;
    }
    timerSeconds.value--;
  }, 1000);
}

function stopTimer() {
  timerRunning.value = false;
  if (timerInterval !== null) { clearInterval(timerInterval); timerInterval = null; }
}

function resetTimer() {
  stopTimer();
  timerDone.value = false;
  timerSeconds.value = currentStep.value?.lengthMinutes ? currentStep.value.lengthMinutes * 60 : 0;
}

function goToStep(idx: number) {
  stepDirection.value = idx > currentStepIndex.value ? 'forward' : 'backward';
  currentStepIndex.value = idx;
  setTimerForStep();
}

function prevStep() { if (currentStepIndex.value > 0) goToStep(currentStepIndex.value - 1); }
function nextStep() {
  if (currentStepIndex.value < totalSteps.value - 1) { goToStep(currentStepIndex.value + 1); }
  else { isDone.value = true; stopTimer(); }
}

async function fetchData() {
  loading.value = true;
  error.value = false;
  const jwt = authStore.jwt;
  const id = recipeId.value;
  const [recipeRes, instrRes] = await Promise.all([
    api.apiRequest<RecipePreview>(`/recipes/${id}`, 'GET', jwt),
    api.apiRequest<InstructionsResponse>(`/recipes/${id}/instructions`, 'GET', jwt),
  ]);
  if (recipeRes.ok && recipeRes.value) recipe.value = recipeRes.value;
  else error.value = true;
  if (instrRes.ok && instrRes.value) instructions.value = instrRes.value;
  loading.value = false;
  setTimerForStep();
}

onMounted(fetchData);
onUnmounted(() => { if (timerInterval !== null) clearInterval(timerInterval); });
</script>

<template>
  <div class="grid grid-rows-[4rem_1fr] min-h-screen bg-base-100">
    <div />

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center gap-6 py-20 opacity-0 animate-fade-in">
      <span class="loading loading-spinner loading-lg text-primary" />
      <p class="text-base-content/50 text-sm">{{ $t('page.cook.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center gap-5 py-20 opacity-0 animate-fade-in">
      <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
        <i class="fa-solid fa-triangle-exclamation text-3xl text-error/70" />
      </div>
      <p class="text-base-content/60 text-lg font-semibold">{{ $t('page.cook.error') }}</p>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" @click="fetchData">
          <i class="fa-solid fa-rotate-right" />
          {{ $t('component.fse.retry') }}
        </button>
        <nuxt-link-locale to="/dashboard" class="btn btn-primary btn-sm">
          <i class="fa-solid fa-arrow-left" />
          {{ $t('page.cook.back') }}
        </nuxt-link-locale>
      </div>
    </div>

    <!-- Done State -->
    <div v-else-if="isDone" class="flex flex-col items-center justify-center gap-8 py-20 px-6 opacity-0 animate-fade-in">
      <div class="relative">
        <div class="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center shadow-lg ring-4 ring-primary/30">
          <i class="fa-solid fa-check text-5xl text-primary" />
        </div>
      </div>
      <div class="text-center">
        <h2 class="text-4xl font-bold text-primary mb-2">{{ $t('page.cook.done.title') }}</h2>
        <p class="text-xl text-base-content/60">{{ $t('page.cook.done.subtitle') }}</p>
      </div>
      <div v-if="recipe" class="card bg-base-200 w-full max-w-sm shadow-md overflow-hidden">
        <figure><img :src="recipe.image" :alt="recipe.title" class="w-full h-36 object-cover" /></figure>
        <div class="card-body py-3 px-4">
          <p class="font-semibold text-sm text-base-content/80 truncate">{{ recipe.title }}</p>
        </div>
      </div>
      <nuxt-link-locale to="/dashboard" class="btn btn-primary btn-lg gap-2">
        <i class="fa-solid fa-house" />
        {{ $t('page.cook.done.back') }}
      </nuxt-link-locale>
    </div>

    <!-- Cook View -->
    <div v-else class="flex flex-col overflow-auto">

      <!-- Sticky Header -->
      <div class="sticky top-0 z-30 bg-base-100/90 backdrop-blur-md border-b border-base-content/5 flex items-center gap-3 px-4 py-3">
        <nuxt-link-locale to="/dashboard" class="btn btn-ghost btn-circle btn-sm shrink-0">
          <i class="fa-solid fa-arrow-left" />
        </nuxt-link-locale>
        <h1 v-if="recipe" class="text-base font-bold truncate flex-1 leading-tight">{{ recipe.title }}</h1>
        <div class="flex items-center gap-1 shrink-0">
          <button
            class="btn btn-ghost btn-circle btn-sm"
            :class="showIngredients ? 'text-primary' : 'text-base-content/50'"
            @click="showIngredients = !showIngredients"
          >
            <i class="fa-solid fa-list-ul" />
          </button>
        </div>
      </div>

      <!-- Hero Image -->
      <div v-if="recipe" class="relative w-full h-52 overflow-hidden shrink-0">
        <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover" loading="eager" />
        <div class="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/30 to-transparent" />
        <div class="absolute bottom-3 left-4 flex flex-wrap gap-1">
          <span
            v-for="tag in recipe.tags"
            :key="tag.text"
            :class="`badge badge-sm ${tag.color === 'primary' ? 'badge-primary' : tag.color === 'error' ? 'badge-error' : tag.color === 'success' ? 'badge-success' : tag.color === 'warning' ? 'badge-warning' : 'badge-neutral'}`"
            class="inline-flex items-center gap-1"
          >
            <i :class="`fa-solid fa-${tag.icon} text-xs`" />
            {{ tag.text }}
          </span>
        </div>
        <div class="absolute bottom-3 right-4 flex flex-wrap gap-2 text-xs text-base-content/70">
          <span v-for="attr in recipe.attributes" :key="attr.icon" class="inline-flex items-center gap-1 bg-base-100/60 backdrop-blur-sm rounded-full px-2 py-0.5">
            <i :class="`fa-solid fa-${attr.icon}`" />
            {{ attr.text }}
          </span>
        </div>
      </div>

      <!-- Ingredients Panel (collapsible) -->
      <Transition name="slide-down">
        <div v-if="showIngredients" class="bg-base-200 border-b border-base-content/10 px-4 py-4">
          <!-- Scale + Unit -->
          <div class="flex items-center justify-between mb-4 gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs text-base-content/50 uppercase tracking-wider font-semibold">{{ $t('page.cook.scale') }}</span>
              <div class="join">
                <button
                  v-for="s in [1, 2, 4]"
                  :key="s"
                  class="join-item btn btn-xs"
                  :class="scale === s ? 'btn-primary' : 'btn-ghost border border-base-content/10'"
                  @click="scale = s"
                >{{ s }}x</button>
              </div>
            </div>
            <div class="join">
              <button class="join-item btn btn-xs" :class="useMetric ? 'btn-primary' : 'btn-ghost border border-base-content/10'" @click="useMetric = true">
                {{ $t('page.cook.metric') }}
              </button>
              <button class="join-item btn btn-xs" :class="!useMetric ? 'btn-primary' : 'btn-ghost border border-base-content/10'" @click="useMetric = false">
                {{ $t('page.cook.us') }}
              </button>
            </div>
          </div>

          <!-- Ingredient list -->
          <ul v-if="scaledIngredients.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li
              v-for="ing in scaledIngredients"
              :key="ing.name"
              class="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg bg-base-100/60"
            >
              <i class="fa-solid fa-circle-dot text-primary/50 text-xs shrink-0" />
              <span class="font-medium text-primary shrink-0">{{ ing.amount }} {{ ing.unit }}</span>
              <span class="text-base-content/70 truncate">{{ ing.name }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-base-content/40 text-center py-2">{{ $t('component.recipe.info.no_ingredients') }}</p>

          <!-- Source -->
          <div v-if="recipe?.sourceUrl" class="mt-3 pt-3 border-t border-base-content/10">
            <a :href="recipe.sourceUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors">
              <i class="fa-solid fa-arrow-up-right-from-square" />
              {{ $t('page.cook.source') }}: {{ recipe.sourceName || recipe.sourceUrl }}
            </a>
          </div>
        </div>
      </Transition>

      <!-- No Instructions -->
      <div v-if="allSteps.length === 0" class="flex flex-col items-center justify-center gap-5 py-20 px-6 text-center opacity-0 animate-fade-in-slide-in-up">
        <div class="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
          <i class="fa-solid fa-book-open text-3xl text-base-content/30" />
        </div>
        <p class="text-base-content/50 max-w-xs">{{ $t('page.cook.no_steps') }}</p>
        <nuxt-link-locale to="/dashboard" class="btn btn-primary btn-sm">
          <i class="fa-solid fa-arrow-left" />
          {{ $t('page.cook.back') }}
        </nuxt-link-locale>
      </div>

      <!-- Step Navigator -->
      <div v-else class="flex flex-col flex-1 px-4 pt-5 pb-6 max-w-2xl mx-auto w-full gap-5">

        <!-- Step counter + progress -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between text-sm">
            <span class="font-semibold text-primary uppercase tracking-wider text-xs">
              {{ $t('page.cook.step') }} {{ currentStepIndex + 1 }} {{ $t('page.cook.of') }} {{ totalSteps }}
            </span>
            <span class="text-base-content/40 text-xs">{{ progress }}%</span>
          </div>
          <progress class="progress progress-primary w-full h-2 rounded-full" :value="progress" max="100" />
        </div>

        <!-- Section name (if named) -->
        <div v-if="instructions?.sections.find(s => s.steps.some(st => st.number === currentStep?.number))?.name" class="text-xs text-base-content/40 uppercase tracking-widest font-semibold -mb-2">
          {{ instructions.sections.find(s => s.steps.some(st => st.number === currentStep?.number))?.name }}
        </div>

        <!-- Step Card with transition -->
        <Transition :name="stepDirection === 'forward' ? 'step-forward' : 'step-backward'" mode="out-in">
          <div :key="currentStepIndex" class="card bg-base-200 shadow-md border border-base-content/5 min-h-36">
            <div class="card-body p-5">
              <div class="flex items-start gap-3">
                <span class="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary mt-0.5">
                  {{ currentStep?.number ?? currentStepIndex + 1 }}
                </span>
                <p class="text-base leading-relaxed text-base-content/90 flex-1">{{ currentStep?.step }}</p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Timer -->
        <div v-if="currentStep?.lengthMinutes" class="card bg-base-200 border border-base-content/5">
          <div class="card-body p-4">
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex items-baseline gap-1 mb-1">
                  <span
                    class="font-mono text-3xl font-bold tracking-widest"
                    :class="timerDone ? 'text-success' : timerRunning ? 'text-primary' : 'text-base-content/70'"
                  >{{ timerDisplay }}</span>
                  <span v-if="timerDone" class="text-success text-xs font-semibold ml-1">{{ $t('page.cook.timer_done') }}</span>
                </div>
                <progress
                  class="progress w-full h-1.5 rounded-full"
                  :class="timerDone ? 'progress-success' : 'progress-primary'"
                  :value="timerPercent"
                  max="100"
                />
              </div>
              <div class="flex gap-2 shrink-0">
                <button
                  class="btn btn-circle btn-sm"
                  :class="timerRunning ? 'btn-warning' : 'btn-primary'"
                  :disabled="timerDone || timerSeconds === 0"
                  @click="timerRunning ? stopTimer() : startTimer()"
                >
                  <i :class="timerRunning ? 'fa-solid fa-pause' : 'fa-solid fa-play'" />
                </button>
                <button class="btn btn-circle btn-sm btn-ghost border border-base-content/10" @click="resetTimer">
                  <i class="fa-solid fa-rotate-right" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step dots (mini progress) -->
        <div class="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            v-for="(_, idx) in allSteps"
            :key="idx"
            class="rounded-full transition-all duration-200"
            :class="idx === currentStepIndex
              ? 'w-5 h-2 bg-primary'
              : idx < currentStepIndex
                ? 'w-2 h-2 bg-primary/40'
                : 'w-2 h-2 bg-base-content/15'"
            @click="goToStep(idx)"
          />
        </div>

        <!-- Navigation buttons -->
        <div class="flex gap-3 mt-auto pt-2">
          <button
            class="btn btn-ghost flex-1 gap-2 border border-base-content/10"
            :disabled="currentStepIndex === 0"
            @click="prevStep"
          >
            <i class="fa-solid fa-arrow-left" />
            {{ $t('page.cook.prev') }}
          </button>
          <button
            class="btn flex-1 gap-2"
            :class="currentStepIndex === totalSteps - 1 ? 'btn-success' : 'btn-primary'"
            @click="nextStep"
          >
            <span>{{ currentStepIndex === totalSteps - 1 ? $t('page.cook.finish') : $t('page.cook.next') }}</span>
            <i :class="currentStepIndex === totalSteps - 1 ? 'fa-solid fa-check' : 'fa-solid fa-arrow-right'" />
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.step-forward-enter-from { opacity: 0; transform: translateX(30px); }
.step-forward-leave-to { opacity: 0; transform: translateX(-30px); }
.step-backward-enter-from { opacity: 0; transform: translateX(-30px); }
.step-backward-leave-to { opacity: 0; transform: translateX(30px); }
.step-forward-enter-active,
.step-forward-leave-active,
.step-backward-enter-active,
.step-backward-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }

.slide-down-enter-from { opacity: 0; max-height: 0; }
.slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to { opacity: 1; max-height: 500px; }
.slide-down-leave-from { opacity: 1; max-height: 500px; }
.slide-down-enter-active,
.slide-down-leave-active { transition: opacity 0.25s ease, max-height 0.3s ease; overflow: hidden; }
</style>
