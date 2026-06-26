<template>
  <company-pages-component>

    <!-- Header -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-2">
          <i class="fa-solid fa-book-open text-3xl" />
          <h1 class="text-4xl font-bold text-base-content">Usage Manual</h1>
        </div>
        <p class="text-base-content opacity-70 leading-relaxed">
          New to Forkcast? This guide walks you through everything you need to get started — from creating your account
          to planning your first week of meals.
        </p>
      </div>
    </div>

    <!-- Steps -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-6">
          <i class="fa-solid fa-list-ol mr-2" />
          Getting Started
        </h2>
        <ol class="flex flex-col gap-4">

          <li class="flex gap-4 rounded-box p-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-lg shrink-0">
              1
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Create an Account</p>
              <p class="text-base-content opacity-60 text-sm mt-1">
                Click <strong>Sign Up</strong> on the homepage and enter your username, email address, and a password.
                Verify your email to activate your account.
              </p>
            </div>
          </li>

          <li class="flex gap-4 rounded-box p-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-lg shrink-0">
              2
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Explore the Dashboard</p>
              <p class="text-base-content opacity-60 text-sm mt-1">
                After logging in, you land on your Dashboard where Forkcast suggests recipes. Browse the cards and
                discover something new to cook today.
              </p>
            </div>
          </li>

          <li class="flex gap-4 rounded-box p-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-lg shrink-0">
              3
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Plan Your Meals</p>
              <p class="text-base-content opacity-60 text-sm mt-1">
                Open the <strong>Schedule</strong> view via the calendar icon in the navbar. Drag recipes from the list
                on the left and drop them into your weekly meal slots on the right.
              </p>
            </div>
          </li>

          <li class="flex gap-4 rounded-box p-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-lg shrink-0">
              4
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Save Favorites</p>
              <p class="text-base-content opacity-60 text-sm mt-1">
                Found a recipe you love? Save it to your favorites so you can find it again quickly. Your favorites
                are visible in your Account page.
              </p>
            </div>
          </li>

          <li class="flex gap-4 rounded-box p-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-lg shrink-0">
              5
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Add Friends</p>
              <p class="text-base-content opacity-60 text-sm mt-1">
                Connect with other Forkcast users. You can view and manage your friends list on the Account page.
              </p>
            </div>
          </li>

          <li class="flex gap-4 rounded-box p-4">
            <div class="w-10 h-10 rounded-full bg-primary/20 text-primary-content flex items-center justify-center font-bold text-lg shrink-0">
              6
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Manage Your Profile</p>
              <p class="text-base-content opacity-60 text-sm mt-1">
                Go to <strong>Account → Manage Profile</strong> to update your username or change your password at any
                time.
              </p>
            </div>
          </li>

        </ol>
      </div>
    </div>

    <!-- Tips -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-lightbulb mr-2" />
          Tips
        </h2>
        <ul class="flex flex-col gap-3">
          <li class="flex items-start gap-3 text-base-content opacity-70">
            <i class="fa-solid fa-circle-check shrink-0 mt-0.5" />
            Use the calendar dropdown in the navbar to quickly jump to a specific date in your schedule.
          </li>
          <li class="flex items-start gap-3 text-base-content opacity-70">
            <i class="fa-solid fa-circle-check shrink-0 mt-0.5" />
            Recipe cards show calorie count, prep time, and dietary tags at a glance.
          </li>
          <li class="flex items-start gap-3 text-base-content opacity-70">
            <i class="fa-solid fa-circle-check shrink-0 mt-0.5" />
            Switch the language using the language switcher in the top navigation bar.
          </li>
        </ul>
      </div>
    </div>

  </company-pages-component>
</template>
