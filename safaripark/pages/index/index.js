const { TICKET_TYPES, ANNUAL_CARD_TYPES } = require('../../common/const.js');
const { API_URLS } = require('../../common/config.js');

Page({
  data: {
    currentCity: '杭州',
    cityIndex: 0,
    cities: ['杭州', '上海', '北京', '广州', '深圳'],
    showCityList: false,
    parkInfo: {
      name: '杭州野生动物世界',
      address: '浙江省杭州市富阳区九龙大道一号',
      hours: '今日营业：9:30 - 16:30'
    },
    backgroundImages: {
      '杭州': 'https://static.vecteezy.com/system/resources/previews/013/074/425/non_2x/flat-exotic-animal-background-free-vector.jpg',
      '上海': 'https://bpic.588ku.com/back_our/20210311/bg/231e8a9671ab4.png',
      '北京': 'https://img.pptjia.com/image/20220825/14326408fd7936620ed8d124280e7dab.png',
      '广州': 'https://pic.nximg.cn/file/20240330/35256178_232429803104_2.jpg',
      '深圳': 'https://bpic.588ku.com/illus_list_pic/22/11/08/c5b562915fafb9e2d04a88c04ba23b4c.jpg'
    },
    currentBackground: 'https://static.vecteezy.com/system/resources/previews/013/074/425/non_2x/flat-exotic-animal-background-free-vector.jpg',
    swiperData: [
      'https://th.bing.com/th/id/R.438928a56a1364ab3bd9ed40ae1010a5?rik=WZKVlZCOTIS3FA&pid=ImgRaw&r=0',
      'https://th.bing.com/th/id/R.c286a1d10a8f4e9c7fce77f448c42eeb?rik=YLpfm%2fNGjY9%2fDg&riu=http%3a%2f%2f3.bp.blogspot.com%2f-n8kX9cPl1Bw%2fUYQOA3L-I7I%2fAAAAAAAAAhQ%2flcmbONya0bo%2fs1600%2fle%C3%A3o_0005.jpg&ehk=vr5W3jRyl%2bIRlaylO%2fw%2biGOqgJ15Ao1uqh2B2q8o71w%3d&risl=&pid=ImgRaw&r=0',
      'https://th.bing.com/th/id/R.599a495864228dd4cb75de84d9968350?rik=GAE%2b5cosmBIVgQ&riu=http%3a%2f%2f4.bp.blogspot.com%2f-KD33uTe8GyE%2fUHB1YPEsrfI%2fAAAAAAAAGv8%2f26jM_2y8rWY%2fs1600%2fThe%2bTiger%2bStrikes%2bAgain%2bWild%2bAnimals239.jpg&ehk=q9wphNhhvUdj1Ocuckh4yzSxncq9%2fJouGnpgcFh2Fqo%3d&risl=&pid=ImgRaw&r=0',
      'https://media.npr.org/assets/img/2022/06/22/gettyimages-1238924365_wide-b1f7435f5e1e69d0b3a32ad364de7204c89cc15e.jpg',
      'https://static.lpnt.fr/images/2019/04/29/18633880lpw-18633909-article-zoo-beauval-animal-jpg_6166393_1250x625.jpg'
    ],
    
    ticketData: TICKET_TYPES,
    annualCardData: ANNUAL_CARD_TYPES,
    tabList: [
      { index: 0, title: '门票' },
      { index: 1, title: '年卡' }
    ],
    tabsId: 0, // 默认选中第一个
    showFloatingFeedback: true, // 控制悬浮窗的显示
    feedbackPosition: {
      x: 0,  // 这里的初始值不重要，会在 onLoad 中被覆盖
      y: 0
    },
    windowHeight: 0,
    windowWidth: 0
  },
  onLoad() {
    const app = getApp();
    // 获取屏幕尺寸
    const systemInfo = wx.getSystemInfoSync();
    const windowWidth = systemInfo.windowWidth;
    const windowHeight = systemInfo.windowHeight;

    // 设置反馈按钮的初始位置在右下角
    this.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      feedbackPosition: {
        x: windowWidth - 60,  // 距离右边一点点
        y: windowHeight - 130  // 距离底部一点点
      }
    });
    
    // 检查用户偏好并重新排序票种
    this.checkUserPreferences();
  },
  
  // 检查用户偏好并重新排序票种
  checkUserPreferences: function() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    console.log('用户信息:', userInfo);
    
    // 判断用户是否登录 - 只要有用户ID就认为已登录
    if (!userInfo || !userInfo.id) {
      console.log('从本地存储未获取到有效用户ID，尝试从全局变量获取');
      
      // 尝试从全局变量获取
      const app = getApp();
      const globalUserInfo = app.globalData && app.globalData.userInfo;
      
      if (!globalUserInfo || !globalUserInfo.id) {
        console.log('用户未登录，使用默认排序');
        return;
      }
      
      // 使用全局变量中的用户信息
      this.fetchUserPreferencesWithUserId(globalUserInfo.id);
    } else {
      // 使用本地存储中的用户ID
      this.fetchUserPreferencesWithUserId(userInfo.id);
    }
  },
  
  // 使用用户ID获取用户偏好
  fetchUserPreferencesWithUserId: function(userId) {
    console.log('正在获取用户偏好，用户ID:', userId);
    
    // 显示加载提示
    wx.showLoading({
      title: '加载个性化设置...',
      mask: false
    });
    
    // 用户已登录，获取用户偏好
    wx.request({
      url: API_URLS.USER.GET_PREFERENCES() + '?userId=' + userId,
      method: 'GET',
      success: (res) => {
        // 隐藏加载提示
        wx.hideLoading();
        
        console.log('获取用户偏好响应:', res.data);
        if (res.data && res.data.success) {
          const preferences = res.data.data;
          
          // 检查是否开启个性化和交通方式
          if (preferences && preferences.isPersonalized) {
            this.applyPersonalization(preferences);
          } else {
            console.log('用户未开启个性化或没有设置交通方式');
          }
        } else {
          console.warn('获取用户偏好失败:', res.data ? res.data.message : '未知错误');
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        wx.hideLoading();
        
        console.error('获取用户偏好请求失败:', err);
        
        // 显示错误提示（仅在开发环境中，生产环境可能不需要）
        if (__wxConfig.envVersion === 'develop') {
          wx.showToast({
            title: '获取偏好失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      complete: () => {
        // 确保加载提示被隐藏
        setTimeout(() => {
          wx.hideLoading();
        }, 100);
      }
    });
  },
  
  // 应用个性化排序
  applyPersonalization: function(preferences) {
    if (preferences.transportMode === '自驾') {
      // 创建票种的副本
      const ticketDataCopy = [...this.data.ticketData];
      
      // 找到自驾游车辆通行证的索引
      const carPassIndex = ticketDataCopy.findIndex(item => item.key === 'carPass');
      
      if (carPassIndex !== -1) {
        // 移除自驾游车辆通行证
        const carPass = ticketDataCopy.splice(carPassIndex, 1)[0];
        
        // 将其添加到列表的第一位
        ticketDataCopy.unshift(carPass);
        
        // 更新数据
        this.setData({
          ticketData: ticketDataCopy
        });
        
        console.log('已将自驾游车辆通行证移动到第一位');
      }
    }
  },
  
  goToAnimalDetail() {
    wx.navigateTo({
      url: '/pages/animalDetail/animalDetail'
    });
  },
  goToNavigation() {
    wx.switchTab({
      url: '/pages/guide_map/guide_map'
    });
  },
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },
  goToTicketPage() {
    wx.switchTab({
      url: '/pages/ticket/ticket'
    });
  },
  goToParkbooking() {
    wx.navigateTo({
      url: '/pages/parkbooking/parkbooking'
    });
  },
  goToHighlights() {
    wx.navigateTo({
      url: '/pages/highlights/highlights'
    });
  },
  goToTraffic() {
    wx.openLocation({
      latitude: 30.146786, // 杭州野生动物园的纬度
      longitude: 119.986183, // 杭州野生动物园的经度
      name: '杭州野生动物园',
      address: '浙江省杭州市富阳区九龙大道一号',
      scale: 18
    });
  },
  goToParkTraffic() {
    wx.navigateTo({
      url: '/pages/parkTraffic/parkTraffic'
    });
  },
  tabsOn(event) {
    const idx = event.currentTarget.dataset.idx;
    this.setData({
      tabsId: idx
    });
  },
  slideOn(event) {
    this.setData({
      tabsId: event.detail.current
    });
  },
  closeFloatingWindow(e) {
    // 使用catchTap代替阻止冒泡
    this.setData({
      showFloatingFeedback: false
    });
  },
  // 开始拖动
  touchStart: function(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.startPosition = {
      x: this.data.feedbackPosition.x,
      y: this.data.feedbackPosition.y
    };
  },
  // 拖动中
  touchMove: function(e) {
    const moveX = e.touches[0].clientX - this.startX;
    const moveY = e.touches[0].clientY - this.startY;

    // 计算新位置
    let newX = this.startPosition.x + moveX;
    let newY = this.startPosition.y + moveY;

    // 按钮尺寸（px）
    const buttonWidth = 52;   // 按钮实际总宽度
    const buttonHeight = 70; // 按钮实际总高度

    // 防止超出屏幕边界，刚好贴边
    newX = Math.max(0, Math.min(newX, this.data.windowWidth - buttonWidth));
    newY = Math.max(0, Math.min(newY, this.data.windowHeight - buttonHeight));

    this.setData({
      feedbackPosition: {
        x: newX,
        y: newY
      }
    });
  },
  // 结束拖动
  touchEnd: function(e) {
    // 可以添加一些结束拖动后的逻辑，比如吸附到边缘等
  },
  // 添加用户信息更新处理函数
  onUserInfoUpdated(userInfo) {
    console.log('首页接收到用户信息更新:', userInfo);
    if (userInfo && userInfo.id) {
      // 使用更新后的用户信息重新获取用户偏好
      this.fetchUserPreferencesWithUserId(userInfo.id);
    }
  },
  onShow() {
    const app = getApp();
    if (app.globalData.zooChanged) {
      // 如果动物园发生变化，重新加载数据
      this.loadData();
      // 重置变化标志
      app.resetZooChanged();
    }
  },
  // 添加城市选择方法
  onCitySelect() {
    wx.showActionSheet({
      itemList: this.data.cities,
      success: (res) => {
        const selectedCity = this.data.cities[res.tapIndex];
        this.setData({
          currentCity: selectedCity
        });
        // 根据选择的城市更新园区信息
        this.updateParkInfo(selectedCity);
      }
    });
  },
  // 更新园区信息
  updateParkInfo(city) {
    // 这里可以根据不同城市更新不同的园区信息
    const parkInfo = {
      '杭州': {
        name: '杭州野生动物世界',
        address: '浙江省杭州市富阳区九龙大道一号',
        hours: '今日营业：9:30 - 16:30'
      },
      '上海': {
        name: '上海野生动物园',
        address: '上海市浦东新区南六公路178号',
        hours: '今日营业：9:00 - 17:00'
      },
      '北京': {
        name: '北京野生动物园',
        address: '北京市大兴区榆垡镇万亩森林',
        hours: '今日营业：8:30 - 17:30'
      },
      '广州': {
        name: '广州长隆野生动物世界',
        address: '广东省广州市番禺区汉溪大道东299号',
        hours: '今日营业：9:30 - 18:00'
      },
      '深圳': {
        name: '深圳野生动物园',
        address: '广东省深圳市南山区西丽湖路4065号',
        hours: '今日营业：9:30 - 18:00'
      }
    };

    if (parkInfo[city]) {
      this.setData({
        'title': parkInfo[city].name,
        'address': parkInfo[city].address,
        'hours': parkInfo[city].hours
      });
    }
  },
  // 城市选择方法
  onCityChange(e) {
    const index = e.detail.value;
    const selectedCity = this.data.cities[index];
    this.setData({
      currentCity: selectedCity,
      cityIndex: index
    });
  },
  // 切换城市列表显示
  toggleCityList() {
    this.setData({
      showCityList: !this.data.showCityList
    });
  },
  // 选择城市
  selectCity: function(e) {
    const city = e.currentTarget.dataset.city;
    this.updateCurrentZooId(city);
  },

  // 更新用户当前动物园ID
  updateCurrentZooId: function(city) {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    
    // 判断用户是否登录
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      
      // 跳转到我的页面
      wx.switchTab({
        url: '/pages/mine/mine'
      });
      return;
    }

    // 根据城市映射到对应的zoo_id
    const cityToZooId = {
      '杭州': '001',
      '上海': '002',
      '北京': '003',
      '广州': '004',
      '深圳': '005'
    };

    const zooId = cityToZooId[city];
    
    // 显示加载提示
    wx.showLoading({
      title: '切换中...',
      mask: true
    });

    // 调用后端API更新用户的current_zoo_id
    wx.request({
      url: API_URLS.USER.UPDATE_CURRENT_ZOO(),
      method: 'POST',
      data: {
        userId: userInfo.id,
        currentZooId: zooId
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.success) {
          // 更新成功，更新本地存储的用户信息
          userInfo.current_zoo_id = zooId;
          wx.setStorageSync('userInfo', userInfo);
          
          // 更新页面显示
          this.setData({
            currentCity: city,
            showCityList: false,
            parkInfo: this.getParkInfoByCity(city),
            currentBackground: this.data.backgroundImages[city] || this.data.backgroundImages['杭州']
          });
        } else {
          wx.showToast({
            title: '切换失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  // 根据城市获取园区信息
  getParkInfoByCity(city) {
    const parkInfoMap = {
      '杭州': {
        name: '杭州野生动物世界',
        address: '浙江省杭州市富阳区九龙大道一号',
        hours: '今日营业：9:30 - 16:30'
      },
      '上海': {
        name: '上海野生动物园',
        address: '上海市浦东新区南六公路178号',
        hours: '今日营业：9:00 - 17:00'
      },
      '北京': {
        name: '北京野生动物园',
        address: '北京市大兴区榆垡镇万亩森林',
        hours: '今日营业：8:30 - 17:30'
      },
      '广州': {
        name: '广州长隆野生动物世界',
        address: '广东省广州市番禺区汉溪大道东299号',
        hours: '今日营业：9:30 - 18:00'
      },
      '深圳': {
        name: '深圳野生动物园',
        address: '广东省深圳市南山区西丽湖路4065号',
        hours: '今日营业：9:30 - 18:00'
      }
    };

    return parkInfoMap[city] || parkInfoMap['杭州'];
  },
});