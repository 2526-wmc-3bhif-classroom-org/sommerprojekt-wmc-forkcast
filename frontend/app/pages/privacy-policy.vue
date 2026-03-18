<script setup lang="ts">
const img = useImage();
const bgImage = img('/images/hero-bg.jpg', {quality: 90, format: 'webp'});

const config = useRuntimeConfig();
const {locale} = useI18n();

const lastUpdatedDate = computed(() => {
  const date = new Date(config.public.privacyPolicyLastUpdated as string);
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
</script>

<template>
  <LegalPagesComponent>
    <h1 class="card-title text-4xl mb-2">{{ $t('privacy-policy.site.header') }}</h1>
    <p class="text-sm opacity-70 mb-6">{{ $t('privacy-policy.site.lastUpdated') }}{{ lastUpdatedDate }}</p>

    <div class="divider"></div>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.introduction.header') }}</h2>
      <p>
        {{ $t('privacy-policy.introduction.text') }}
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.data_collection.header') }}</h2>
      <p>{{ $t('privacy-policy.data_collection.text') }}</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li>{{ $t('privacy-policy.data_collection.list.username') }}</li>
        <li>{{ $t('privacy-policy.data_collection.list.email') }}</li>
        <li>{{ $t('privacy-policy.data_collection.list.credentials') }}</li>
        <li>{{ $t('privacy-policy.data_collection.list.recipes') }}</li>
        <li>{{ $t('privacy-policy.data_collection.list.favorites') }}</li>
      </ul>
      <p>{{ $t('privacy-policy.data_collection.payment_note') }}</p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.purpose.header') }}</h2>
      <p>
        {{ $t('privacy-policy.purpose.text') }}
      </p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li>{{ $t('privacy-policy.purpose.list.account') }}</li>
        <li>{{ $t('privacy-policy.purpose.list.planner') }}</li>
        <li>{{ $t('privacy-policy.purpose.list.preferences') }}</li>
        <li>{{ $t('privacy-policy.purpose.list.security') }}</li>
      </ul>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.storage.header') }}</h2>
      <p>
        {{ $t('privacy-policy.storage.text') }}
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.rights.header') }}</h2>
      <p>
        {{ $t('privacy-policy.rights.text') }}
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.sharing.header') }}</h2>
      <p>
        {{ $t('privacy-policy.sharing.text') }}
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.cookies.header') }}</h2>
      <p>
        {{ $t('privacy-policy.cookies.text') }}
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.liability.header') }}</h2>
      <p>
        {{ $t('privacy-policy.liability.text') }}
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.changes.header') }}</h2>
      <p>
        {{ $t('privacy-policy.changes.text') }}
      </p>
    </section>


    <section>
      <h2 class="text-2xl font-bold mb-3">{{ $t('privacy-policy.contact.header') }}</h2>
      <p>{{ $t('privacy-policy.contact.text') }}</p>
      <p>{{ $t('privacy-policy.contact.email_label') }}<a href="mailto:n.haider@students.htl-leonding.ac.at"
                                                          class="link link-primary">n.haider@students.htl-leonding.ac.at</a>
      </p>
    </section>
  </LegalPagesComponent>
</template>