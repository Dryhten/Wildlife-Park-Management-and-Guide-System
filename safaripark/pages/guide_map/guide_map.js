import { API_URLS } from '../../common/config.js';

const HANGZHOU_SAFARI_PARK = {
  latitude: 30.152770,  // 取南北中点
  longitude: 119.985420,  // 取东西中点
  name: '杭州野生动物世界',
  address: '浙江省杭州市富阳区杭富路99号'
};

const PARK_BOUNDARY = {
  southwest: { 
    latitude: 30.145958, 
    longitude: 119.979967
  },
  northeast: { 
    latitude: 30.159581, 
    longitude: 119.990873
  }
};

// 添加腾讯地图 key 常量
const QQ_MAP_KEY = 'JMWBZ-ZX6CL-4WIPY-MB2TT-EP2ZF-3OFN5'; // 需要替换为实际的腾讯地图 key

// 设置地图显示范围
const MAP_LIMIT = {
  minLatitude: 30.145958,    // 南边界
  maxLatitude: 30.159581,    // 北边界
  minLongitude: 119.979967,  // 西边界
  maxLongitude: 119.990873   // 东边界
};

// 在 Page 外部定义 CATEGORY_ICONS（确保可以在模板中访问）
const CATEGORY_ICONS = {
  // 动物园相关
  '旅游景点:动物园': '/images/map_icon/animal.png',
  '旅游景点:其它旅游景点': '/images/map_icon/animal.png',

  // 游乐园相关
  '娱乐休闲:户外活动:游乐场': '/images/map_icon/playground.png',
  '娱乐休闲:亲子': '/images/map_icon/playground.png',

  // 餐饮相关
  '美食:小吃快餐': '/images/map_icon/food.png',
  '美食:中餐厅:其它中餐厅': '/images/map_icon/food.png',
  '美食:日韩菜:日本料理': '/images/map_icon/food.png',
  '娱乐休闲:咖啡厅': '/images/map_icon/food.png',

  // 购物相关
  '购物:其它购物': '/images/map_icon/shop.png',
  '生活服务:票务代售:其它票务代售': '/images/map_icon/shop.png',

  // 医疗相关
  '医疗保健:诊所': '/images/map_icon/hospital.png',

  // 交通相关
  '基础设施:交通设施:公交车站': '/images/map_icon/bus.png',
  '室内及附属设施:通行设施类:门/出入口': '/images/map_icon/import.png',
  '室内及附属设施:通行设施类:停车场出入口': '/images/map_icon/parking.png',

  // 表演相关
  '娱乐休闲:剧场音乐厅:剧场': '/images/map_icon/theater.png',

  // 生活服务
  '生活服务': '/images/map_icon/star.png',

  // 默认图标
  'default': '/images/map_icon/default.png'
};

// 添加节流函数
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn.apply(this, args);
      lastCall = now;
    }
  };
}

Page({
  data: {
    center: HANGZHOU_SAFARI_PARK,
    scale: 18,
    userLocation: null,
    isInPark: false,
    polyline: [], // 导航路线
    showRegionInfo: false,
    currentRegion: null,
    showAudioGuide: false,
    setting: {
      minLatitude: MAP_LIMIT.minLatitude,
      maxLatitude: MAP_LIMIT.maxLatitude,
      minLongitude: MAP_LIMIT.minLongitude,
      maxLongitude: MAP_LIMIT.maxLongitude,
      skew: 0,
      rotate: 0,
      showLocation: true,
      showScale: true,
      subkey: QQ_MAP_KEY,
      enableZoom: true,
      enableScroll: true,
      enableRotate: false,
      showCompass: false,
      enable3D: false,
      enableOverlooking: false,
      enableSatellite: false,
      enableTraffic: false,
      showMapText: false,
      showMapPoi: false,
      enablePoi: false,        // 添加此项禁用POI
      enableBuilding: false,   // 禁用3D建筑物
      limitBounds: {
        southwest: PARK_BOUNDARY.southwest,
        northeast: PARK_BOUNDARY.northeast
      },
      minScale: 16.5,
      maxScale: 21,
      gestureEnable: 1,
      scrollEnable: 1,
      zoomEnable: 1,
      rotateEnable: 0,
      tiltEnable: 0,
      boundaryEnable: 1
    },
    locationUpdateTimer: null,
    navigationInstructions: '',
    navigationSteps: [],
    currentStepIndex: 0,
    currentStepInstruction: '',
    totalDistance: 0,
    totalTime: 0,
    showPoiInfo: false,
    currentPoi: null,
    parkPois: [],
    CATEGORY_ICONS: CATEGORY_ICONS,
    markers: [], // 确保初始化markers数组
    titleShowZoom: 17,
    mapLoaded: false, // 添加地图加载状态标志
    isScaling: false, // 添加缩放状态标志
    parkGeometries: [], // 存储园区地理范围数据
    enableAutoBroadcast: false, // 是否开启智能播报
    broadcastedParks: [], // 当前页面已播报的园区ID（改为普通数组，不再使用Storage）
    lastBroadcastDate: '', // 上次播报日期
    showMessage: false,
    currentParkMessage: null,
    currentParkInfo: null,
    showParkDetail: false,
    enableVoiceBroadcast: true, // 添加语音播报开关
    voiceContext: null, // 添加语音上下文
    plugin: null, // 添加插件实例
    lastNavigationText: '', // 记录上次导航播报内容
    lastParkBroadcastTime: 0, // 记录上次园区播报时间
    lastParkId: '', // 记录上次播报的园区ID
    currentParkId: '', // 记录当前所在园区ID
    isNavigating: false, // 是否正在导航
  },

  onLoad() {
    // 创建地图上下文
    this.mapCtx = wx.createMapContext('parkMap', this);

    this.setData({
      includePoints: [{
        latitude: PARK_BOUNDARY.southwest.latitude,
        longitude: PARK_BOUNDARY.southwest.longitude
      }, {
        latitude: PARK_BOUNDARY.northeast.latitude,
        longitude: PARK_BOUNDARY.northeast.longitude
      }],
      scale: 18
    });

    this.checkUserLocation();
    this.startLocationUpdate();
    this.loadPOIData();
    
    // 获取园区地理范围数据
    this.fetchParkGeometries();
    
    // 从本地存储获取智能播报设置
    const enableAutoBroadcast = wx.getStorageSync('enableAutoBroadcast') || false;
    
    this.setData({
        enableAutoBroadcast,
        broadcastedParks: [] // 初始化为空数组
    });

    // 初始化语音上下文
    this.voiceContext = wx.createInnerAudioContext();
    this.voiceContext.onEnded(() => {
      console.log('语音播报结束');
    });
    this.voiceContext.onError((err) => {
      console.error('语音播报错误:', err);
    });

    // 初始化同声传译插件
    this.plugin = requirePlugin('WechatSI');
  },

  // 添加地图加载完成事件处理
  onMapLoaded(e) {
    this.setData({ mapLoaded: true }, () => {
      if (this.data.parkPois && this.data.parkPois.length > 0) {
        this.updateMarkers(this.data.scale);
      }
    });
  },

  // 将POI数据加载逻辑独立出来
  loadPOIData() {
    wx.request({
      url: API_URLS.PARK_POI.POIS(),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const parkPois = res.data.map(poi => ({
            id: poi.id,
            name: poi.name,
            latitude: poi.latitude,
            longitude: poi.longitude,
            category: poi.category,
            address: poi.address
          }));
          
          const initialMarkers = parkPois.map((poi, index) => ({
            id: index,
            latitude: poi.latitude,
            longitude: poi.longitude,
            width: 32,
            height: 32,
            iconPath: CATEGORY_ICONS[poi.category] || CATEGORY_ICONS.default,
            callout: this.data.scale > this.data.titleShowZoom ? {
              content: poi.name,
              color: '#FF6B00',  // 橙色文字
              fontSize: 12,
              borderRadius: 12,  // 增大圆角
              padding: 4,       // 减小padding
              bgColor: '#ffffff', // 白色背景
              display: 'ALWAYS',
              textAlign: 'center',
              borderWidth: 1,    // 添加边框
              borderColor: '#EEEEEE' // 浅灰色边框
            } : null
          }));

          this.setData({
            parkPois: parkPois,
            markers: initialMarkers
          });
        } else {
          console.error('获取POI数据失败:', res);
          wx.showToast({
            title: '获取地点信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.data.locationUpdateTimer) {
      clearInterval(this.data.locationUpdateTimer);
    }
    
    // 清理语音上下文
    if (this.voiceContext) {
      this.voiceContext.destroy();
    }
  },

  // 添加刷新按钮处理函数
  onRefresh() {
    // 显示加载提示
    wx.showLoading({
      title: '刷新中...',
      mask: true
    });

    // 重新加载页面
    wx.reLaunch({
      url: '/pages/guide_map/guide_map',
      success: () => {
        wx.hideLoading();
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '刷新失败',
          icon: 'error'
        });
      }
    });
  },

  checkUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        
        const isInPark = this.isLocationInPark(userLocation);
        this.setData({
          userLocation,
          isInPark
        });

        if (!isInPark) {
          this.setData({
            center: HANGZHOU_SAFARI_PARK
          });
          wx.showToast({
            title: '您当前不在园区范围内，仅可浏览地图',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: () => {
        this.setData({
          isInPark: false,
          center: HANGZHOU_SAFARI_PARK
        });
        wx.showToast({
          title: '获取位置信息失败，仅可浏览地图',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  isLocationInPark(location) {
    return location.latitude >= PARK_BOUNDARY.southwest.latitude &&
           location.latitude <= PARK_BOUNDARY.northeast.latitude &&
           location.longitude >= PARK_BOUNDARY.southwest.longitude &&
           location.longitude <= PARK_BOUNDARY.northeast.longitude;
  },

  // 修改地图点击事件处理
  onMapTap(e) {
    // 检查是否是标记点事件
    if (e && (e.type === 'markertap' || e.detail.markerId !== undefined)) {
      return;
    }
    
    // 检查点击的位置是否在浮窗区域内
    if (e && e.target && e.target.dataset && e.target.dataset.area === 'poi-info') {
      return;
    }

    // 检查是否刚刚点击了标记点
    const now = Date.now();
    if (this.lastMarkerTap && (now - this.lastMarkerTap) < 300) {
      return;
    }

    // 只有点击地图空白处时才关闭浮窗
    if (this.data.showPoiInfo) {
      this.closePoiInfo();
    }
  },

  // 修改标记点点击事件处理方法
  onMarkerTap(e) {
    // 记录最后点击标记点的时间
    this.lastMarkerTap = Date.now();
    
    const { markerId } = e.detail;
    const poi = this.data.parkPois.find((poi, index) => index === markerId);
    if (poi) {
      this.setData({
        showPoiInfo: true,
        currentPoi: poi,
        center: {
          latitude: poi.latitude,
          longitude: poi.longitude
        }
      });
    }
  },

  // 修改关闭浮窗方法
  closePoiInfo() {
    // 添加延迟，避免与其他点击事件冲突
    setTimeout(() => {
      this.setData({
        showPoiInfo: false,
        currentPoi: null
      });
    }, 100);
  },

  // 添加开始导航按钮点击方法
  onStartNavigation() {
    if (!this.data.isInPark) {
      wx.showToast({
        title: '您不在园区内，无法使用导航',
        icon: 'none'
      });
      return;
    }
    
    this.startNavigation(this.data.currentPoi);
    this.closePoiInfo(); // 关闭浮窗
  },

  // 开始导航
  startNavigation(destination) {
    if (!this.data.userLocation) {
      wx.showToast({
        title: '无法获取您的位置',
        icon: 'none'
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '规划路线中...',
      mask: true
    });

    const from = `${this.data.userLocation.latitude},${this.data.userLocation.longitude}`;
    const to = `${destination.latitude},${destination.longitude}`;
    const url = `https://apis.map.qq.com/ws/direction/v1/walking/?from=${from}&to=${to}&key=${QQ_MAP_KEY}`;

    wx.request({
      url: url,
      success: (res) => {
        wx.hideLoading();
        if (res.data.status === 0 && res.data.result && res.data.result.routes && res.data.result.routes[0]) {
          const route = res.data.result.routes[0];
          const coors = route.polyline;
          const pl = [];
          
          try {
            // 坐标解压
            for (let i = 2; i < coors.length; i++) {
              coors[i] = Number(coors[i - 2]) + Number(coors[i]) / 1000000;
            }
            // 将解压后的坐标放入点串数组pl中
            for (let i = 0; i < coors.length; i += 2) {
              pl.push({ 
                latitude: coors[i], 
                longitude: coors[i + 1] 
              });
            }

            // 只生成导航相关的 markers
            const navigationMarkers = [{
              id: -2, // 使用负数 ID 避免与 POI markers 冲突
              latitude: this.data.userLocation.latitude,
              longitude: this.data.userLocation.longitude,
              iconPath: '/images/map_icon/location.png',
              width: 25,
              height: 25,
              callout: {
                content: '当前位置',
                display: 'ALWAYS',
                padding: 5,
                borderRadius: 3,
                bgColor: '#ffffff',
                color: '#333333'
              }
            }, {
              id: -1,
              latitude: destination.latitude,
              longitude: destination.longitude,
              iconPath: '/images/map_icon/destination.png',
              width: 25,
              height: 25,
              callout: {
                content: destination.name,
                display: 'ALWAYS',
                padding: 5,
                borderRadius: 3,
                bgColor: '#ffffff',
                color: '#333333'
              }
            }];

            this.setData({
              markers: navigationMarkers, // 只设置导航相关的标记
              polyline: [{
                points: pl,
                color: '#FF0000DD',
                width: 4,
                arrowLine: true,
                arrowIconPath: '/images/map_icon/arrow.png'
              }],
              includePoints: pl,
              navigationInstructions: '',  // 清除导航提示
              navigationSteps: route.steps,
              currentStepIndex: 0,
              currentStepInstruction: '',
              totalDistance: 0,
              totalTime: 0,
              isNavigating: true,
              lastNavigationText: '' // 重置导航播报内容
            });

            // 立即更新导航指示
            this.updateNavigationInstructions();

          } catch (error) {
            console.error('路线数据处理错误:', error);
            this.restorePoiMarkers(); // 发生错误时恢复 POI markers
          }
        } else {
          console.error('路线规划失败:', res.data);
          this.restorePoiMarkers(); // 规划失败时恢复 POI markers
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        this.restorePoiMarkers(); // 请求失败时恢复 POI markers
      }
    });
  },

  // 修改清除路线方法
  clearRoute() {
    // 如果有 POI 数据，重新生成 POI markers
    const poiMarkers = this.data.parkPois ? 
      this.data.parkPois.map((poi, index) => this.generatePoiMarker(poi, index)) : [];

    // 如果有用户位置，则添加用户位置标记
    if (this.data.userLocation) {
      poiMarkers.push({
        id: -2,
        latitude: this.data.userLocation.latitude,
        longitude: this.data.userLocation.longitude,
        iconPath: '/images/map_icon/location.png',
        width: 25,
        height: 25,
        callout: {
          content: '当前位置',
          display: 'ALWAYS',
          padding: 5,
          borderRadius: 3,
          bgColor: '#ffffff',
          color: '#333333'
        }
      });
    }

    // 如果有用户位置，则设为地图中心
    const center = this.data.userLocation ? {
      latitude: this.data.userLocation.latitude,
      longitude: this.data.userLocation.longitude
    } : HANGZHOU_SAFARI_PARK;

    this.setData({
      markers: poiMarkers, // 恢复所有标记点
      polyline: [],
      center: center,
      includePoints: [{
        latitude: PARK_BOUNDARY.southwest.latitude,
        longitude: PARK_BOUNDARY.southwest.longitude
      }, {
        latitude: PARK_BOUNDARY.northeast.latitude,
        longitude: PARK_BOUNDARY.northeast.longitude
      }],
      navigationInstructions: '',  // 清除导航提示
      navigationSteps: [],         // 清除导航步骤
      currentStepIndex: 0,         // 重置当前步骤
      isNavigating: false,
      lastNavigationText: '' // 重置导航播报内容
    });
  },

  onRegionTap(e) {
    const { regionId } = e.currentTarget.dataset;
    const region = this.data.regions.find(r => r.id === regionId);
    if (region) {
      this.setData({
        showRegionInfo: true,
        currentRegion: region,
        showAudioGuide: false
      });
    }
  },

  closeRegionInfo() {
    this.setData({
      showRegionInfo: false,
      currentRegion: null,
      showAudioGuide: false
    });
  },

  toggleAudioGuide() {
    this.setData({
      showAudioGuide: !this.data.showAudioGuide
    });
  },

  // 开启定位更新
  startLocationUpdate() {
    const timer = setInterval(() => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const userLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          
          const isInPark = this.isLocationInPark(userLocation);
          this.setData({
            userLocation,
            isInPark
          });
          // 检查是否进入新园区
          this.checkUserInNewPark();

          // 如果正在导航，更新导航指示
          if (this.data.polyline.length > 0) {
            this.updateNavigationInstructions();
          }
        }
      });
    }, 5000); // 每5秒更新一次位置

    this.setData({ locationUpdateTimer: timer });
  },

  // 修改 updateNavigationInstructions 方法
  updateNavigationInstructions() {
    if (!this.data.polyline.length || !this.data.userLocation || !this.data.navigationSteps.length) {
      console.log('导航数据不完整，不更新导航指示');
      return;
    }

    console.log('开始更新导航指示');
    const points = this.data.polyline[0].points;
    let nearestPointIndex = 0;
    let minDistance = Infinity;

    // 找到最近的路线点
    points.forEach((point, index) => {
      const distance = this.calculateDistance(
        this.data.userLocation.latitude,
        this.data.userLocation.longitude,
        point.latitude,
        point.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPointIndex = index;
      }
    });

    // 确定当前导航步骤
    let currentStep = null;
    let currentStepIndex = 0;
    let remainingDistance = 0;

    for (let i = 0; i < this.data.navigationSteps.length; i++) {
      const step = this.data.navigationSteps[i];
      const stepStartIndex = step.polyline_idx[0];
      const stepEndIndex = step.polyline_idx[1];

      if (nearestPointIndex >= stepStartIndex && nearestPointIndex <= stepEndIndex) {
        currentStep = step;
        currentStepIndex = i;
        break;
      }
    }

    // 计算剩余总距离和时间
    for (let i = currentStepIndex; i < this.data.navigationSteps.length; i++) {
      remainingDistance += this.data.navigationSteps[i].distance;
    }
    const estimatedMinutes = Math.ceil(remainingDistance / 67);

    if (currentStep) {
      let stepInstruction = '';
      let shouldSpeak = false;

      if (minDistance < 10) {
        // 当前位置在路线上
        stepInstruction = currentStep.instruction.replace(/,/g, '，');
        
        // 如果是新的导航步骤，需要播报
        if (this.data.currentStepIndex !== currentStepIndex) {
          console.log('检测到新的导航步骤，需要播报');
          shouldSpeak = true;
        }
      } else {
        // 当前位置偏离路线
        stepInstruction = `请回到规划路线，距离${Math.round(minDistance)}米`;
        
        // 如果是新偏离或者距离变化超过10米，需要播报
        if (!this.data.currentStepInstruction.includes('偏离路线') || 
            Math.abs(minDistance - parseInt(this.data.currentStepInstruction.match(/\d+/)[0])) > 10) {
          console.log('检测到路线偏离，需要播报');
          shouldSpeak = true;
        }
      }

      // 更新数据
      this.setData({
        currentStepIndex: currentStepIndex,
        currentStepInstruction: stepInstruction,
        totalDistance: remainingDistance,
        totalTime: estimatedMinutes,
        navigationInstructions: `${stepInstruction}\n剩余${remainingDistance}米 · 预计${estimatedMinutes}分钟`
      });

      // 如果需要播报，则进行语音播报
      if (shouldSpeak) {
        console.log('准备播报导航指示:', stepInstruction);
        this.speakNavigation(stepInstruction);
      }
    } else {
      const arrivalMessage = '您已到达目的地附近';
      console.log('到达目的地，准备播报');
      this.setData({
        navigationInstructions: arrivalMessage,
        currentStepInstruction: arrivalMessage
      });
      this.speakNavigation(arrivalMessage);
    }
  },

  // 修改语音播报方法
  speakNavigation(text) {
    if (!this.data.enableAutoBroadcast) {
      console.log('播报已关闭，不进行语音播报');
      return;
    }

    // 如果正在导航，且内容与上次相同，则不播报
    if (this.data.isNavigating && text === this.data.lastNavigationText) {
      console.log('导航内容重复，不进行播报');
      return;
    }

    console.log('开始语音播报:', text);
    try {
      // 停止当前正在播放的语音
      this.voiceContext.stop();
      
      // 使用同声传译插件
      this.plugin.textToSpeech({
        lang: 'zh_CN',
        content: text,
        success: (res) => {
          console.log('语音合成成功:', res);
          if (res.filename) {
            console.log('开始播放音频文件:', res.filename);
            this.voiceContext.src = res.filename;
            this.voiceContext.play();
            
            // 更新导航播报内容
            if (this.data.isNavigating) {
              this.setData({
                lastNavigationText: text
              });
            }
          }
        },
        fail: (err) => {
          console.error('语音合成失败:', err);
        }
      });
    } catch (error) {
      console.error('语音播报异常:', error);
    }
  },

  // 计算方向
  calculateDirection(lat1, lon1, lat2, lon2) {
    const dy = lat2 - lat1;
    const dx = lon2 - lon1;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // 将角度转换为方向描述
    if (angle >= -22.5 && angle < 22.5) return '东';
    if (angle >= 22.5 && angle < 67.5) return '东北';
    if (angle >= 67.5 && angle < 112.5) return '北';
    if (angle >= 112.5 && angle < 157.5) return '西北';
    if (angle >= 157.5 || angle < -157.5) return '西';
    if (angle >= -157.5 && angle < -112.5) return '西南';
    if (angle >= -112.5 && angle < -67.5) return '南';
    return '东南';
  },

  // 添加计算距离的方法
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径，单位km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // 距离，单位km
    return Math.round(d * 1000); // 转换为米并四舍五入
  },

  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  // 修改获取地图上POI点的方法
  getParkPois() {
    // 直接使用已有的POI数据
    if (this.data.parkPois.length > 0) {
      wx.navigateTo({
        url: '/pages/poi_list/poi_list'
      });
    } else {
      wx.showToast({
        title: '暂无地点信息',
        icon: 'none'
      });
    }
  },

  // 添加从列表跳转回来的处理方法
  handlePoiSelect(poi) {
    this.setData({
      center: {
        latitude: poi.latitude,
        longitude: poi.longitude
      },
      scale: 19,  // 放大地图
      showPoiInfo: true,
      currentPoi: poi
    });
  },

  // 添加恢复 POI markers 的方法
  restorePoiMarkers() {
    if (this.data.parkPois) {
      this.setData({
        markers: this.data.parkPois.map((poi, index) => this.generatePoiMarker(poi, index))
      });
    }
  },

  // 修改onShow生命周期函数
  onShow() {
    if (this.data.mapLoaded && this.data.parkPois && this.data.parkPois.length > 0) {
      this.updateMarkers(this.data.scale);
    }
  },

  // 添加浮窗点击事件处理
  onPoiInfoTap(e) {
    // 阻止事件冒泡到地图
    e.stopPropagation && e.stopPropagation();
  },

  // 修改缩放事件处理
  onScaleChange(e) {
    if (e.type === 'end') {
      const newScale = e.detail.scale;
      if (newScale) {
        this.setData({ scale: newScale });
      }
    }
  },

  // 修改区域变化事件处理
  onRegionChange(e) {
    // 移除区域变化事件的处理，避免重复更新
  },

  // 修改更新标记点显示方法
  updateMarkers(newScale) {
    if (!this.data.parkPois || this.data.parkPois.length === 0 || !newScale) return;
    
    const markers = this.data.parkPois.map((poi, index) => ({
      id: index,
      latitude: poi.latitude,
      longitude: poi.longitude,
      width: 32,
      height: 32,
      iconPath: CATEGORY_ICONS[poi.category] || CATEGORY_ICONS.default,
      callout: newScale > this.data.titleShowZoom ? {
        content: poi.name,
        color: '#FF6B00',  // 橙色文字
        fontSize: 12,
        borderRadius: 12,  // 增大圆角
        padding: 4,       // 减小padding
        bgColor: '#ffffff', // 白色背景
        display: 'ALWAYS',
        textAlign: 'center',
        borderWidth: 1,    // 添加边框
        borderColor: '#EEEEEE' // 浅灰色边框
      } : null
    }));

    this.setData({ 
      scale: newScale,
      markers: markers
    });
  },

  // 修改生成单个标记点的方法
  generatePoiMarker(poi, index) {
    return {
      id: index,
      latitude: poi.latitude,
      longitude: poi.longitude,
      width: 32,
      height: 32,
      iconPath: CATEGORY_ICONS[poi.category] || CATEGORY_ICONS.default,
      callout: this.data.scale > this.data.titleShowZoom ? {
        content: poi.name,
        color: '#FF6B00',  // 橙色文字
        fontSize: 12,
        borderRadius: 12,  // 增大圆角
        padding: 4,       // 减小padding
        bgColor: '#ffffff', // 白色背景
        display: 'ALWAYS',
        textAlign: 'center',
        borderWidth: 1,    // 添加边框
        borderColor: '#EEEEEE' // 浅灰色边框
      } : null
    };
  },

  // 获取园区地理范围数据
  fetchParkGeometries() {
    wx.request({
      url: API_URLS.PARK.GEOMETRIES(),
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          try {
            const geometries = res.data.data.map(item => {
              let parsedGeometry = item.geometry;
              try {
                // 如果 geometry 是字符串，尝试解析它
                if (typeof item.geometry === 'string') {
                  parsedGeometry = JSON.parse(item.geometry);
                }
              } catch (e) {
                console.error('解析地理数据失败:', e);
                parsedGeometry = [];
              }
              return {
                ...item,
                geometry: parsedGeometry
              };
            });
            
            this.setData({
              parkGeometries: geometries
            });
          } catch (e) {
            console.error('处理地理数据失败:', e);
            wx.showToast({
              title: '处理地理数据失败',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: res.data.message || '获取地理数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求地理数据失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 切换智能播报
  toggleAutoBroadcast() {
    const newValue = !this.data.enableAutoBroadcast;
    this.setData({ enableAutoBroadcast: newValue });
    wx.setStorageSync('enableAutoBroadcast', newValue);
    
    wx.showToast({
      title: newValue ? '已开启智能播报' : '已关闭智能播报',
      icon: 'success'
    });
  },

  // 检查位置是否在多边形内
  isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      const intersect = ((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  },

  // 获取园区信息并显示消息
  fetchParkInfoAndBroadcast(parkId) {
    if (!parkId) {
      console.error('园区ID不能为空');
      return;
    }

    console.log('正在获取园区信息，parkId:', parkId);

    wx.request({
      url: `${API_URLS.PARK.INFO()}/${parkId}`,
      method: 'GET',
      success: (res) => {
        console.log('获取园区信息响应:', res.data);
        
        if (res.data && res.data.data) {
          const data = res.data.data;
          
          // 正确获取园区和动物园信息
          const parkInfo = data.park;
          const zooInfo = data.zoo;
          
          // 验证园区信息的完整性
          if (!parkInfo || !parkInfo.name) {
            console.error('园区信息无效:', data);
            return;
          }

          // 构建完整的园区名称（动物园名称 + 区域名称）
          const fullParkName = zooInfo ? `${zooInfo.name}${parkInfo.name}` : parkInfo.name;
          
          // 设置消息和园区信息
          const message = `您已抵达${fullParkName}`;
          this.setData({
            currentParkMessage: message,
            currentParkInfo: {
              ...parkInfo,
              fullName: fullParkName,
              zooName: zooInfo ? zooInfo.name : ''
            },
            showMessage: true
          });

          // 构建播报内容
          let broadcastContent = message;
          if (parkInfo.audioGuide) {
            broadcastContent += `，${parkInfo.audioGuide}`;
          }

          // 如果不在导航状态，播报园区介绍
          if (!this.data.isNavigating && this.data.enableAutoBroadcast) {
            console.log('准备播报内容:', broadcastContent);
            this.speakNavigation(broadcastContent);
          }
        } else {
          console.error('获取园区信息失败:', res.data);
          this.setData({
            showMessage: false,
            currentParkMessage: null,
            currentParkInfo: null
          });
        }
      },
      fail: (err) => {
        console.error('请求园区信息失败:', err);
        this.setData({
          showMessage: false,
          currentParkMessage: null,
          currentParkInfo: null
        });
      }
    });
  },

  // 检查用户是否进入新园区
  checkUserInNewPark() {
    if (!this.data.enableAutoBroadcast || !this.data.userLocation) {
      console.log('自动播报未启用或未获取到用户位置');
      return;
    }
    
    const userPoint = [this.data.userLocation.longitude, this.data.userLocation.latitude];
    const currentTime = Date.now();
    
    console.log('检查用户位置:', userPoint);
    
    this.data.parkGeometries.forEach(parkGeo => {
      // 验证园区数据的完整性
      if (!parkGeo || !parkGeo.parkId || !parkGeo.geometry) {
        console.log('无效的园区数据:', parkGeo);
        return;
      }

      try {
        const geometry = typeof parkGeo.geometry === 'string' ? 
          JSON.parse(parkGeo.geometry) : parkGeo.geometry;

        if (!Array.isArray(geometry) || geometry.length === 0) {
          console.log('无效的几何数据:', geometry);
          return;
        }

        // 检查用户是否在园区内
        if (this.isPointInPolygon(userPoint, geometry)) {
          console.log('检测到用户在园区内:', parkGeo.parkId);
          
          // 检查是否是新园区，或者距离上次播报已经超过5分钟
          if (this.data.currentParkId !== parkGeo.parkId || 
              (currentTime - this.data.lastParkBroadcastTime) > 5 * 60 * 1000) {
            
            console.log('触发园区播报, 当前园区:', parkGeo.parkId, '上一个园区:', this.data.currentParkId);
            
            // 更新当前园区ID和播报记录
            this.setData({ 
              currentParkId: parkGeo.parkId,
              lastParkId: parkGeo.parkId,
              lastParkBroadcastTime: currentTime
            }, () => {
              // 获取并播报园区信息
              this.fetchParkInfoAndBroadcast(parkGeo.parkId);
            });
          }
          return; // 找到用户所在园区后直接返回
        }
      } catch (e) {
        console.error('处理园区几何数据失败:', e);
      }
    });
  },

  // 点击消息栏
  onMessageTap() {
    this.setData({
      showParkDetail: true
    });
  },

  // 关闭园区详情
  closeParkDetail() {
    this.setData({
      showParkDetail: false
    });
  },

  // 修改切换语音播报开关的方法
  toggleVoiceBroadcast() {
    const newValue = !this.data.enableVoiceBroadcast;
    this.setData({ enableVoiceBroadcast: newValue });
    wx.setStorageSync('enableVoiceBroadcast', newValue);
    
    wx.showToast({
      title: newValue ? '已开启语音播报' : '已关闭语音播报',
      icon: 'success'
    });
  },
}); 