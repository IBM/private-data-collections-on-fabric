import Api from '@/services/api'

export default {
  castBallot(electionId, voterId, picked) {
    return Api().post('castBallot', {       
      electionId: electionId,
      voterId: voterId,
      picked: picked
    })
  },
  queryAll(emailaddress) {
    return Api().post('queryAll',{
      emailaddress: emailaddress
    })
  },
  queryByObjectType() {
    return Api().get('queryByObjectType')
  },
  queryWithQueryString(email, queryString) {
    return Api().post('queryWithQueryString', {
      email,
      queryString
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
  queryByKey(email, drugNumber, drugName, activeIngredients, dosableForm, owner, price) {
    return Api().post('queryByKey', {
      email,
      drugName,
      drugNumber,
      activeIngredients,
      dosableForm,
      owner,
      price
    }) 
  },
  getCurrentStanding() {
    return Api().get('getCurrentStanding')
  },
  getCurrentUser() {
    return Api().get('getCurrentUser')
  }
}