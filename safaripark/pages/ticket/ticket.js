import { TICKET_TYPES, ANNUAL_CARD_TYPES } from '../../common/const.js';
import { API_URLS } from '../../common/config.js';

Page({
  data: {
    currentTab: 'ticket',  // 默认选择的是门票
    currentTabIndex: 0,  // 默认为年卡标签
    ticketTab: ['门票', '年卡'],
    selectedDate: '',
    startDate: '',
    endDate: '',
    ticketTypes: TICKET_TYPES,
    annualCardTypes: ANNUAL_CARD_TYPES,
    tabList: [
      { index: 0, title: '门票' },
      { index: 1, title: '年卡' }
    ],
    tabsId: 0, // 默认选中第一个
    selectedItems: [] // 初始化为一个空数组
  },

  onLoad(options) {
    const tabType = options.tabType;
    if (tabType === 'annualCard') {
      this.setData({
        tabsId: 1
      });
    } else {
      this.setData({
        tabsId: 0
      });
    }
    
    // 检查用户是否登录，并获取用户偏好
    this.checkUserPreferences();
    this.calculateTotal();

    // 设置日期范围
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);

    // 格式化日期
    const startDateStr = this.formatDate(today);
    const endDateStr = this.formatDate(endDate);

    this.setData({
      selectedDate: startDateStr,
      startDate: startDateStr,
      endDate: endDateStr
    });
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
      const ticketTypesCopy = [...this.data.ticketTypes];
      
      // 找到自驾游车辆通行证的索引
      const carPassIndex = ticketTypesCopy.findIndex(item => item.key === 'carPass');
      
      if (carPassIndex !== -1) {
        // 移除自驾游车辆通行证
        const carPass = ticketTypesCopy.splice(carPassIndex, 1)[0];
        
        // 将其添加到列表的第一位
        ticketTypesCopy.unshift(carPass);
        
        // 更新数据
        this.setData({
          ticketTypes: ticketTypesCopy
        });
        
        console.log('已将自驾游车辆通行证移动到第一位');
      }
    }
  },

  // 日期格式化函数
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  switchTab: function(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      currentTab: index === 0 ? 'ticket' : 'card',
      currentTabIndex: index
    });

    // 清空所有商品的数量
    if (index === 0) {
      const resetTickets = this.data.ticketTypes.map(item => ({
        ...item,
        count: 0
      }));
      this.setData({
        ticketTypes: resetTickets,
        selectedItems: [],
        total: 0
      });
    } else {
      const resetCards = this.data.annualCardTypes.map(item => ({
        ...item,
        count: 0
      }));
      this.setData({
        annualCardTypes: resetCards,
        selectedItems: [],
        total: 0
      });
    }
  },

  bindDateChange: function (e) {
    this.setData({
      selectedDate: e.detail.value,
    });
  },

  // 增加票数
  addCount: function (event) {
    const dataset = event.currentTarget.dataset;
    const type = dataset.type;
    const key = dataset.key;

    if (!key) {
      console.error('Invalid key');
      return;
    }

    let target = type === 'card' ? 'annualCardTypes' : 'ticketTypes';
    const items = [...this.data[target]];

    const item = items.find(i => i.key === key);
    if (!item) {
      console.error(`Key ${key} not found in ${target}`);
      return;
    }

    item.count += 1;

    // 更新选中的票务信息
    this.updateSelectedItems(item);

    this.setData({
      [target]: items,
      'detailItem.count': item.count,
    });

    this.calculateTotal();
  },

  // 更新选中的票务信息
  updateSelectedItems: function (item) {
    const selectedItems = [...this.data.selectedItems];
    const existingItem = selectedItems.find(i => i.key === item.key);

    if (existingItem) {
      existingItem.count = item.count;
    } else {
      selectedItems.push(item);
    }

    this.setData({
      selectedItems: selectedItems
    });
  },

  // 减少票数
  reduceCount: function (event) {
    const dataset = event.currentTarget.dataset;
    const type = dataset.type;
    const key = dataset.key;

    if (!key) {
      console.error('Invalid key');
      return;
    }

    let target = type === 'card' ? 'annualCardTypes' : 'ticketTypes';
    const items = [...this.data[target]];

    const item = items.find(i => i.key === key);
    if (!item) {
      console.error(`Key ${key} not found in ${target}`);
      return;
    }

    if (item.count > 0) {
      item.count -= 1;
    }

    // 更新选中的票务信息
    this.updateSelectedItems(item);

    this.setData({
      [target]: items,
      'detailItem.count': item.count,
    });

    this.calculateTotal();
  },

  // 计算总金额
  calculateTotal: function () {
    let total = 0;
    if (this.data.currentTab === 'ticket') {
      total = this.data.ticketTypes.reduce(
        (sum, ticket) => sum + ticket.price * ticket.count,
        0
      );
    } else {
      total = this.data.annualCardTypes.reduce(
        (sum, card) => sum + card.price * card.count,
        0
      );
    }
    this.setData({
      total: total,
    });
  },

  // 查看详情
  viewDetails: function (event) {
    const key = event.currentTarget.dataset.key;
    const target = this.data.currentTab === 'ticket' ? 'ticketTypes' : 'annualCardTypes';
    const item = this.data[target].find(i => i.key === key);

    this.setData({
      showDetailModal: true,
      detailItem: { ...item, count: item.count },
    });
  },

  // 关闭弹窗
  closeDetailModal: function () {
    this.setData({
      showDetailModal: false,
      detailItem: {},
    });
  },

  stopPropagation: function () {
    // 阻止事件冒泡
  },

  // 去结算按钮处理
  gotoSettlement: function () {
    // 根据当前选项卡确定是门票还是年卡
    const currentTab = this.data.currentTab;
    const items = currentTab === 'ticket' ? this.data.ticketTypes : this.data.annualCardTypes;
    
    // 过滤出数量大于0的项目
    const selectedItems = items
      .filter(item => item.count > 0)
      .map(item => ({
        key: item.key,
        name: item.name,
        price: item.price,
        count: item.count,
        imageUrl: item.imageUrl
      }));

    if (!selectedItems || selectedItems.length === 0) {
      wx.showToast({
        title: '请选择票务',
        icon: 'none',
      });
      return;
    }

    // 使用用户选择的日期
    const selectedDate = this.data.selectedDate;
    
    // 将数据转换为字符串并进行编码
    const itemsStr = encodeURIComponent(JSON.stringify(selectedItems));
    
    // 跳转到结算页面
    wx.navigateTo({
      url: `/pages/settlement/settlement?selectedDate=${selectedDate}&selectedItems=${itemsStr}`
    });
  },

  tabsOn(event) {
    const idx = event.currentTarget.dataset.idx;
    this.setData({
      tabsId: idx
    });
  },

  // 清空购物车
  clearCart: function() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物清单吗？',
      success: (res) => {
        if (res.confirm) {
          // 根据当前标签页清空对应类型的商品数量
          if (this.data.currentTab === 'ticket') {
            const resetTickets = this.data.ticketTypes.map(item => ({
              ...item,
              count: 0
            }));
            this.setData({
              ticketTypes: resetTickets,
              selectedItems: [],
              total: 0
            });
          } else {
            const resetCards = this.data.annualCardTypes.map(item => ({
              ...item,
              count: 0
            }));
            this.setData({
              annualCardTypes: resetCards,
              selectedItems: [],
              total: 0
            });
          }
        }
      }
    });
  },
});
