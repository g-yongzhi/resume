const auth = require('../../utils/auth')
const app = getApp()

Page({
  data: {
    isLogin: false,
    userInfo: {},
    showSheet: false,
    menus: [
      { name: '我的评价', icon: 'star', path: '/pages/review/index' },
      { name: '旅游账单', icon: 'wallet', path: '/pages/bill/index' },
      { name: '会员中心', icon: 'sparkles', path: '/pages/member/index' },
      { name: '攻略论坛', icon: 'message-circle', path: '/pages/forum/index', tab: true },
      { name: '花期地图', icon: 'map', path: '/pages/map/index' }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    this.refreshUser()
  },

  refreshUser() {
    const user = auth.getCurrentUser()
    if (user) {
      this.setData({
        isLogin: true,
        userInfo: {
          nickName: user.nickname || user.username,
          avatar: user.avatar || '/assets/img/wuhan-sakura.jpg',
          level: '花期旅人'
        }
      })
      app.globalData.userInfo = this.data.userInfo
    } else {
      this.setData({
        isLogin: false,
        userInfo: {
          nickName: '未登录',
          avatar: '/assets/img/wuhan-sakura.jpg',
          level: '点击登录，开启花期旅程'
        }
      })
    }
  },

  goPage(e) {
    const path = e.currentTarget.dataset.path
    if (e.currentTarget.dataset.tab) {
      wx.switchTab({ url: path })
    } else {
      wx.navigateTo({ url: path })
    }
  },

  // ==================== 头像 ====================

  onAvatarTap() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    this.showAvatarSheet()
  },

  showAvatarSheet() {
    this.setData({ showSheet: true })
  },

  closeSheet() {
    this.setData({ showSheet: false })
  },

  // 查看大图
  previewAvatar() {
    const url = this.data.userInfo.avatar
    // base64 或远程 url 均可预览
    wx.previewImage({ urls: [url], current: url })
  },

  // 从相册选择
  chooseFromAlbum() {
    this.closeSheet()
    this.pickImage(['album'])
  },

  // 拍照
  takePhoto() {
    this.closeSheet()
    this.pickImage(['camera'])
  },

  pickImage(sourceType) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType,
      success: (res) => {
        wx.showLoading({ title: '处理中...' })
        const tempPath = res.tempFilePaths[0]
        // 读为 base64 永久存储（不依赖临时文件路径）
        try {
          const fs = wx.getFileSystemManager()
          const base64 = fs.readFileSync(tempPath, 'base64')
          const dataUrl = 'data:image/jpeg;base64,' + base64
          auth.updateProfile({ avatar: dataUrl })
        } catch (e) {
          // fallback: 存临时路径
          auth.updateProfile({ avatar: tempPath })
        }
        wx.hideLoading()
        wx.showToast({ title: '头像已更新', icon: 'success' })
        this.refreshUser()
      }
    })
  },

  // ==================== 个人中心 ====================

  onProfileAction() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    wx.showActionSheet({
      itemList: ['修改头像', '修改昵称', '退出登录'],
      success: (res) => {
        if (res.tapIndex === 0) this.showAvatarSheet()
        else if (res.tapIndex === 1) this.changeNickname()
        else if (res.tapIndex === 2) this.doLogout()
      }
    })
  },

  changeNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '输入新昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          const result = auth.updateProfile({ nickname: res.content.trim() })
          if (result.ok) {
            wx.showToast({ title: '修改成功', icon: 'success' })
            this.refreshUser()
          }
        }
      }
    })
  },

  doLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#e57373',
      success: (res) => {
        if (res.confirm) {
          auth.logout()
          this.refreshUser()
          wx.showToast({ title: '已退出', icon: 'none' })
        }
      }
    })
  }
})
