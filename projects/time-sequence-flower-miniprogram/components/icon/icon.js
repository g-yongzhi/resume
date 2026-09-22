Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 40 }
  },
  data: { src: '' },
  observers: {
    name(n) {
      if (n) this.setData({ src: `/assets/icons/${n}.svg` })
    }
  },
  lifetimes: {
    attached() {
      const { name } = this.properties
      if (name) this.setData({ src: `/assets/icons/${name}.svg` })
    }
  }
})
