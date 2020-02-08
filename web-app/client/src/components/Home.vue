<template>
  <div class="posts">
    <h1>Healthcare Network</h1>
    <h3>Log in with your healthcare account</h3>

    <form v-on:submit="validateUser">
      <p>Email</p>
      <input type="text" v-model="loginData.email" placeholder="Enter email" />
      <p>Password</p>
      <input type="text" v-model="loginData.pass" placeholder="Enter password" />
      <br />
      <br />
      <input type="submit" value="Login" />
      <br />
      <br />
      <span v-if="loginReponse">
        <b>{{ loginReponse.data }}</b>
      </span>
      <!-- <span v-if="validatedUserEmail"> -->
      <!-- <cast-ballot v-bind:validatedUserEmail="validatedUserEmail"></cast-ballot> -->
      <!-- </span> -->
      <!-- <span v-if="validatedUserEmail"> -->
      <!-- <cast-ballot v-bind:validatedUserEmail="validatedUserEmail"></cast-ballot> -->
      <!-- </span> -->
      <!-- <cast-ballot validatedUserEmail=validatedUserEmail>
        <span >
      
        </span>
      </cast-ballot> -->
      <span v-if="validatedUserEmail">
        Logged in as:
        <b>{{ validatedUserEmail }}</b>
      </span> 

      
      
      <br />
    </form>

    <br />
    <h3>Don't have a healthcare account?</h3>
    <h3>
      <router-link to="/RegisterUser">Register Here</router-link>&nbsp;
    </h3>

    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";
import CastBallot from "./CastBallot.vue";

export default {
  name: "response",
  data() {
    return {
      loginData: {},
      loginReponse: {
        data: ""
      },
      validatedUserEmail: "",
      validatedUserMSP: ""
    };
  },
  components: {
    VueInstantLoadingSpinner,
    CastBallot
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
        this.validatedUserMSP = apiResponse.data.mspid;
          this.$router.push("castBallot");
        }
        this.validatedUserEmail = apiResponse.data.email;
        this.validatedUserMSP = apiResponse.data.mspid;
        console.log(this.validatedUserEmail);
        this.loginReponse = apiResponse;
        await this.hideSpinner();
      }
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
