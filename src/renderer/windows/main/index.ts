import '/@/assets/google.font.css'
import locales from '/@/assets/locales'
import { I18N_KEY, ROUTER_KEY } from '/@/constant'
import provideElectron from '/@/providers/provideElectron'
import provideServiceProxy from '/@/providers/provideServiceProxy'
import provideVueI18n from '/@/providers/provideVueI18n'
import provideVuexStore from '/@/providers/provideVuexStore'
import SkinView from '/@/skin/SkinView.vue'
import TextComponent from '/@/TextComponent'
import Vue from 'vue'
import VueCompositionApi, { createApp, h, provide } from '@vue/composition-api'
import VueI18n from 'vue-i18n'
import VueObserveVisibility from 'vue-observe-visibility'
import Router from 'vue-router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/es5/util/colors'
import Vuex from 'vuex'
import './directives'
import components from './components'
import CurseforgeIcon from './components/CurseforgeIcon.vue'
import ZipFileIcon from './components/ZipFileIcon.vue'
import JarFileIcon from './components/JarFileIcon.vue'
import PackageFileIcon from './components/PackageFileIcon.vue'
import ForgeIcon from './components/ForgeIcon.vue'
import FabricIcon from './components/FabricIcon.vue'
import MainWindow from './MainWindow.vue'
import router from './router'

Vue.use(VueCompositionApi)

function configApp(app: ReturnType<typeof createApp>) {
  app.config.productionTip = false
  app.use(VueI18n)
  app.use(Vuex)
  app.use(Vuetify, {
    icons: {
      curseforge: {
        component: CurseforgeIcon,
      },
      zip: {
        component: ZipFileIcon,
      },
      jar: {
        component: JarFileIcon,
      },
      package: {
        component: PackageFileIcon,
      },
      forge: {
        component: ForgeIcon,
      },
      fabric: {
        component: FabricIcon,
      },
    },
    theme: {
      primary: '#5658DD',
      // secondary: colors.lime,
      accent: '#151719',
    },
  })
  app.use(Router)
  app.use(VueObserveVisibility)
  app.component('TextComponent', TextComponent)
  app.component('SkinView', SkinView)
  for (const [key, value] of Object.entries(components)) {
    app.component(key, value)
  }
}

function startApp() {
  configApp(Vue as any)
  const i18n = provideVueI18n('en', locales)

  // to prevent the universal drop activated on self element dragging
  document.addEventListener('dragstart', (e) => {
    if (e.dataTransfer?.effectAllowed === 'uninitialized') {
      e.dataTransfer!.effectAllowed = 'none'
    }
  })

  const app = createApp({
    router,
    i18n,
    setup() {
      provideElectron()
      provideServiceProxy()
      const store = provideVuexStore()
      provide(I18N_KEY, i18n)
      store.watch((state) => state.base.locale, (newValue: string, oldValue: string) => {
        console.log(`Locale changed ${oldValue} -> ${newValue}`)
        i18n.locale = newValue
      })
      provide(ROUTER_KEY, new Proxy(router, {
        get(target, key) {
          const prop = Reflect.get(target, key)
          if (prop instanceof Function) {
            return (prop as Function).bind(target)
          }
          return prop
        },
      }))
      return () => h(MainWindow)
    },
  })
  app.mount('#app')
}

startApp()
