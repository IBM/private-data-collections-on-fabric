<template>
  <div id= 'currentUser' class="User">
    <h1>Healthcare Network</h1>
    <h3>Log in with your healthcare account</h3>


    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
import { EventBus } from './../main';
// import { EventBus } from './event-bus.js';


export default {
  name: "response",
  data() {
    return {
      loginData: {},
      loginReponse: {
        data: ""
      },
      validatedUserEmail: '',
      validatedUserMSP: ""
    };
  },
  methods: {
    async validateUser() {
      await this.runSpinner();

      if (!this.loginData.email || !this.loginData.pass) {
        console.log("!thisemail");
        let response = "You need to fill out both an email and a password";
        this.loginReponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.validateUser(
          this.loginData.email,
          this.loginData.pass
        );

        if (apiResponse.data.error || apiResponse.error) {
          console.log(apiResponse.data.error);
          this.loginReponse = apiResponse.data.error;
        } else {
          this.validatedUserEmail = apiResponse.data.email;
          console.log(this.validatedUserEmail)
          this.validatedUserMSP = apiResponse.data.mspid;
          let currUser = await this.getCurrentUser(this.validatedUserEmail);
          console.log('currUser')
          console.log(currUser)
          // await this.getCurrentUser(this.validatedUserEmail);
          this.$router.push("castBallot");
        }
        this.validatedUserEmail = apiResponse.data.email;
        this.validatedUserMSP = apiResponse.data.mspid;
        console.log(this.validatedUserEmail);
        this.loginReponse = apiResponse;
        await this.hideSpinner();
      }
    },
    async getCurrentUser(currentUser) {
      console.log(`currentUser in Home.vue: ${currentUser}`);
      // this.$eventHub.$emit('getUser', currentUser);
      EventBus.$emit('getUser', currentUser);
      return currentUser;
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
