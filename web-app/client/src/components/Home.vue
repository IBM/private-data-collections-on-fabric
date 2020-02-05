<template>
  <div class="posts">
    <h1>Healthcare Network</h1>
    <h3>Log in with your healthcare account</h3>
    <!--span><b>{{ response }}</b></span><br /-->
    <form v-on:submit="validateUser">
      <p>Email</p><input type="text" v-model="loginData.email" placeholder="Enter email">
      <p>Password</p><input type="text" v-model="loginData.pass" placeholder="Enter password">
      <br>
      <br>

      <input type="submit" value="Login">
      <br>
      <br>
      <span v-if="loginReponse">
        <b>{{ loginReponse.data }}</b>
      </span>
      <br>
    </form>

    <br>
    <h3>Don't have a healthcare account? Sign up below</h3>
    <form v-on:submit="registerUser">
      <input type="text" v-model="registerData.email" placeholder="Enter email address">
      <br>
      <input type="text" v-model="registerData.password" placeholder="Enter password">
      <br>
      <input type="text" v-model="registerData.confirmPass" placeholder="Confirm password">
      <br>
      <input type="text" v-model="registerData.lastName" placeholder="Enter last name">
      <br>
      <select v-model="registerData.mspid" name="mspid">
        <option value="patient">Patient</option>
        <option value="manufacturer">Manufacturer</option>
        <option value="pharmacy">Pharmacy</option>
        <option value="wholesaler1">Wholesaler1</option>
        <option value="wholesaler2">Wholesaler2</option>
      </select>
      <br>
      <input type="submit" value="Sign up">
    </form>
    <br>
    <span v-if="registerReponse">
      <b>{{ registerReponse.data }}</b>
    </span>
    <br>
    <vue-instant-loading-spinner id='loader' ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "response",
  data() {
    return {
      loginData: {},
      registerData: {},
      registerReponse: {
        data: ""
      },
      loginReponse: {
        data: ""
      }
    };
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async registerUser() {

      await this.runSpinner();
      const apiResponse = await PostsService.registerUser(
        this.registerData.email,
        this.registerData.pass,
        this.registerData.confirmPass,
        this.registerData.lastName,
        this.registerData.mspid        
      );

      console.log(apiResponse);
      this.registerReponse = apiResponse;
      await this.hideSpinner();
    },

    async validateUser() {
      await this.runSpinner();

      if (!this.loginData.email) {
        console.log("!thisemail");
        let response = 'Please enter a email';
        this.loginReponse.data = response;
        await this.hideSpinner();
      } else {
        const apiResponse = await PostsService.validateUser(
          this.loginData.email
        );
        console.log("apiResponse");
        console.log(apiResponse.data);

        if (apiResponse.data.error) {
          // console.log(apiResponse);sdf
          console.log(apiResponse.data.error);
          this.loginReponse = apiResponse.data.error;
        } else {
          this.$router.push("castBallot");
        }

        console.log(apiResponse);
        this.loginReponse = apiResponse;
        // this.$router.push('castBallot')
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
