<template>
  <div class="bg-dark">
    <div class="card float-left">
      <img src="/static/logo.png" class="img img-responsive" alt="Portrait">
      <h3 class="text-danger">&nbsp;A Crazy Programmer...</h3>
    </div>

    <NavigationComponent class="float-right"/>
  </div>
</template>

<script>
import NavigationComponent from "@/components/NavigationComponent.vue";
export default {
  name: "App",
  components: {
    NavigationComponent
  }
};
</script>