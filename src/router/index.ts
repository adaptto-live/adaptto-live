import { createRouter, createWebHashHistory } from 'vue-router'
import AllTalksView from '@/views/AllTalksView.vue'
import LoginView from '@/views/LoginView.vue'
import TalkView from '@/views/TalkView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NoCurrentTalkView from '@/views/NoCurrentTalkView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import TalkQAView from '@/views/TalkQAView.vue'
import { useAuthenticationStore } from '@/stores/authentication'
import { useCurrentTalkStore } from '@/stores/currentTalk'
import LoginCodeManagementViewVue from '@/views/admin/LoginCodeManagementViewVue.vue'
import UserManagementViewVue from '@/views/admin/UserManagementView.vue'
import TalkRatingsViewVue from '@/views/admin/TalkRatingsView.vue'
import StatisticsViewVue from '@/views/admin/StatisticsView.vue'
import ShutdownPage from '@/views/ShutdownPage.vue'

const shutdownPage = (import.meta.env.VITE_SHUTDOWN_PAGE == 'true')

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/login/:code',
      name: 'loginWithCode',
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
      path: '/admin/loginCodes',
      name: 'admin-loginCodes',
      component: LoginCodeManagementViewVue
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
      path: '/qa',
      name: 'qa',
      component: TalkQAView,
      meta: {
        noHeader: true
      }
    },
    {
      path: '/shutdown',
      name: 'shutdown',
      component: ShutdownPage,
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
  if (shutdownPage) {
    if (to.name != 'shutdown') {
      next({ path: '/shutdown' })
    }
    else {
      next()
    }
  }
  else {
    const authenticationStore = useAuthenticationStore()
    if ((to.name != 'login' && to.name != 'loginWithCode') && !authenticationStore.isAuthenticated) {
      next({ path: '/login' })
    }
    else if ((to.name == 'login' || to.name == 'shutdown') && authenticationStore.isAuthenticated) {
      next({ path: '/' })
    }
    else {
      next()
    }
  }
})

export default router
