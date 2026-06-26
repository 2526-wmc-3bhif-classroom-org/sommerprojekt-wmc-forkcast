<template>
  <company-pages-component>

    <!-- Header -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-2">
          <i class="fa-brands fa-github text-3xl" />
          <h1 class="text-4xl font-bold text-base-content">Source Code</h1>
        </div>
        <p class="text-base-content opacity-70 leading-relaxed">
          Forkcast is an open school project. The full source code is publicly available on GitHub.
        </p>
      </div>
    </div>

    <!-- GitHub link -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-code-branch mr-2" />
          Repository
        </h2>
        <div class="flex items-center gap-4 bg-base-200 rounded-box p-4">
          <i class="fa-brands fa-github text-4xl shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-base-content font-semibold">sommerprojekt-wmc-forkcast</p>
            <p class="text-base-content opacity-50 text-sm truncate">2526-wmc-3bhif-classroom-org</p>
          </div>
          <a
            href="https://github.com/2526-wmc-3bhif-classroom-org/sommerprojekt-wmc-forkcast"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary shrink-0"
          >
            <i class="fa-solid fa-arrow-up-right-from-square mr-2" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>

    <!-- Tech stack -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-layer-group mr-2" />
          Tech Stack
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div class="flex items-center gap-3 bg-base-200 rounded-box p-3">
            <i class="fa-brands fa-vuejs text-2xl shrink-0" />
            <div>
              <p class="text-base-content font-medium">Vue 3 / Nuxt</p>
              <p class="text-base-content opacity-50 text-sm">Frontend framework</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-base-200 rounded-box p-3">
            <i class="fa-brands fa-node-js text-2xl shrink-0" />
            <div>
              <p class="text-base-content font-medium">Node.js / Express</p>
              <p class="text-base-content opacity-50 text-sm">Backend API</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-base-200 rounded-box p-3">
            <i class="fa-solid fa-database text-2xl shrink-0" />
            <div>
              <p class="text-base-content font-medium">SQLite</p>
              <p class="text-base-content opacity-50 text-sm">Database</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-base-200 rounded-box p-3">
            <i class="fa-solid fa-wand-magic-sparkles text-2xl shrink-0" />
            <div>
              <p class="text-base-content font-medium">Tailwind CSS / DaisyUI</p>
              <p class="text-base-content opacity-50 text-sm">Styling</p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- License -->
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-2">
          <i class="fa-solid fa-scale-balanced mr-2" />
          License
        </h2>
        <p class="text-base-content opacity-70 leading-relaxed">
          This project is a school assignment and is made available for educational purposes. Reuse of the code is
          permitted with attribution to Forkcast Solutions / HTL Leonding. No warranty is provided.
        </p>
      </div>
    </div>

  </company-pages-component>
</template>
