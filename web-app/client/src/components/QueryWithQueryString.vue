<template>
  <div class="posts">
            <button v-on:click="goHome()">Home</button>

    <h1>Query Drug Private Details Collection</h1>
    
    <form v-on:submit="queryByQueryString">
      <input type="text" v-model="queryString.key" placeholder="query by Key" />
      <br />
      <input type="submit" value="Query by Key" />
 
    </form>
    <br />

    <br />

    <!-- <button v-on:click="queryByQueryString()">Query the world State</button> -->

    <br />
    <br />
    <br />
     <span v-if="queryResponse">
        <b>{{ queryResponse }}</b>
      </span>
    <br />
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
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
      queryString: {
        data: ""
      },
      queryResponse: null,
      response: null
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
    async queryByQueryString() {
      this.response = null;
      this.queryResponse = null;
      this.runSpinner();

      const apiResponse = await PostsService.queryWithQueryString(this.$route.params.emailaddress,
        this.queryString.key,
        this.$route.params.mspid
      );
      console.log(apiResponse);
      this.queryResponse = apiResponse.data;

      console.log("query by object type called");
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
        params: { emailaddress: this.$route.params.emailaddress, mspid: this.$route.params.mspid }
      });
    },
  }
};
</script>
