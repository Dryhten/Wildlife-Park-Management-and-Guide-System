import { API_URLS } from '../../common/config.js';

Page({
  data: {
    selectedDate: '',        // 用户选择的日期
    selectedItems: [],       // 用户选择的票务或年卡信息
    totalAmount: 0,          // 总金额
    totalQuantity: 0,        // 总数量
    name: '',                // 姓名
    phone: '',               // 手机号
    isAgree: false,          // 是否同意协议
    orders: [], // 存储订单信息
    openid: null, // 用户的 openid
  },

  onLoad: function (options) {
    try {
      // 获取从上一页面传递过来的数据
      const selectedDate = options.selectedDate;
      const selectedItems = JSON.parse(decodeURIComponent(options.selectedItems));

      // 计算总金额和总数量
      let totalAmount = 0;
      let totalQuantity = 0;
      
      selectedItems.forEach(item => {
        totalAmount += item.price * item.count;
        totalQuantity += item.count; // 累加数量
      });

      // 设置页面数据
      this.setData({
        selectedDate,
        selectedItems,
        totalAmount,
        totalQuantity, // 设置总数量
      });

      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.openid) {
        this.setData({
          openid: userInfo.openid
        });
      } else {
        wx.showToast({
          title: '用户信息获取失败，请重新登录',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('数据解析错误:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 姓名输入框的绑定
  bindNameInput: function (e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 手机号输入框的绑定
  bindPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 协议勾选框的绑定
  toggleAgreement: function () {
    this.setData({
      isAgree: !this.data.isAgree
    });
  },

  // 提交订单
  submitOrder: function () {
    const { name, phone, selectedItems, isAgree } = this.data;
    
    // 验证表单
    if (!name || !phone) {
      wx.showToast({
        title: '请填写联系人信息',
        icon: 'none'
      });
      return;
    }

    if (!isAgree) {
      wx.showToast({
        title: '请同意用户协议',
        icon: 'none'
      });
      return;
    }

    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.openid) {
      wx.showToast({
        title: '用户信息获取失败，请重新登录',
        icon: 'none',
      });
      return;
    }

    // 构建订单请求
    const orderRequest = {
      openid: userInfo.openid,
      contactName: name,
      contactPhone: phone,
      visitDate: this.data.selectedDate, // 添加观园日期
      items: selectedItems.map(item => ({
        itemName: item.name,
        quantity: item.count,
        totalAmount: item.price * item.count,
        isAnnualCard: item.key.includes('card') // 判断是否为年卡
      }))
    };

    // 提交订单请求
    wx.request({
      url: API_URLS.ORDER.CREATE(),
      method: 'POST',
      data: orderRequest,
      success: (res) => {
        console.log('订单创建请求:', orderRequest);
        console.log('订单创建响应:', res.data);
        if (typeof res.data === 'string' && res.data.startsWith('订单创建成功')) {
          // 计算总金额
          const totalAmount = selectedItems.reduce((sum, item) => 
            sum + (item.price * item.count), 0);
          console.log('总金额:', totalAmount);
          
          // 获取订单key
          const orderKey = res.data.split('#')[1];
          
          // 获取订单ID列表
          wx.request({
            url: API_URLS.ORDER.GET_ORDER_IDS(orderKey),
            method: 'GET',
            success: (idRes) => {
              const orderIds = idRes.data;
              console.log('订单ID列表:', orderIds);

              if (!orderIds || orderIds.length === 0) {
                console.error('未获取到订单ID');
                wx.showToast({
                  title: '订单数据错误',
                  icon: 'none'
                });
                return;
              }

              // 跳转到支付页面
              wx.navigateTo({
                url: `/pages/payment/payment?totalAmount=${totalAmount}&orderIds=${JSON.stringify(orderIds)}`
              });
            },
            fail: (err) => {
              console.error('获取订单ID失败:', err);
              wx.showToast({
                title: '获取订单数据失败',
                icon: 'none'
              });
            }
          });
        } else {
          console.log('订单创建失败:', res.data);
          wx.showToast({
            title: res.data || '订单提交失败',
            icon: 'none',
          });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
        });
      }
    });
  },
});
