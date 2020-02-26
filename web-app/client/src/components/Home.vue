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
import { EventBus } from './../main';

export default {
  name: "response",
  props: ["emailaddress", "apiresponse, mspid"],
  data() {
    return {
      loginData: {},
      loginReponse: {
        data: ""
      },
    };
  },
  components: {
    VueInstantLoadingSpinner,
  },
  methods: {
    async validateUser() {
      await this.runSpinner();
      if (!this.loginData.email || !this.loginData.pass) {
        let response = "You need to fill out both an email and a password";
        this.loginReponse.data = response;
        await this.hideSpinner();
      } else {
        this.loginData.mspid = 'patientmsp'
        const apiResponse = await PostsService.validateUser(
          this.loginData.email,
          this.loginData.pass,
          this.loginData.mspid
        );
        console.log(apiResponse.data)
        if (apiResponse.data.error || apiResponse.error) {
          console.log('fffsdfsdfd')
          this.loginReponse.data = apiResponse.data.error;
        } else {
          this.$router.push({ name: 'CastBallot', params: { emailaddress: apiResponse.data.email, mspid: apiResponse.data.mspid,
            apiresponse: apiResponse.data}});
        }
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
