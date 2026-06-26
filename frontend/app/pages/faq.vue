<template>
  <company-pages-component>

    <!-- Header -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-2">
          <i class="fa-solid fa-circle-question text-3xl" />
          <h1 class="text-4xl font-bold text-base-content">FAQ</h1>
        </div>
        <p class="text-base-content opacity-70 leading-relaxed">
          Frequently asked questions about Forkcast. Can't find an answer?
          <nuxt-link-locale to="/contact" class="text-primary hover:underline">Contact us.</nuxt-link-locale>
        </p>
      </div>
    </div>

    <!-- General -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-info-circle mr-2" />
          General
        </h2>
        <div class="join join-vertical w-full flex flex-col gap-1">

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-general" defaultChecked />
            <div class="collapse-title font-semibold text-base-content">
              Is Forkcast free to use?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Yes. Forkcast is completely free and requires no payment or subscription. It is a school project developed
              at HTL Leonding and is provided at no cost to all users.
            </div>
          </div>

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-general" />
            <div class="collapse-title font-semibold text-base-content">
              Do I need an account to use Forkcast?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              You can browse the homepage without an account, but features like the meal planner, favorites, and friends
              require you to register and log in.
            </div>
          </div>

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-general" />
            <div class="collapse-title font-semibold text-base-content">
              Is Forkcast available in multiple languages?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Yes. Forkcast supports English and German. Use the language switcher in the top navigation bar to change
              the interface language.
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Account -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-user mr-2" />
          Account
        </h2>
        <div class="join join-vertical w-full flex flex-col gap-1">

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-account" defaultChecked />
            <div class="collapse-title font-semibold text-base-content">
              How do I change my password?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Go to <strong>Account → Manage Profile</strong> and use the password section to set a new password.
              You will need to enter your current password to confirm the change.
            </div>
          </div>

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-account" />
            <div class="collapse-title font-semibold text-base-content">
              How do I delete my account?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Account deletion is not yet available directly in the app. Please
              <nuxt-link-locale to="/contact" class="text-primary hover:underline">contact us</nuxt-link-locale>
              to request deletion of your account and data.
            </div>
          </div>

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-account" />
            <div class="collapse-title font-semibold text-base-content">
              I forgot my password. What do I do?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              On the login page, click <strong>Forgot Password</strong> and enter your email address. You will receive
              a reset link to set a new password.
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-star mr-2" />
          Features
        </h2>
        <div class="join join-vertical w-full flex flex-col gap-1">

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-features" defaultChecked />
            <div class="collapse-title font-semibold text-base-content">
              How do I add a recipe to my meal schedule?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Open the Schedule view via the calendar icon in the navbar. Drag a recipe from the list on the left and
              drop it into your meal plan on the right.
            </div>
          </div>

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-features" />
            <div class="collapse-title font-semibold text-base-content">
              How do I remove a recipe from my favorites?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Go to the <strong>Account</strong> page, find the recipe under Favorite Foods, and click
              <strong>Remove</strong>. A confirmation dialog will appear before the recipe is deleted from your list.
            </div>
          </div>

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-features" />
            <div class="collapse-title font-semibold text-base-content">
              Can I use Forkcast on my phone?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Yes. Forkcast is designed to be responsive and works on both desktop and mobile browsers. No app
              installation is required.
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Privacy & Data -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-shield-halved mr-2" />
          Privacy &amp; Data
        </h2>
        <div class="join join-vertical w-full flex flex-col gap-1">

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-privacy" defaultChecked />
            <div class="collapse-title font-semibold text-base-content">
              Is my data safe?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              We take reasonable precautions to protect your data. However, as this is a school project, we cannot
              provide the same guarantees as a commercial service. See our
              <nuxt-link-locale to="/privacy-policy" class="text-primary hover:underline">Privacy Policy</nuxt-link-locale>
              for full details.
            </div>
          </div>

          <div class="collapse collapse-arrow join-item">
            <input type="radio" name="faq-privacy" />
            <div class="collapse-title font-semibold text-base-content">
              Does Forkcast use cookies?
            </div>
            <div class="collapse-content text-base-content opacity-70">
              Currently, Forkcast does not use tracking cookies. See our
              <nuxt-link-locale to="/cookie-policy" class="text-primary hover:underline">Cookie Policy</nuxt-link-locale>
              for more information.
            </div>
          </div>

        </div>
      </div>
    </div>

  </company-pages-component>
</template>
