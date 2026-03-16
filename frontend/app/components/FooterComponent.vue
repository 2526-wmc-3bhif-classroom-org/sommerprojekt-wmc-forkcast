<template>
  <footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
    <aside>
      <i class="fa-solid fa-utensils text-5xl"/>
      <p>
        <strong>{{$t('component.footer.title')}}</strong>
        <br />
        <span>{{$t('component.footer.subtitle')}}</span>
      </p>
    </aside>
    <nav>
      <h1 class="footer-title">
        {{$t('component.footer.services')}}
      </h1>
      <nuxt-link-locale to="/manual" class="link link-hover">
        {{$t('component.footer.services.usage_manual')}}
      </nuxt-link-locale>
      <nuxt-link-locale to="/documentation" class="link link-hover">
        {{$t('component.footer.services.documentation')}}
      </nuxt-link-locale>
      <nuxt-link-locale to="/faq" class="link link-hover">
        {{$t('component.footer.services.faq')}}
      </nuxt-link-locale>
    </nav>
    <nav>
      <h1 class="footer-title">
        {{$t('component.footer.company')}}
      </h1>
      <nuxt-link-locale to="/about" class="link link-hover">
        {{$t('component.footer.company.about')}}
      </nuxt-link-locale>
      <nuxt-link-locale to="/contact" class="link link-hover">
        {{$t('component.footer.company.contact')}}
      </nuxt-link-locale>
      <nuxt-link-locale to="/source" class="link link-hover">
        {{$t('component.footer.company.source')}}
      </nuxt-link-locale>
    </nav>
    <nav>
      <h1 class="footer-title">
        {{$t('component.footer.legal')}}
      </h1>
      <nuxt-link-locale to="/terms-of-use" class="link link-hover">
        {{$t('component.footer.legal.terms')}}
      </nuxt-link-locale>
      <nuxt-link-locale to="/privacy-policy" class="link link-hover">
        {{$t('component.footer.legal.privacy')}}
      </nuxt-link-locale>
      <nuxt-link-locale to="/cookie-policy" class="link link-hover">
        {{$t('component.footer.legal.cookies')}}
      </nuxt-link-locale>
    </nav>
  </footer>
</template>