<template>
  <!-- Loading indicator for page switches -->
  <NuxtLoadingIndicator color="var(--color-primary)" :height="2" :throttle="0" />

  <div class="sticky top-0 navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <NuxtLink to="/" class="btn btn-ghost text-xl"><i class="fa-solid fa-utensils"></i>Forkcast</NuxtLink>
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
            <NuxtLink to="/dashboard/schedule"><i class="fa-solid fa-clock mr-1.5"></i>Schedule</NuxtLink>
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
            <li><NotificationComponent icon="fa-triangle-exclamation" title="Notification 1" description="This is a notification" goto="/"/></li>
            <li><NotificationComponent title="Notification 2" description="This is a notification" goto="/"/></li>
            <li><NotificationComponent title="Notification 3" description="This is a notification" goto="/"/></li>
          </ul>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <i class="fa-solid fa-user"></i>
        </div>
        <ul tabindex="-1" class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
          <li><NuxtLink to="/dashboard/account"><i class="fa-solid fa-user"></i>Account</NuxtLink></li>
          <li><NuxtLink to="/dashboard/settings"><i class="fa-solid fa-gear"></i>Settings</NuxtLink></li>
          <li><NuxtLink to="/auth/logout"><i class="fa-solid fa-arrow-right-from-bracket"></i>Logout</NuxtLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>