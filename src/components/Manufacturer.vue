<template>
  <div class="component-container expand-panel">
    <h3>Manufacturer</h3>

    <div class="top-div" v-if="isLoggedIn">

      <div class="component-inner-container">
        <div class="form-row">
          <div class="col">
            <button type="button" class="btn btn-success" v-on:click="generatePill()">Generate Pill</button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import Api from '@/apis/Api'
import { serverBus } from '@/main'

export default {
  name: 'Manufacturer',
  components: {
  },
  data: () => ({
  }),
  created () {
  },
  mounted () {
  },
  methods: {

    async generatePill () {
      const apiResponse = await Api.generatePill()
      serverBus.$emit('pillGenerated', true)
    }
  }
}

</script>                                                                  
                                                                            
<!-- Add "scoped" attribute to limit CSS to this component only -->          
<style scoped>                           

.component-container {
  position: absolute;
  left: 0;
  top: 0;
}

</style>
