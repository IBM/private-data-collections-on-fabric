import Api from '@/services/api'

export default {
  castBallot(electionId, voterId, picked) {
    return Api().post('castBallot', {       
      electionId: electionId,
      voterId: voterId,
      picked: picked
    })
  },
  queryAll(email, mspid) {
    return Api().post('queryAll',{
      email,
      mspid
    })
  },
  queryByObjectType() {
    return Api().get('queryByObjectType')
  },
  queryWithQueryString(email, queryString, mspid) {
    return Api().post('queryWithQueryString', {
      email,
      queryString,
      mspid
    }) 
  },
  queryPublicCollection(email, queryString, mspid) {
    return Api().post('queryPublicCollection', {
      email,
      queryString,
      mspid
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
  validateUser(email, pass, mspid) {
    return Api().post('validateUser', {
      email: email,
      pass: pass,
      mspid: mspid
    }) 
  },
  queryByKey(email, drugNumber, drugName, activeIngredients, dosableForm, owner, price, mspid) {
    return Api().post('queryByKey', {
      email,
      drugName,
      drugNumber,
      activeIngredients,
      dosableForm,
      owner,
      price,
      mspid
    }) 
  },
  getCurrentStanding() {
    return Api().get('getCurrentStanding')
  }
}