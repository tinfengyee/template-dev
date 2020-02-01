<template>
  <div class="about">
    <h1 v-demo>This is an about page</h1>
    <deep-menu>
      <template #header>
        <div>
          2
        </div>
      </template>
    </deep-menu>
    <hello></hello>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
  mounted() {
    this.$toast.show('测试一下')
  },
  components: {
    DeepMenu: {
      render: function(createElement) {
        var header = this.$slots.header
        var body = this.$slots.default
        var footer = this.$slots.footer
        return createElement('div', [
          createElement('header', header),
          createElement('main', body),
          createElement('footer', footer)
        ])
      }
    },
    Hello: {
      data: () => ({
        text: 'Hello World!'
      }),
      render() {
        return (
          <div>
            <input type='text' v-model={this.text} />
            {this.text}
          </div>
        )
      }
    }
  }
}
</script>
