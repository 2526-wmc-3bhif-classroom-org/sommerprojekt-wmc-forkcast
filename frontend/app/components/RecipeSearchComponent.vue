<script setup lang="ts">
import useRecipeService from "~/assets/service/recipe-service";
import type { RecipePreview } from "~/assets/model/recipe-preview";
import type { FilterGroup } from "~/assets/model/filter";

const emit = defineEmits<{ results: [recipes: RecipePreview[]] }>();

const query = ref('');
const filterGroups = ref<Record<string, FilterGroup>>({});
const filterState = reactive<Record<string, any>>({});
const pageSize = ref(10);
const hasMore = ref(false);

const recipeService = useRecipeService();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  const res = await recipeService.getFilters();
  if (!res.ok || !res.value) return;

  filterGroups.value = res.value.filters;

  for (const group of Object.values(res.value.filters)) {
    for (const [key, option] of Object.entries(group.options)) {
      if (option.type === 'range') {
        filterState[key] = {
          enabled: false,
          min: option.min ?? 0,
          max: option.max ?? 100
        };
      } else if (option.type === 'boolean') {
        filterState[key] = { enabled: false };
      } else {
        filterState[key] = { enabled: false, value: option.type === 'number' ? (option.min ?? 0) : '' };
      }
    }
  }
});

function buildFilterParams(): Record<string, string> {
  const params: Record<string, string> = {};
  for (const group of Object.values(filterGroups.value)) {
    for (const [key, option] of Object.entries(group.options)) {
      const state = filterState[key];
      if (!state?.enabled) continue;
      if (option.type === 'range') {
        params[key] = `${state.min}-${state.max}`;
      } else if (option.type === 'boolean') {
        params[key] = 'true';
      } else if (state.value !== '' && state.value !== null) {
        params[key] = String(state.value);
      }
    }
  }
  return params;
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(doSearch, 400);
}

async function doSearch(reset = true) {
  if (reset) pageSize.value = 10;
  if (!query.value.trim()) {
    emit('results', []);
    hasMore.value = false;
    return;
  }
  const res = await recipeService.search(query.value.trim(), { ...buildFilterParams(), number: String(pageSize.value) });
  if (res.ok && res.value) {
    emit('results', res.value);
    hasMore.value = res.value.length >= pageSize.value;
  }
}

async function loadMore() {
  if (!hasMore.value) return;
  pageSize.value += 10;
  await doSearch(false);
}

defineExpose({ loadMore });
</script>

<template>
  <div class="join">
    <label class="input join-item w-full">
      <i class="fa-solid fa-magnifying-glass"/>
      <input type="search" v-model="query" placeholder="Search" @input="onInput"/>
    </label>

    <div class="dropdown dropdown-end join-item">
      <div tabindex="0" role="button" class="select join-item w-30">
        <span>Filter</span>
      </div>

      <div tabindex="0" class="dropdown-content card card-sm bg-base-100 z-1 mt-2 w-96 shadow-2xl border border-base-300">
        <div class="card-body px-4 py-4">

          <div v-if="Object.keys(filterGroups).length === 0"
               class="text-sm text-base-content/40 text-center py-6">
            <i class="fa-solid fa-spinner fa-spin mr-2"/>
            Loading filters…
          </div>

          <div v-else class="overflow-y-auto max-h-[28rem] space-y-4 pr-1">
            <div
                v-for="(group, groupKey) in filterGroups"
                :key="groupKey"
                class="rounded-xl border border-base-200 bg-base-200/40 p-3"
            >
              <!-- Group header -->
              <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/50 mb-3">
                <i :class="`fa-solid fa-${group.icon} text-primary`"/>
                {{ group.pretty_name }}
              </p>

              <div class="space-y-3">
                <div v-for="(option, optKey) in group.options" :key="optKey">

                  <!-- BOOLEAN — pill toggle -->
                  <template v-if="option.type === 'boolean'">
                    <label class="flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-sm cursor-pointer w-fit transition-colors"
                           :class="filterState[optKey]?.enabled ? 'border-primary bg-primary/10 text-primary' : ''">
                      <input
                          type="checkbox"
                          class="hidden"
                          v-model="filterState[optKey].enabled"
                          @change="doSearch"
                      />
                      <i class="fa-solid fa-check text-[10px]" v-if="filterState[optKey]?.enabled"/>
                      {{ option.pretty_name }}
                    </label>
                  </template>

                  <!-- RANGE — dual slider -->
                  <template v-else-if="option.type === 'range'">
                    <div class="flex items-center justify-between mb-1.5">
                      <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-xs checkbox-primary"
                            v-model="filterState[optKey].enabled"
                            @change="doSearch"
                        />
                        {{ option.pretty_name }}
                      </label>
                      <span v-if="filterState[optKey]?.enabled" class="text-xs text-base-content/40">
                        {{ filterState[optKey].min }} – {{ filterState[optKey].max }}
                      </span>
                    </div>
                    <dual-range-component
                        v-if="filterState[optKey]?.enabled"
                        :min="option.min ?? 0"
                        :max="option.max ?? 100"
                        :model-value="{ min: filterState[optKey].min, max: filterState[optKey].max }"
                        @update:model-value="v => { filterState[optKey].min = v.min; filterState[optKey].max = v.max; doSearch() }"
                    />
                  </template>

                  <!-- NUMBER — single slider -->
                  <template v-else-if="option.type === 'number'">
                    <div class="flex items-center justify-between mb-1.5">
                      <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-xs checkbox-primary"
                            v-model="filterState[optKey].enabled"
                            @change="doSearch"
                        />
                        {{ option.pretty_name }}
                      </label>
                      <span v-if="filterState[optKey]?.enabled" class="text-xs text-base-content/40">
                        {{ filterState[optKey].value }}
                      </span>
                    </div>
                    <input
                        v-if="filterState[optKey]?.enabled"
                        type="range"
                        class="range range-xs range-primary w-full"
                        :min="option.min ?? 0"
                        :max="option.max ?? 100"
                        v-model.number="filterState[optKey].value"
                        @change="doSearch"
                    />
                  </template>

                  <!-- STRING — text input -->
                  <template v-else>
                    <label class="flex items-center gap-2 text-sm cursor-pointer select-none mb-1.5">
                      <input
                          type="checkbox"
                          class="checkbox checkbox-xs checkbox-primary"
                          v-model="filterState[optKey].enabled"
                          @change="doSearch"
                      />
                      {{ option.pretty_name }}
                    </label>
                    <input
                        v-if="filterState[optKey]?.enabled"
                        type="text"
                        class="input input-sm w-full"
                        :placeholder="option.pretty_name"
                        v-model="filterState[optKey].value"
                        @input="onInput"
                    />
                  </template>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
