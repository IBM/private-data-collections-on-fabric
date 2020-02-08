import Api from '@/services/api'

export default {
  castBallot(electionId, voterId, picked) {
    return Api().post('castBallot', {       
      electionId: electionId,
      voterId: voterId,
      picked: picked
    })
  },
  queryAll() {
    return Api().get('queryAll')
  },
  queryByObjectType() {
    return Api().get('queryByObjectType')
  },
  queryWithQueryString(selected) {
    return Api().post('queryWithQueryString', {
      selected: selected
    }) 
  },
  RegisterUser(email, pass, confirmPass, lastName, mspid) {
    return Api().post('registerUser', {
      email: email,
      pass: pass,
      confirmPass: confirmPass,
      lastName: lastName,
      mspid: mspid
    }) 
  },
  validateUser(email, pass) {
    return Api().post('validateUser', {
      email: email,
      pass: pass
    }) 
  },
  queryByKey(key) {
    return Api().post('queryByKey', {
      key: key
    }) 
  },
  getCurrentStanding() {
    return Api().get('getCurrentStanding')
  }
}