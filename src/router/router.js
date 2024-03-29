import Vue from 'vue'
import VueRouter from 'vue-router'
import eventBus from '@/utils/events/eventBus'
import { getCurrentUser, isUserAdmin } from '@/firebase/firebase'

Vue.use(VueRouter)

const routes = [

  {
    path: '/',
    redirect: '/#',
  },

  {
    path: '/#',
    name: 'home',
    component: () => import('@/views/pages/Home.vue'),
    meta: {
      layout: 'content',
    },
  },

  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/pages/About.vue'),
    meta: {
      layout: 'content',
    },
  },

  {
    path: '/create-proposal',
    name: 'create-proposal',
    component: () => import('@/views/proposals/CreateProposal.vue'),
    meta: {
      layout: 'content',
      requiresAdmin: true,
    },
    beforeEnter: async (to, from, next) => {
      try {
        const currUser = await getCurrentUser()
        if (currUser && isUserAdmin()) {
          next()
        }
      } catch (err) {
        if (err) {
          next({
            name: 'home',
          })
        }
      }
    },
  },

  {
    path: '/proposal/:proposalID',
    name: 'view-proposal',
    component: () => import('@/views/proposals/ViewProposal.vue'),
    meta: {
      layout: 'content',
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      eventBus.$emit('setLoginSendToPath', 'view-proposal')
      eventBus.$emit('setCurrProposal', to.params.proposalID)
      next()

      // Require Login to View Proposal
      // try {
      //   const currUser = await getCurrentUser()
      //   eventBus.$emit('setLoginSendToPath', 'view-proposal')
      //   eventBus.$emit('setCurrProposal', to.params.proposalID)
      //   if (currUser) {
      //     next()
      //   } else {
      //     next({
      //       name: 'login',
      //     })
      //   }
      // } catch (err) {
      //   if (err) {
      //     next({
      //       name: 'login',
      //     })
      //   }
      // }
    },
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/pages/Login.vue'),
    meta: {
      layout: 'content',
    },
  },

  {
    path: '/error-404',
    name: 'error-404',
    component: () => import('@/views/pages/Error.vue'),
    meta: {
      layout: 'blank',
    },
    beforeEnter: async (to, from, next) => {
      next()
    },
  },

  {
    path: '*',
    redirect: 'error-404',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
