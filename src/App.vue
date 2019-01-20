<template>
  <div class="border">
    <div class="card float-left">
      <img
        src="/static/professional.jpg"
        class="img float-left card"
        alt="Portrait"
        width="256"
        height="256"
      >
    </div>
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item active">
              <router-link to="/" class="nav-link" exact>world</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/app">App</router-link>
            </li>
          </ul>
        </div>
      </nav>
      <router-view/>
    </div>
  </div>
</template>

<script>
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

export default {
  name: "App",
  data: function() {
    return {
      imgSrc: "/static/professional.jpg"
    };
  }
};
</script>