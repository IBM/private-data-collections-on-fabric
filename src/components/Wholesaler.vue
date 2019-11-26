<template>
<div class="component-container">
  <h3>Wholesaler</h3>

  <div>
    <div class="component-inner-container reactive-list">
      <center>
        <span v-for="pill in pills">
          <button type="button" class="btn btn-secondary" style="display: block; margin-bottom: 5px;">
            {{ pill.uuid }}
          </button>
          <button type="button" class="btn btn-success" style="display: block; margin-bottom: 5px;" v-on:click="buyPill({{ pill.uuid }}, 'w1')">
            buy with W1
          </button>
          <button type="button" class="btn btn-success" style="display: block; margin-bottom: 5px;" v-on:click="buyPill({{ pill.uuid }}, 'w2')">
            buy with W2
          </button>
        </span>
      </center>
    </div>
  </div>

</div>
</template>

<script>                                                      
import Api from '@/apis/Api'
import { serverBus } from '@/main'

export default {
  name: 'Wholesaler',
  props: {
  },
  components: {
  },
  data: () => ({
    pills: []
  }),
  created () {
    serverBus.$on('pillGenerated', (flag) => {
      this.pills = getGeneratedPills()
      console.log("Pills Updated")
    })
  },
  mounted () {
  },
  methods: {

    async getGeneratedPills () {
      const apiResponse = await Api.getGeneratedPills()
      return apiResponse.data.response
    },

    async buyPill (pillUUID, wholesaler) {
      const apiResponse = await Api.buyPillByWholesaler(pillUUID, wholesaler)
      serverBus.$emit('pillPurchased', true)
    }

  }
}

</script>                                                                  
                                                                            
<!-- Add "scoped" attribute to limit CSS to this component only -->          
<style scoped>                           

.component-container {
  position: absolute;
  left: 50vw;
  top: 0;
}

</style>
