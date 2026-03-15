<script setup lang="ts">
import useAuthService from "~/assets/service/auth-service";

const router = useRouter()
const localePath = useLocalePath()
const authService = useAuthService()

async function logout() {
  await authService.logout()
  await router.push(localePath("/"));
}
</script>

<template>
  <div class="fixed top-0 navbar bg-transparent shadow-sm">
    <div class="flex-1">
      <nuxt-link-locale to="/" class="btn btn-ghost text-xl"><i class="fa-solid fa-utensils"></i>{{$t('component.navbar.title')}}</nuxt-link-locale>
    </div>
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <i class="fa-solid fa-calendar"></i>
        </div>
        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-1 mt-3 shadow">
          <calendar-date class="cally card-body p-0">
            <div class="p-2 py-1" slot="previous"><i class="fa-solid fa-angle-left"></i></div>
            <div class="p-2 py-1" slot="next"><i class="fa-solid fa-angle-right"></i></div>
            <calendar-month></calendar-month>
          </calendar-date>

          <button class="btn btn-primary m-2">
            <nuxt-link-locale to="/dashboard/schedule"><i class="fa-solid fa-clock mr-1.5"></i>{{$t('component.navbar.calendar.schedule')}}</nuxt-link-locale>
          </button>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <i class="fa-solid fa-bell"></i>
        </div>
        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-96 p-2 shadow">
          <div class="flex flex-row justify-between">
            <button class="btn btn-ghost btn-circle"><i class="fa-solid fa-bell-slash"></i></button>
            <button class="btn btn-ghost btn-circle"><i class="fa-solid fa-trash-can"></i></button>
          </div>
          <ul>
            <li><notification-component icon="fa-triangle-exclamation" title="Notification 1" description="This is a notification" goto="/"/></li>
            <li><notification-component title="Notification 2" description="This is a notification" goto="/"/></li>
            <li><notification-component title="Notification 3" description="This is a notification" goto="/"/></li>
          </ul>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <i class="fa-solid fa-user"></i>
        </div>
        <ul tabindex="-1" class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
          <li><nuxt-link-locale to="/dashboard/account"><i class="fa-solid fa-user"></i>{{$t('component.navbar.user.account')}}</nuxt-link-locale></li>
          <li><nuxt-link-locale to="/dashboard/settings"><i class="fa-solid fa-gear"></i>{{$t('component.navbar.user.settings')}}</nuxt-link-locale></li>
          <li><span @click="logout"><i class="fa-solid fa-arrow-right-from-bracket"></i>{{$t('component.navbar.user.logout')}}</span></li>
        </ul>
      </div>
    </div>
  </div>
</template>