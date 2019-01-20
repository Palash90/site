<template>
  <div>
    <router-link to="/" exact>world</router-link>
    <router-link to="/app">App</router-link>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>