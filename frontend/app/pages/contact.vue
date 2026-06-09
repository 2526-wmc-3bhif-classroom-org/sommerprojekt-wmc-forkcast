<script setup lang="ts">
const name = ref('')
const email = ref('')
const message = ref('')

function submitForm() {
  const subject = encodeURIComponent(`Forkcast Contact: ${name.value}`)
  const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}`)
  window.location.href = `mailto:n.haider@students.htl-leonding.ac.at?subject=${subject}&body=${body}`
}
</script>

<template>
  <company-pages-component>

    <!-- Header -->
    <div class="card shadow-xl">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-2">
          <i class="fa-solid fa-envelope text-primary text-3xl" />
          <h1 class="text-4xl font-bold text-base-content">Contact</h1>
        </div>
        <p class="text-base-content opacity-70 leading-relaxed">
          Have a question, found a bug, or want to get in touch with the Forkcast team? Fill out the form below and
          your default mail client will open with a pre-filled message.
        </p>
      </div>
    </div>

    <!-- Form -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-4">
          <i class="fa-solid fa-paper-plane text-primary mr-2" />
          Send a Message
        </h2>
        <form @submit.prevent="submitForm" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label">
              <i class="fa-solid fa-user" />
              <span class="label-text text-base-content">Your Name</span>
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="Max Mustermann"
              class="input input-bordered w-full"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <i class="fa-solid fa-at" />
              <span class="label-text text-base-content">Your Email</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="max@example.com"
              class="input input-bordered w-full"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <i class="fa-solid fa-pen" />
              <span class="label-text text-base-content">Message</span>
            </label>
            <textarea
              v-model="message"
              placeholder="Write your message here..."
              class="textarea textarea-bordered w-full h-36 resize-none"
              required
            />
          </div>
          <div class="card-actions justify-end mt-2">
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-paper-plane mr-2" />
              Open Mail Client
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Direct contact -->
    <div class="card shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold text-base-content mb-2">
          <i class="fa-solid fa-at text-primary mr-2" />
          Direct Contact
        </h2>
        <p class="text-base-content opacity-70 mb-3">You can also reach us directly via email:</p>
        <a
          href="mailto:n.haider@students.htl-leonding.ac.at"
          class="flex items-center gap-3 text-primary hover:underline break-all"
        >
          <i class="fa-solid fa-envelope shrink-0" />
          n.haider@students.htl-leonding.ac.at
        </a>
      </div>
    </div>

  </company-pages-component>
</template>
