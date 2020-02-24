
<template>
  <div class="posts">
    <button v-on:click="goToQueryAll()">QueryAll</button>
    <button v-on:click="goToAddAsset()">AddAsset</button>
    <button v-on:click="goToQueryPrivateData()">Query Private Details Collection</button>
    <button v-on:click="goToQueryPublicDetails()">Query Public Details Collection</button>
    <h1>Healthcare Platform Home</h1>
    <br />
    <span v-if="response">
      <b>{{ response }}</b>
    </span>
    <br />
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
import Home from "./Home.vue";
import { EventBus } from "./../main";

export default {
  name: "response",
  props: ["emailaddress, mspid"],
  data() {
    return {
      response: ""
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  mounted: async function() {
    console.log("pushing back home");
    //if we reached here before logging in, redirect the user to login
    if (!this.$route.params.emailaddress) {
      this.$router.push({ name: "Home" });
    }
  },
  methods: {
    async goToQueryAll() {
      console.log(this.$route.params.emailaddress);
      this.$router.push({
        name: "QueryAll",
        params: { emailaddress: this.$route.params.emailaddress, mspid: this.$route.params.mspid }
      });
    },
    async goToAddAsset() {
      console.log(this.$route.params.emailaddress);
      this.$router.push({
        name: "QueryByKey",
        params: { emailaddress: this.$route.params.emailaddress, mspid: this.$route.params.mspid }
      });
    },
    async goToQueryPrivateData() {
      console.log(this.$route.params.emailaddress);
      this.$router.push({
        name: "QueryWithQueryString",
        params: { emailaddress: this.$route.params.emailaddress, mspid: this.$route.params.mspid }
      });
    },
    async goToQueryPublicDetails() {
      console.log(this.$route.params.emailaddress);
      this.$router.push({
        name: "QueryPublicCollection",
        params: { emailaddress: this.$route.params.emailaddress, mspid: this.$route.params.mspid }
      });
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  }
};
</script>
