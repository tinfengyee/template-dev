const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'
function resolve(dir) {
  return path.join(__dirname, dir)
}

/* const cdn = {
  dev: {
    css: ['https://cdn.staticfile.org/element-ui/2.13.0/theme-chalk/index.css']
  },
  pro: {
    css: [
      'https://cdn.staticfile.org/quill/2.0.0-dev.3/quill.core.min.css',
      'https://cdn.staticfile.org/viewerjs/1.3.7/viewer.min.css',
      'https://cdn.staticfile.org/element-ui/2.13.0/theme-chalk/index.css'
    ],
    js: [
      'https://cdn.staticfile.org/vue/2.6.10/vue.min.js',
      'https://cdn.staticfile.org/vue-router/3.1.3/vue-router.min.js',
      'https://cdn.staticfile.org/vuex/3.1.1/vuex.min.js',
      'https://cdn.staticfile.org/clipboard.js/2.0.4/clipboard.min.js',
      'https://cdn.staticfile.org/axios/0.19.0-beta.1/axios.min.js',
      'https://cdn.staticfile.org/nprogress/0.2.0/nprogress.min.js',
      'https://cdn.staticfile.org/Mock.js/1.0.1-beta3/mock-min.js',
      'https://cdn.staticfile.org/quill/2.0.0-dev.3/quill.min.js',
      'https://cdn.staticfile.org/element-ui/2.13.0/index.js',
      'https://cdn.staticfile.org/viewerjs/1.3.7/viewer.min.js',
      'https://cdn.staticfile.org/echarts/4.4.0-rc.1/echarts.min.js',
      'https://cdn.jsdelivr.net/npm/vue-echarts@4.0.2'
    ]
  }
} */

module.exports = {
  publicPath: '/',
  lintOnSave: true,
  productionSourceMap: false,
  css: {
    extract: isProduction,
    sourceMap: false,
    loaderOptions: {
      stylus: {
        import: '~@/assets/css/common.styl'
      }
    }
  },

  devServer: {
    port: 9000,
    open: false,
    compress: false,
    overlay: {
      warnings: false,
      errors: true
    },

    proxy: {
      '/dev': {
        target: 'http://127.0.0.1:7001',

        changeOrigin: true,
        pathRewrite: { '^/dev': '' }
      },
      '/pro': {
        target: 'https://show.cool-admin.com',

        changeOrigin: true,
        pathRewrite: { '^/pro': '/api' }
      }
    }
  },

  chainWebpack: config => {
    // svg
    config.module.rule('svg').uses.clear()

    config.module
      .rule('svg-sprite-loader')
      .test(/.svg$/)
      .exclude.add(/node_modules/)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: '[name]'
      })

    // 去掉元素之间空格
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    // 引入cdn
    // config.plugin('html').tap(args => {
    //   args[0].cdn = cdn[isProduction ? 'pro' : 'dev']
    //   return args
    // })

    config
      // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development', config => config.devtool('cheap-source-map'))

    if (isProduction) {
      config.performance.set('hints', false)

      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-cool',
            test: resolve('src/cool'),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
    }
  },

  // configureWebpack: config => {
  // provide the app's title in webpack's name field, so that
  // it can be accessed in index.html to inject the correct title.
  // if (isProduction) {
  //   config.externals = {
  //     vue: 'Vue',
  //     'vue-router': 'VueRouter',
  //     'element-ui': 'ELEMENT',
  //     vuex: 'Vuex',
  //     axios: 'axios',
  //     mockjs: 'Mock',
  //     nprogress: 'NProgress',
  //     quill: 'Quill',
  //     viewer: 'Viewer',
  //     echarts: 'echarts',
  //     'vue-echarts': 'VueECharts'
  //   }
  // }
  // }
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: 'Vue Front',
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
}
