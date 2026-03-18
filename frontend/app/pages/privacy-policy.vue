<script setup lang="ts">
const img = useImage();
const bgImage = img('/images/hero-bg.jpg', {quality: 90, format: 'webp'});

const config = useRuntimeConfig();
const { locale } = useI18n();

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
  <div class="container mx-auto px-4 py-24 flex justify-center">
    <div class="card-body">
      <h1 class="card-title text-4xl mb-2">{{$t('privacy-policy.site.header')}}</h1>
      <p class="text-sm opacity-70 mb-6">{{$t('privacy-policy.site.lastUpdated')}}{{ lastUpdatedDate }}</p>

      <div class="divider"></div>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">{{$t('privacy-policy.introduction.header')}}</h2>
        <p>
          This website, “Forkcast”, is a school project developed by Forkcast Solutions at HTL Leonding, Upper
          Austria. The website is provided free of charge and can be used by anyone. As this is a work in
          progress, no guarantees regarding availability, accuracy, or functionality are given.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">2. Data We Collect</h2>
        <p>We collect and store user data strictly for functional purposes of the website. This includes:</p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li>Username</li>
          <li>Email address</li>
          <li>Login credentials</li>
          <li>Saved recipes and meal selections</li>
          <li>Favorite items or ingredients</li>
        </ul>
        <p>No payment data is collected or processed at any time.</p>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">3. Purpose of Data Processing</h2>
        <p>
          The collected data is used solely to:
        </p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li>Provide account functionality</li>
          <li>Enable the meal planner and recipe features</li>
          <li>Store user preferences and selections</li>
          <li>Ensure basic operation and security of the website</li>
        </ul>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">4. Data Storage</h2>
        <p>
          All data is stored in a database. Appropriate technical measures are taken to protect the data within
          the scope of this school project. However, as this is a non-commercial project, no guarantees regarding
          data security can be provided.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">5. User Rights and Data Management</h2>
        <p>
          Users may modify or delete their data themselves if such functionality is available on the website.
          If this functionality is not yet implemented, users may request changes or deletion of their data by
          contacting the team via email. Requests will be processed as soon as possible.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">6. Data Sharing</h2>
        <p>
          No personal data is sold or shared with third parties, unless required by applicable law.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">7. Cookies and Tracking</h2>
        <p>
          Currently, no cookies or tracking technologies are actively used. Such technologies may be implemented
          in future versions of the website to improve functionality.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">8. Liability Disclaimer</h2>
        <p>
          Forkcast is a school project and is provided without any warranties or legal guarantees. The team does
          not take responsibility for any issues arising from the use of the website, including but not limited to
          data loss or service interruptions.
        </p>
      </section>

      <section class="mb-6">
        <h2 class="text-2xl font-bold mb-3">9. Changes to This Privacy Policy</h2>
        <p>
          This privacy policy may be updated at any time without prior notice, as the website is under continuous
          development.
        </p>
      </section>


      <section>
        <h2 class="text-2xl font-bold mb-3">Contact</h2>
        <p>For any questions, or to request data modification or deletion, please contact:</p>
        <p>Email: <a href="mailto:n.haider@students.htl-leonding.ac.at" class="link link-primary">n.haider@students.htl-leonding.ac.at</a>
        </p>
      </section>
    </div>
  </div>
</template>