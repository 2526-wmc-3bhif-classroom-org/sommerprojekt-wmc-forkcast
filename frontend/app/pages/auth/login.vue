<script setup lang="ts">
import useFailureHandler from "~/assets/failure-handler";
import type {Failure} from "~/assets/model/failure";
import useAuthService from "~/assets/auth-service";

definePageMeta({
  title: 'Login',
  description: 'Login to your account to access your dashboard and manage your settings.',
})

const email = ref<HTMLInputElement>()
const password = ref<HTMLInputElement>()

const emailError = ref<HTMLSpanElement>()
const passwordError = ref<HTMLSpanElement>()
const mainError = ref<HTMLSpanElement>()

const auth = useAuthService()
const failureHandler = useFailureHandler()

failureHandler.addHandler("email", (message) => {
  emailError.value!!.innerText = message
})

failureHandler.addHandler("password", (message) => {
  passwordError.value!!.innerText = message
})

failureHandler.setMainHandler(message => {
  mainError.value!!.innerText = message
})

async function login() {
  if (!email.value?.value || !password.value?.value) {
    failureHandler.fail({ message: "Please fill in all fields." } as Failure)
    return
  }

  let failure = await auth.login(email.value.value, password.value.value)
  if (failure) {
    failureHandler.fail(failure)
    return
  }

  alert("Logged in successfully!") //TODO
}
</script>

<template>
  <div class="bg-[#07070B]">
    <div class="hero min-h-screen
                bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.8)),url('/images/register-bg.jpg')]
                bg-fixed bg-no-repeat bg-cover bg-top animate-zoom-in">
      <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left lg:ml-24 opacity-0 animate-fade-in-slide-in-up-delay">
          <h1 class="text-3xl md:text-5xl font-bold text-nowrap">
            <i class="fa-solid fa-hand-peace mr-2"/>
            <span>Welcome back!</span>
          </h1>
          <p class="py-6 w-96 m-auto">
            Please enter your username and
            password to access your account.
            If you don't have an account, you can sign up for one.
            We look forward to seeing you again!
          </p>
        </div>
        <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl opacity-0 animate-fade-in-slide-in-up">
          <div class="card-body w-full">
            <form class="fieldset w-full" onsubmit="return false">
              <label class="label">
                <i class="fa-solid fa-at"/>
                <span>Email</span>
              </label>
              <label class="label text-error text-wrap">
                <i v-if="failureHandler.has('email')" class="fa-solid fa-triangle-exclamation"/>
                <span ref="emailError"></span>
              </label>
              <input ref="email" autocomplete="email" type="text" class="input w-full" placeholder="Email" />
              <label class="label">
                <i class="fa-solid fa-key"/>
                <span>Password</span>
              </label>
              <label class="label text-error text-wrap">
                <i v-if="failureHandler.has('password')" class="fa-solid fa-triangle-exclamation"/>
                <span ref="passwordError"></span>
              </label>
              <input ref="password" autocomplete="current-password" type="password" class="input w-full" placeholder="Password" />
              <div>
                <NuxtLink to="/auth/forgot" class="link link-hover">Forgot password?</NuxtLink>
              </div>
              <label class="label text-error">
                <i v-if="failureHandler.hasMain()" class="fa-solid fa-triangle-exclamation"/>
                <span ref="mainError"></span>
              </label>
              <button class="btn btn-primary mt-4" @click="login">
                <i class="fa-solid fa-arrow-right-to-bracket"/>
                <span>Login</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
