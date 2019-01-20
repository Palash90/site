<template>
  <div>
    <p>{{str}}</p>
    <p>Will add {{componentName}} here</p>
  </div>
</template>

<script>
export default {
  name: "ComponentFactory",
  props: {
    str: String,
    componentName: String
  }
};
</script>
