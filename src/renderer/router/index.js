import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'control',
      component: require('@/components/control').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
