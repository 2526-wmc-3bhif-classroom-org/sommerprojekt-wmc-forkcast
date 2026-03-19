<script setup lang="ts">
</script>
<template>
  <div class="hero min-h-screen">
    <div class="hero-content text-center flex flex-col gap-10">
      <h1 class="text-5xl font-bold ">What shall we cook today?</h1>

      <div class="inline-flex space-x-20">
        <recipe-card-component
            image="https://img.spoonacular.com/recipes/716429-312x231.jpg"
            title="Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs"
            :id="716429"
            :popular="true"
            :rating="4"
        />
        <div class="divider divider-horizontal">OR</div>

        <recipe-card-component
            image="https://img.spoonacular.com/recipes/715538-312x231.jpg"
            title="What to make for dinner tonight?? Bruschetta Style Pork & Pasta"
            :id="712429"
            :popular="false"
            :isAlternate="true"
            :rating="2"
        />
      </div>
    </div>
  </div>
</template>