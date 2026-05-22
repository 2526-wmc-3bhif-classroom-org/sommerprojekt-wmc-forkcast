<template>
  <company-pages-component>

    <!-- Header -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-2">
          <i class="fa-solid fa-file-lines text-primary text-3xl" />
          <h1 class="text-4xl font-bold text-base-content">Documentation</h1>
        </div>
        <p class="text-base-content opacity-70 leading-relaxed">
          A complete overview of all features available in Forkcast and how they work.
        </p>
      </div>
    </div>

    <!-- Dashboard -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-house text-primary mr-2" />
          Dashboard
        </h2>
        <p class="text-base-content opacity-70 leading-relaxed mb-4">
          The dashboard is the main entry point after login. Forkcast presents you with recipe suggestions to help
          decide what to cook. Each recipe card displays:
        </p>
        <ul class="flex flex-col gap-2">
          <li class="flex items-center gap-3 bg-base-200 rounded-box px-4 py-2">
            <i class="fa-solid fa-fire text-primary shrink-0" />
            <span class="text-base-content opacity-80">Calorie count and nutritional context</span>
          </li>
          <li class="flex items-center gap-3 bg-base-200 rounded-box px-4 py-2">
            <i class="fa-solid fa-clock text-primary shrink-0" />
            <span class="text-base-content opacity-80">Preparation time and effort rating</span>
          </li>
          <li class="flex items-center gap-3 bg-base-200 rounded-box px-4 py-2">
            <i class="fa-solid fa-utensils text-primary shrink-0" />
            <span class="text-base-content opacity-80">Ingredient count and serving size</span>
          </li>
          <li class="flex items-center gap-3 bg-base-200 rounded-box px-4 py-2">
            <i class="fa-solid fa-tags text-primary shrink-0" />
            <span class="text-base-content opacity-80">Dietary tags (Vegetarian, Vegan, Gluten Free, Spicy, …)</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Meal Planner -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-calendar-days text-primary mr-2" />
          Meal Planner / Schedule
        </h2>
        <p class="text-base-content opacity-70 leading-relaxed mb-4">
          The schedule view provides a drag-and-drop interface for planning your meals. The left panel shows all
          available recipes; the right panel is your personal meal plan where you drop recipes to assign them to a slot.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-base-200 rounded-box p-3 flex items-start gap-3">
            <i class="fa-solid fa-hand-pointer text-primary mt-0.5 shrink-0" />
            <div>
              <p class="text-base-content font-medium">Drag &amp; Drop</p>
              <p class="text-base-content opacity-50 text-sm">Drag any recipe from the list into your schedule</p>
            </div>
          </div>
          <div class="bg-base-200 rounded-box p-3 flex items-start gap-3">
            <i class="fa-solid fa-calendar text-primary mt-0.5 shrink-0" />
            <div>
              <p class="text-base-content font-medium">Calendar Navigation</p>
              <p class="text-base-content opacity-50 text-sm">Use the navbar calendar to jump to specific dates</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorites -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-heart text-primary mr-2" />
          Favorites
        </h2>
        <p class="text-base-content opacity-70 leading-relaxed">
          Mark any recipe as a favorite to save it for later. Your favorites are listed on the Account page and can be
          removed at any time via the confirmation dialog.
        </p>
      </div>
    </div>

    <!-- Friends -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-user-group text-primary mr-2" />
          Friends
        </h2>
        <p class="text-base-content opacity-70 leading-relaxed">
          Add other Forkcast users as friends to stay connected. Your friends list is visible on the Account page.
          You can remove a friend at any time using the remove button; a confirmation dialog prevents accidental
          deletions.
        </p>
      </div>
    </div>

    <!-- Account & Profile -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-user text-primary mr-2" />
          Account &amp; Profile
        </h2>
        <p class="text-base-content opacity-70 leading-relaxed mb-4">
          The Account page gives you a full overview of your profile, favorites, and friends. From there you can
          navigate to <strong>Manage Profile</strong> to:
        </p>
        <ul class="flex flex-col gap-2">
          <li class="flex items-center gap-3 bg-base-200 rounded-box px-4 py-2">
            <i class="fa-solid fa-signature text-primary shrink-0" />
            <span class="text-base-content opacity-80">Change your username</span>
          </li>
          <li class="flex items-center gap-3 bg-base-200 rounded-box px-4 py-2">
            <i class="fa-solid fa-lock text-primary shrink-0" />
            <span class="text-base-content opacity-80">Update your password</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Auth -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-key text-primary mr-2" />
          Authentication
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-base-200 rounded-box p-3 text-center">
            <i class="fa-solid fa-user-plus text-primary text-2xl mb-2" />
            <p class="text-base-content font-medium">Sign Up</p>
            <p class="text-base-content opacity-50 text-sm">Register with email and password</p>
          </div>
          <div class="bg-base-200 rounded-box p-3 text-center">
            <i class="fa-solid fa-right-to-bracket text-primary text-2xl mb-2" />
            <p class="text-base-content font-medium">Login</p>
            <p class="text-base-content opacity-50 text-sm">Access your existing account</p>
          </div>
          <div class="bg-base-200 rounded-box p-3 text-center">
            <i class="fa-solid fa-envelope-circle-check text-primary text-2xl mb-2" />
            <p class="text-base-content font-medium">Forgot Password</p>
            <p class="text-base-content opacity-50 text-sm">Reset via email verification</p>
          </div>
        </div>
      </div>
    </div>

  </company-pages-component>
</template>
