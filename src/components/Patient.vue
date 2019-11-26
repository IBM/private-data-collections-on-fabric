<template>
<div class="component-container">
  <h3>Patient</h3>

  <div>
    <div class="component-inner-container reactive-list">
      <center>
        <button type="button" class="btn btn-primary" style="display: block; margin-bottom: 5px;" v-for="pill in pills">
          {{ pill.uuid }} - {{ pill.wholesaler }} - {{ pill.cost }}
        </button>
      </center>
    </div>
  </div>
</div>
</template>

<script>                                                      
import Api from '@/apis/Api'
import { serverBus } from '@/main'

export default {
  name: 'Patient',
  components: {
  },
  data: () => ({
    pills: []
  }),
  created () {
    serverBus.$on('pillPurchased', (flag) => {
      this.pills = getBoughtPills()
    })
  },
  mounted () {
  },
  methods: {

    async getBoughtPills () {
      const apiResponse = await Api.getBoughtPillsByPatient()
      return apiResponse.data.response
    }

  }
}

</script>                                                                 
                                                                            
<!-- Add "scoped" attribute to limit CSS to this component only -->          
<style scoped>                           

.component-container {
  position: absolute;
  left: 50vw;
  top: 50vh;
}

</style>
