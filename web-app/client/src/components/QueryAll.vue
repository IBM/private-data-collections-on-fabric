<template>
  <div class="posts">
    <h1>Current State: All Key-Value Pairs in World State</h1>
    <button v-on:click="queryAll()">Query All Assets</button>
        <button v-on:click="goHome()">Home</button>

    <div v-bind:key="Asset.Key" v-for="Asset in response">
      <p><b>Key:</b> {{ Asset.Key }} | <b>Value:</b> {{ Asset.Record }}</p>
    </div>
    <vue-instant-loading-spinner id = 'loader' ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "response",
  props: ["emailaddress"],
  data() {
    return {
      response: null
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
mounted: async function() {
    console.log('pushing back home')
    //if we reached here before logging in, redirect the user to login
    if(!this.$route.params.emailaddress){
      this.$router.push({ name: 'Home'});
    }
  },
  methods: {
    async queryAll() {
      this.response = null;
      this.runSpinner();
      const apiResponse = await PostsService.queryAll(this.$route.params.emailaddress);
      console.log(apiResponse);
      this.response = apiResponse.data;
      this.hideSpinner();
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    },
    async goHome() {
      console.log(this.$route.params.emailaddress);
      this.$router.push({
        name: "CastBallot",
        params: { emailaddress: this.$route.params.emailaddress }
      });
    },
  },

};
</script>
