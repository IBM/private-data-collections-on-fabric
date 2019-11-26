import axios from 'axios'

const fetch = () => {
  return axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
      'accept': 'application/json'
    }
  })
}

export default {
  generatePill () {
    return fetch().post('/generatePill')
  },

  getGeneratedPills () {
    return fetch().get('/getPills')
  },

  buyPillByWholesaler (pillUUID, wholesaler) {
    return fetch().post('/buyPill', {
      "uuid": pillUUID,
      "wholesaler": wholesaler
    })
  },

  getBoughtPillsByPharmacy () {
    return fetch().get('/getPharmacyPills')
  },

  getBoughtPillsByPatient () {
    return fetch().get('/getPatientPills')
  }
}
