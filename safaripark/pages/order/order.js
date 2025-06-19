import { API_BASE_URL, API_PATHS } from '../../common/config.js';

Page({
  data: {
    orders: [],
    currentStatus: 'all',
    openid: null,
    statusList: ['待支付', '待出行', '已完成', '已失效'],
    showTicketModal: false,
    currentTicket: null
  },

  onLoad: function(options) {
    const status = options.status || 'all';
    this.setData({
      currentStatus: status
    });

    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.openid) {
      this.setData({
        openid: userInfo.openid
      });
      this.fetchOrders(userInfo.openid);
    } else {
      wx.showToast({
        title: '用户信息获取失败，请重新登录',
        icon: 'none',
      });
    }
  },

  fetchOrders: function(openid) {
    wx.request({
      url: `${API_BASE_URL}${API_PATHS.ORDER.GET_USER_ORDERS}`,
      method: 'POST',
      data: {
        openid: openid
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 将订单按订单号分组
          const orders = this.groupOrdersByOrderNumber(res.data);
          this.setData({
            orders: orders.filter(order => 
              this.data.currentStatus === 'all' || order.status === this.data.currentStatus
            )
          });
        } else {
          wx.showToast({
            title: '获取订单失败',
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

  // 将订单按订单号分组
  groupOrdersByOrderNumber: function(orders) {
    const orderMap = new Map();
    
    orders.forEach(order => {
      if (!orderMap.has(order.orderNumber)) {
        orderMap.set(order.orderNumber, {
          orderNumber: order.orderNumber,
          status: order.status,
          contactName: order.contactName,
          contactPhone: order.contactPhone,
          visitDate: order.visitDate,
          items: []
        });
      }
      orderMap.get(order.orderNumber).items.push(order);
    });
    
    return Array.from(orderMap.values());
  },

  switchTab: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status
    }, () => {
      this.fetchOrders(this.data.openid);
    });
  },

  // 支付订单
  payOrder: function(e) {
    const orderNumber = e.currentTarget.dataset.orderNumber;
    console.log('支付订单号:', orderNumber);
    
    // 查找对应的订单组
    const orderGroup = this.data.orders.find(order => order.orderNumber === orderNumber);
    if (!orderGroup) {
      console.error('未找到订单信息');
      wx.showToast({
        title: '订单信息错误',
        icon: 'none'
      });
      return;
    }
    
    // 计算总金额
    const totalAmount = orderGroup.items.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
    console.log('订单总金额:', totalAmount);
    
    // 获取订单ID列表
    wx.request({
      url: `${API_BASE_URL}${API_PATHS.ORDER.GET_ORDER_IDS}/${orderNumber}`,
      method: 'GET',
      success: (res) => {
        console.log('获取订单ID响应:', res);
        if (res.statusCode === 200 && res.data) {
          // 直接跳转到支付页面
          wx.navigateTo({
            url: `/pages/payment/payment?totalAmount=${totalAmount}&orderIds=${JSON.stringify(res.data)}`,
            fail: (err) => {
              console.error('跳转支付页面失败:', err);
              wx.showToast({
                title: '跳转支付页面失败',
                icon: 'none'
              });
            }
          });
        } else {
          console.error('获取订单ID失败:', res);
          wx.showToast({
            title: '获取订单信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求订单ID失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 查看门票
  viewTicket: function(e) {
    const orderNumber = e.currentTarget.dataset.orderNumber;
    // 获取订单ID列表
    wx.request({
      url: API_PATHS.ORDER.GET_ORDER_IDS(orderNumber),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          // 跳转到门票页面
          wx.navigateTo({
            url: '/pages/ticket/ticket?orderNumber=' + orderNumber + '&orderIds=' + JSON.stringify(res.data)
          });
        } else {
          wx.showToast({
            title: '获取门票信息失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 添加更新订单状态的方法
  updateOrderStatus: function(orderId, newStatus) {
    wx.request({
      url: API_PATHS.ORDER.UPDATE_STATUS(),
      method: 'POST',
      data: {
        orderId: orderId,
        status: newStatus
      },
      success: (res) => {
        if (res.data === "订单状态更新成功") {
          wx.showToast({
            title: '状态更新成功',
            icon: 'success'
          });
          this.fetchOrders(this.data.openid);
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 显示门票信息
  showTicket: function(e) {
    const orderData = e.currentTarget.dataset.order;
    this.setData({
      showTicketModal: true,
      currentTicket: orderData
    });
  },

  // 隐藏门票信息
  hideTicket: function() {
    this.setData({
      showTicketModal: false,
      currentTicket: null
    });
  }
}); 