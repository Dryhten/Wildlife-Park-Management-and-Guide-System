import { API_URLS } from '../../common/config.js';

Page({
  data: {
    isPersonalized: false,
    transportModes: ['步行', '自驾'],
    selectedTransport: '',
    allAnimals: [
      '狮子', '老虎', '熊', '美洲豹', '猎豹', '豹子', '犀牛', '鹿', '羚羊', 
      '长颈鹿', '公牛', '骆驼', '河马', '马', '山羊', '大象', '斑马', 
      '鹦鹉', '孔雀', '老鹰', '金丝雀', '喜鹊', '猫头鹰', '乌鸦', '麻雀',
      '蛇', '蜥蜴', '乌龟', '鳄鱼', '蝎子', '海豚', '企鹅', '鲨鱼', 
      '螃蟹', '水母', '海狮', '海马', '鱿鱼', '海星', '熊猫'
    ],
    filteredAnimals: [],
    selectedAnimals: [],
    searchValue: '',
    showAnimals: false,
    isContentModified: false,
    originalTransport: '',
    originalAnimals: []
  },

  onLoad() {
    this.fetchUserPreference();
  },

  fetchUserPreference() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) return;

    wx.request({
      url: API_URLS.USER_PREFERENCE.GET(),
      data: { openid: userInfo.openid },
      success: (res) => {
        if (res.data.success && res.data.data) {
          const preference = res.data.data;
          const transportMode = preference.transportMode || '';
          const animals = preference.favoriteAnimals ? preference.favoriteAnimals.split(',') : [];
          
          this.setData({
            isPersonalized: preference.isPersonalized || false,
            selectedTransport: transportMode,
            selectedAnimals: animals,
            originalTransport: transportMode,
            originalAnimals: [...animals],
            isContentModified: false
          });
          getApp().globalData.isPersonalized = preference.isPersonalized || false;
        }
      }
    });
  },

  onSwitchChange(e) {
    const isPersonalized = e.detail.value;
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: API_URLS.USER_PREFERENCE.TOGGLE_PERSONALIZED(),
      method: 'POST',
      data: {
        openid: userInfo.openid,
        isPersonalized: isPersonalized
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({ isPersonalized });
          // 更新全局变量
          getApp().globalData.isPersonalized = isPersonalized;
        } else {
          wx.showToast({
            title: res.data.message || '设置失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  checkContentModified() {
    const transportChanged = this.data.selectedTransport !== this.data.originalTransport;
    
    const animalsChanged = 
      this.data.selectedAnimals.length !== this.data.originalAnimals.length ||
      this.data.selectedAnimals.some(animal => !this.data.originalAnimals.includes(animal));

    this.setData({
      isContentModified: transportChanged || animalsChanged
    });
  },

  onTransportChange(e) {
    this.setData({
      selectedTransport: this.data.transportModes[e.detail.value]
    }, () => {
      this.checkContentModified();
    });
  },

  onSearchFocus() {
    this.setData({
      showAnimals: true,
      filteredAnimals: this.data.allAnimals
    });
  },

  onSearchBlur() {
    setTimeout(() => {
      this.setData({
        showAnimals: false
      });
    }, 300);
  },

  onSearchInput(e) {
    const searchValue = e.detail.value.toLowerCase();
    const filtered = this.data.allAnimals.filter(animal => 
      animal.toLowerCase().includes(searchValue)
    );
    this.setData({
      searchValue,
      filteredAnimals: filtered,
      showAnimals: true
    });
  },

  selectAnimal(e) {
    const { animal } = e.currentTarget.dataset;
    let selectedAnimals = [...this.data.selectedAnimals];
    
    const index = selectedAnimals.findIndex(item => item === animal);
    if (index > -1) {
      selectedAnimals.splice(index, 1);
    } else {
      selectedAnimals.push(animal);
    }
    
    this.setData({
      selectedAnimals,
      searchValue: '',
      showAnimals: false
    }, () => {
      this.checkContentModified();
    });
  },

  savePreference() {
    if (!this.data.selectedTransport) {
      wx.showToast({
        title: '请选择交通方式',
        icon: 'none'
      });
      return;
    }

    if (this.data.selectedAnimals.length === 0) {
      wx.showToast({
        title: '请至少选择一种动物',
        icon: 'none'
      });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: API_URLS.USER_PREFERENCE.SAVE(),
      method: 'POST',
      data: {
        openid: userInfo.openid,
        transportMode: this.data.selectedTransport,
        favoriteAnimals: this.data.selectedAnimals
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            originalTransport: this.data.selectedTransport,
            originalAnimals: [...this.data.selectedAnimals],
            isContentModified: false
          });
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '保存失败',
            icon: 'none'
          });
        }
      }
    });
  }
}); 