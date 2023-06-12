import { createRouter, createWebHistory } from 'vue-router'
import AllTalksView from '@/views/AllTalksView.vue'
import LoginView from '@/views/LoginView.vue'
import TalkView from '@/views/TalkView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NoCurrentTalkView from '@/views/NoCurrentTalkView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import SpeakerQAView from '@/views/SpeakerQAView.vue'
import { useAuthenticationStore } from '@/stores/authentication'
import { useCurrentTalkStore } from '@/stores/currentTalk'
import UserManagementViewVue from '@/views/admin/UserManagementView.vue'
import TalkRatingsViewVue from '@/views/admin/TalkRatingsView.vue'
import StatisticsViewVue from '@/views/admin/StatisticsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      redirect: () => {
        const currentTalkId = useCurrentTalkStore().talkId
        if (currentTalkId) {
          return { path: `/talk/${currentTalkId}` }
        }
        else {
          return { name: 'noCurrentTalk' }
        }
      }
    },
    {
      path: '/talk/:talk',
      name: 'talk',
      component: TalkView
    },
    {
      path: '/all-talks',
      name: 'all-talks',
      component: AllTalksView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/noCurrentTalk',
      name: 'noCurrentTalk',
      component: NoCurrentTalkView
    },
    {
      path: '/admin/userManagement',
      name: 'admin-userManagement',
      component: UserManagementViewVue
    },
    {
      path: '/admin/talkRatings',
      name: 'admin-talkRatings',
      component: TalkRatingsViewVue
    },
    {
      path: '/admin/statistics',
      name: 'admin-statistics',
      component: StatisticsViewVue
    },
    {
      path: '/speaker',
      name: 'speaker',
      component: SpeakerQAView,
      meta: {
        noHeader: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: NotFoundView
    }
  ]
})

router.beforeEach(function (to, from, next) {
  const authenticationStore = useAuthenticationStore()
  if ((to.name != 'login') && !authenticationStore.isAuthenticated) {
    next({ path: '/login' })
  }
  else if ((to.name == 'login') && authenticationStore.isAuthenticated) {
    next({ path: '/' })
  }
  else {
    next()
  }
})

export default router
