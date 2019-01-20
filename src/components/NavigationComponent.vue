<template>
  <div class="container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item active" v-for="route in routers" :key="route.path">
            <router-link :to="route.path" class="nav-link" :exact="route.exact">{{route.title}}</router-link>
          </li>
        </ul>
      </div>
    </nav>
    <router-view/>
  </div>
</template>
    
<script>
import { GetRouteData } from "../data/RouteData.js";

export default {
  name: "NavigationComponent",
  data: function() {
    return {
      routers: GetRouteData()
    };
  }
};
</script>