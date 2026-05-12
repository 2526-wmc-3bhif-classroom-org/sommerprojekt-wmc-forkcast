<template>
  <company-pages-component>

    <!-- Header -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="text-4xl font-bold text-base-content mb-2">About Forkcast</h1>
        <p class="text-base-content opacity-80 text-lg leading-relaxed">
          Forkcast is a free meal planning and recipe management platform developed as a school project by
          <span class="text-primary font-semibold">Forkcast Solutions</span> at
          <span class="text-primary font-semibold">HTL Leonding</span>, Upper Austria.
        </p>
        <p class="text-base-content opacity-70 leading-relaxed mt-2">
          Our goal is to make meal planning simple and enjoyable — discover recipes, organize your weekly schedule,
          manage ingredients, and share favorites with friends, all in one place.
        </p>
      </div>
    </div>

    <!-- Team -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-base-content mb-6">
          <i class="fa-solid fa-users text-primary mr-2" />
          The Team
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div class="flex items-center gap-4 bg-base-200 rounded-box p-4">
            <div class="w-14 h-14 rounded-full border-2 border-accent shrink-0 bg-accent flex items-center justify-center">
              <span class="text-accent-content text-xl font-bold select-none">N</span>
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Nico Haider</p>
              <span class="badge badge-primary badge-sm mt-1">
                <i class="fa-solid fa-display mr-1" />Frontend
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4 bg-base-200 rounded-box p-4">
            <div class="w-14 h-14 rounded-full border-2 border-accent shrink-0 bg-accent flex items-center justify-center">
              <span class="text-accent-content text-xl font-bold select-none">E</span>
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Erik Reitbauer</p>
              <span class="badge badge-primary badge-sm mt-1">
                <i class="fa-solid fa-display mr-1" />Frontend
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4 bg-base-200 rounded-box p-4">
            <div class="w-14 h-14 rounded-full border-2 border-accent shrink-0 bg-accent flex items-center justify-center">
              <span class="text-accent-content text-xl font-bold select-none">K</span>
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Kerimcan Yagci</p>
              <span class="badge badge-secondary badge-sm mt-1">
                <i class="fa-solid fa-server mr-1" />Backend
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4 bg-base-200 rounded-box p-4">
            <div class="w-14 h-14 rounded-full border-2 border-accent shrink-0 bg-accent flex items-center justify-center">
              <span class="text-accent-content text-xl font-bold select-none">L</span>
            </div>
            <div>
              <p class="text-base-content font-semibold text-lg">Lukas Grünzweil</p>
              <span class="badge badge-secondary badge-sm mt-1">
                <i class="fa-solid fa-server mr-1" />Backend
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- School context -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-2">
          <i class="fa-solid fa-graduation-cap text-primary mr-2" />
          School Project
        </h2>
        <p class="text-base-content opacity-70 leading-relaxed">
          Forkcast was created as part of the "Web & Mobile <Computing></Computing>" course at HTL Leonding, a technical secondary school
          in Upper Austria. The project is provided free of charge and is continuously under development.
          No commercial use is intended.
        </p>
      </div>
    </div>

  </company-pages-component>
</template>
