<template>
<div class="component-container">
  <h3>Pharmacy</h3>

  <div>
    <div class="component-inner-container reactive-list">
      <center>
        <button type="button" class="btn btn-primary" style="display: block; margin-bottom: 5px;" v-for="pill in pills">
          {{ pill.uuid }} - {{ pill.wholesaler }}
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
  name: 'Pharmacy',
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
      const apiResponse = await Api.getBoughtPillsByPharmacy()
      return apiResponse.data.response
    }

  }
}

</script>                                                                  
                                                                            
<!-- Add "scoped" attribute to limit CSS to this component only -->          
<style scoped>                           

.component-container {
  position: absolute;
  left: 0;
  top: 50vh;
}

</style>
