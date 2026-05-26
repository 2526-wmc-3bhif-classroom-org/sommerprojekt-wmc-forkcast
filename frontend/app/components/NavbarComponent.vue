<script setup lang="ts">
import useAuthService from "~/assets/service/auth-service";
import LanguageSwitcherComponent from "~/components/LanguageSwitcherComponent.vue";

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const router = useRouter();
const localePath = useLocalePath();
const authService = useAuthService();

async function logout() {
  await authService.logout();
  await router.push(localePath("/"));
}

function blur() {
  (document.activeElement as HTMLElement).blur();
}

function onCalendarClick(event: Event) {
  let date = (event.target as any).value;
  console.log("Clicked: " + date); //TODO
}
</script>

<template>
  <div :class="['fixed top-0 navbar transition-colors duration-300', { 'navbar-scrolled': isScrolled }, { 'bg-transparent': !isScrolled }]">
    <div class="flex-1">
      <nuxt-link-locale to="/" class="btn btn-ghost text-xl">
        <nuxt-img src="/logo.svg" width="30px" />
        <span>{{$t('component.navbar.title')}}</span>
      </nuxt-link-locale>
    </div>
    <div class="flex-none">
      <language-switcher-component/>

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <i class="fa-solid fa-calendar"/>
        </div>
        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-1 mt-3 shadow">
          <calendar-date class="cally card-body p-0" @change="onCalendarClick">
            <div class="p-2 py-1" slot="previous"><i class="fa-solid fa-angle-left"/></div>
            <div class="p-2 py-1" slot="next"><i class="fa-solid fa-angle-right"/></div>
            <calendar-month></calendar-month>
          </calendar-date>

          <div class="flex gap-2 m-2">
            <nuxt-link-locale @click="blur" to="/dashboard/schedule" class="btn btn-primary flex-1">
              <i class="fa-solid fa-clock mr-1.5"/>
              <span>{{$t('component.navbar.calendar.schedule')}}</span>
            </nuxt-link-locale>
            <nuxt-link-locale @click="blur" to="/dashboard/shopping-list" class="btn btn-secondary">
              <i class="fa-solid fa-cart-shopping"/>
            </nuxt-link-locale>
          </div>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <i class="fa-solid fa-bell"/>
        </div>
        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-96 p-2 shadow">
          <div class="flex flex-row justify-between">
            <button class="btn btn-ghost btn-circle"><i class="fa-solid fa-bell-slash"/></button>
            <button class="btn btn-ghost btn-circle"><i class="fa-solid fa-trash-can"/></button>
          </div>
          <ul>
            <li>
              <notification-component
                  icon="fa-triangle-exclamation"
                  title="Notification 1"
                  description="This is a notification"
                  goto="/"
              />
            </li>
            <li>
              <notification-component
                  icon="fa-triangle-exclamation"
                  title="Notification 2"
                  description="This is a notification"
                  goto="/"
              />
            </li>
            <li>
              <notification-component
                  icon="fa-triangle-exclamation"
                  title="Notification 3"
                  description="This is a notification"
                  goto="/"
              />
            </li>
          </ul>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <i class="fa-solid fa-user"/>
        </div>
        <ul tabindex="-1" class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
          <li>
            <nuxt-link-locale @click="blur" to="/dashboard">
              <i class="fa-solid fa-house"/>
              <span>{{$t('component.navbar.user.dashboard')}}</span>
            </nuxt-link-locale>
          </li>
          <li>
            <nuxt-link-locale @click="blur" to="/dashboard/account">
              <i class="fa-solid fa-user"/>
              <span>{{$t('component.navbar.user.account')}}</span>
            </nuxt-link-locale>
          </li>
          <li>
            <span @click="logout">
              <i class="fa-solid fa-arrow-right-from-bracket"/>
              <span>{{$t('component.navbar.user.logout')}}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>