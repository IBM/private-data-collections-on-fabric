<template>
  <div class="posts">
    <button v-on:click="goHome()">Home</button>

    <h1>Add Drug</h1>
    <form v-on:submit="queryByKey">
      <input type="text" v-model="drugNumber.key" placeholder="Enter drug number" />
      <br>
      <input type="text" v-model="drugName.key" placeholder="Enter drug name" />
      <br>
      <input type="text" v-model="activeIngredients.key" placeholder="Enter active ingredients" />
      <br>
      <input type="text" v-model="dosableForm.key" placeholder="Enter dosable form" />
      <br>
      <input type="text" v-model="owner.key" placeholder="Enter owner" />
      <br>
      <input type="text" v-model="price.key" placeholder="Enter price" />
      <br>
      <br>
      <input type="submit" value="Add Drug" />
      <br />
      <br />
      <span v-if="drugDataResponse">
        <b>{{ drugDataResponse.data }}</b>
      </span>
      <br />
    </form>

    <br />
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import PostsService from "@/services/apiService";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "response",
  props: ["emailaddress, mspid"],
  data() {
    return {
      drugNumber: {
        data: ""
      },
      drugName: {
        data: ""
      },
      activeIngredients: {
        data: ""
      },
      dosableForm: {
        data: ""
      },
      owner: {
        data: ""
      },
      price: {
        data: ""
      },
      drugDataResponse: {
        data: ""
      },
    };
  },
  name: "app",
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
    async queryByKey() {
      this.runSpinner();
      if (!this.drugNumber.key || !this.drugName.key || !this.activeIngredients.key || !this.dosableForm.key || !this.owner.key || !this.price.key) {
        console.log("inputs are not all filled ");
        let response = "Please fill out all fields for the drug.";
        this.drugDataResponse.data = response;
        this.hideSpinner();
      } else {
        let drugData = {};
        drugData.drugNumber = this.drugNumber.key;
        drugData.drugName = this.drugName.key;
        drugData.activeIngredients = this.activeIngredients.key;
        drugData.dosableForm = this.dosableForm.key;
        drugData.owner = this.owner.key;
        drugData.price = this.price.key;
        this.runSpinner();
        const apiResponse = await PostsService.queryByKey(this.$route.params.emailaddress, this.drugNumber.key, this.drugName.key, 
          this.activeIngredients.key, this.dosableForm.key, this.owner.key, this.price.key);
        console.log(apiResponse);
        this.drugDataResponse.data = apiResponse;
        this.hideSpinner();
      }
    },
    async goHome() {
      console.log(this.$route.params.emailaddress);
      this.$router.push({
        name: "CastBallot",
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
