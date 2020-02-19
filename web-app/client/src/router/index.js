import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import CastBallot from '@/components/CastBallot'
import QueryAll from '@/components/QueryAll'
import QueryWithQueryString from '@/components/QueryWithQueryString'
import QueryByKey from '@/components/QueryByKey'
import GetCurrentStanding from '@/components/GetCurrentStanding'
import RegisterUser from '@/components/RegisterUser'
import CurrentUser from '@/components/CurrentUser'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      props: true
    },
    {
      path: '/registerUser',
      name: 'RegisterUser',
      component: RegisterUser,
      props: true
    },
    {
      path: '/castBallot',
      name: 'CastBallot',
      component: CastBallot,
      props: true
    },
    {
      path: '/currentUser',
      name: 'CurrentUser',
      component: CurrentUser,
      props: true
    },
    {
      path: '/queryAll',
      name: 'QueryAll',
      component: QueryAll,
      props: true
    },
    {
      path: '/queryWithQueryString',
      name: 'QueryWithQueryString',
      component: QueryWithQueryString,
      props: true
    },
    {
      path: '/queryByKey',
      name: 'QueryByKey',
      component: QueryByKey,
      props: true
    },
    {
      path: '/getCurrentStanding',
      name: 'GetCurrentStanding',
      component: GetCurrentStanding,
      props: true
    }
  ]
})
