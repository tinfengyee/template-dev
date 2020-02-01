import demo from './demo'

const install = function(Vue, options) {
  Vue.directive('demo', demo)
  console.dir(Vue)
  console.log(options)
}
if (window && window.Vue) {
  // eslint-disable-next-line
  Vue.use(install)
}

export default { install }
