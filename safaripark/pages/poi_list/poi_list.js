const app = getApp();
const PAGE_SIZE = 10; // 每页显示数量
import { API_URLS } from '../../common/config.js';

Page({
  data: {
    pois: [],
    filteredPois: [], // 用于显示搜索过滤后的POI列表
    displayPois: [], // 当前显示的POI列表
    searchKeyword: '',  // 搜索关键词
    userLocation: null,
    currentPage: 1, // 当前页码
    hasMore: true, // 是否还有更多数据
    userPreferences: null, // 用户偏好
    isPersonalized: false // 是否已经根据用户偏好个性化排序
  },

  onLoad(options) {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.data.parkPois) {
      // 获取POI列表和用户位置
      const pois = prevPage.data.parkPois.map(poi => ({
        ...poi,
        distance: this.calculateDistance(
          prevPage.data.userLocation,
          poi
        )
      }));

      // 先按距离排序（这是默认排序）
      pois.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      this.setData({
        pois: pois,
        filteredPois: pois,
        displayPois: pois.slice(0, PAGE_SIZE),
        userLocation: prevPage.data.userLocation,
        currentPage: 1,
        hasMore: pois.length > PAGE_SIZE
      });
      
      // 先为POI添加动物关联信息，然后再获取用户偏好并排序
      this.getPOIAnimalInfo();
    }
  },

  // 获取或模拟POI与动物的关联信息
  getPOIAnimalInfo() {
    const pois = this.data.pois;
    
    // 这里可以添加真实的API调用来获取POI与动物的关联信息
    // 但由于没有这个API，我们模拟一些数据
    
    // 一些常见的动物分类和对应的POI类型
    const animalMappings = {
      '餐厅': [],
      '服务设施': [],
      '熊山': ['熊', '棕熊', '黑熊'],
      '狮子山': ['狮子', '非洲狮'],
      '熊猫馆': ['熊猫', '大熊猫'],
      '猛兽区': ['老虎', '狮子', '猎豹'],
      '水族馆': ['海豚', '企鹅', '鲨鱼'],
      '鸟类天堂': ['鹦鹉', '火烈鸟', '白头鹰'],
      '猴山': ['猴子', '黑猩猩', '大猩猩'],
      '草食动物区': ['长颈鹿', '斑马', '羚羊'],
      '爬行动物馆': ['蛇', '鳄鱼', '蜥蜴'],
      '儿童乐园': []
    };
    
    // 为每个POI分配相关动物
    pois.forEach(poi => {
      if (!poi.animals) {
        const category = poi.category || '';
        const name = poi.name || '';
        
        // 首先通过名称匹配
        for (const [poiType, animals] of Object.entries(animalMappings)) {
          if (name.includes(poiType)) {
            poi.animals = animals;
            break;
          }
        }
        
        // 如果还没有animals，尝试通过分类匹配
        if (!poi.animals && animalMappings[category]) {
          poi.animals = animalMappings[category];
        }
        
        // 如果没有匹配到任何动物，可以根据名称做一些特殊处理
        if (!poi.animals) {
          if (name.includes('熊')) poi.animals = ['熊', '棕熊', '黑熊'];
          else if (name.includes('猫')) poi.animals = ['熊猫'];
          else if (name.includes('豹')) poi.animals = ['猎豹', '雪豹'];
          else if (name.includes('鹿')) poi.animals = ['梅花鹿', '驯鹿'];
          else poi.animals = [];
        }
        
        console.log(`为POI "${poi.name}" 分配动物关联:`, poi.animals);
      }
    });
    
    this.setData({
      pois: pois,
      filteredPois: pois
    });
    
    // 更新后获取用户偏好并排序
    this.getUserPreferences();
  },

  // 获取用户偏好
  getUserPreferences() {
    // 首先尝试从globalData获取用户信息
    let userInfo = app.globalData.userInfo;
    
    // 如果globalData中没有，尝试从本地存储获取
    if (!userInfo || !userInfo.id) {
      userInfo = wx.getStorageSync('userInfo');
    }
    
    // 确保用户已登录 - 只要有用户ID就认为已登录
    if (!userInfo || !userInfo.id) {
      console.log('用户未登录，使用默认排序');
      return;
    }
    
    console.log('用户已登录，详细信息:', JSON.stringify(userInfo));
    
    // 尝试获取openid
    const openid = userInfo.openid || userInfo.id;
    console.log('使用的openid值:', openid);
    
    wx.showLoading({
      title: '加载中...',
    });
    
    wx.request({
      url: API_URLS.USER_PREFERENCE.GET(),
      data: { openid: openid },
      success: (res) => {
        wx.hideLoading();
        console.log('API响应:', JSON.stringify(res.data));
        
        // 尝试获取用户偏好数据，处理不同的返回格式
        let userPreferences = null;
        
        if (res.data && res.data.success && res.data.data) {
          // 标准返回格式
          userPreferences = res.data.data;
        } else if (res.data && !res.data.success && res.data.data) {
          // 某些API可能在success为false时也返回数据
          userPreferences = res.data.data;
        } else if (res.data && typeof res.data === 'object' && res.data.favoriteAnimals) {
          // 直接返回数据对象的情况
          userPreferences = res.data;
        }
        
        if (userPreferences) {
          console.log('获取到用户偏好:', userPreferences);
          this.setData({ userPreferences });
          
          // 如果有喜爱动物数据，重新排序POI
          if (userPreferences.favoriteAnimals) {
            this.sortPoisByPreferences(userPreferences.favoriteAnimals);
          } else {
            console.log('用户偏好数据中没有喜爱动物信息');
          }
        } else {
          console.log('未找到用户偏好数据或返回格式不正确');
          // 提供模拟数据用于测试
          this.provideMockData();
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取用户偏好失败:', err);
        // 提供模拟数据用于测试
        this.provideMockData();
      }
    });
  },
  
  // 提供模拟数据用于测试
  provideMockData() {
    console.log('使用模拟数据进行排序测试');
    const mockFavoriteAnimals = "熊,猎豹,熊猫";
    this.sortPoisByPreferences(mockFavoriteAnimals);
  },

  // 根据用户喜爱动物偏好排序POI
  sortPoisByPreferences(favoriteAnimals) {
    if (!favoriteAnimals) {
      console.log('没有喜爱动物数据，不执行排序');
      return;
    }
    
    // 如果favoriteAnimals是字符串，将其转换为数组
    let favoriteAnimalsArray = favoriteAnimals;
    if (typeof favoriteAnimals === 'string') {
      favoriteAnimalsArray = favoriteAnimals.split(',').map(animal => animal.trim());
      console.log('已将喜爱动物字符串转换为数组:', favoriteAnimalsArray);
    }
    
    if (favoriteAnimalsArray.length === 0) {
      console.log('喜爱动物数组为空，不执行排序');
      return;
    }
    
    console.log('根据用户喜爱动物重新排序POI:', favoriteAnimalsArray);
    
    const pois = [...this.data.pois];
    
    // 检查POI数据结构
    console.log('POI数据示例:', pois.length > 0 ? JSON.stringify(pois[0]) : '无POI数据');
    
    // 计算每个POI与用户喜爱动物的相关度分数
    pois.forEach(poi => {
      // 初始化相关度分数
      poi.relevanceScore = 0;
      
      // 如果POI有关联动物信息
      if (poi.animals && poi.animals.length > 0) {
        // 如果animals是字符串，将其转换为数组
        let poiAnimals = poi.animals;
        if (typeof poi.animals === 'string') {
          poiAnimals = poi.animals.split(',').map(animal => animal.trim());
        }
        
        // 计算与用户喜爱动物的匹配数量
        poi.relevanceScore = poiAnimals.filter(animal => 
          favoriteAnimalsArray.some(favAnimal => 
            animal.toLowerCase().includes(favAnimal.toLowerCase()) || 
            favAnimal.toLowerCase().includes(animal.toLowerCase())
          )
        ).length;
      } else if (poi.category) {
        // 如果没有animals字段，尝试使用category字段进行匹配
        poi.relevanceScore = favoriteAnimalsArray.some(animal => 
          poi.category.toLowerCase().includes(animal.toLowerCase())
        ) ? 1 : 0;
      }
      
      console.log(`POI "${poi.name}" 的相关度分数: ${poi.relevanceScore}`);
    });
    
    // 排序规则:
    // 1. 首先按照相关度分数降序排列
    // 2. 如果相关度分数相同，则按照距离升序排列
    pois.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    });
    
    console.log('排序后的前3个POI:', pois.slice(0, 3).map(p => `${p.name}(相关度:${p.relevanceScore})`));
    
    this.setData({
      pois: pois,
      filteredPois: pois,
      displayPois: pois.slice(0, this.data.currentPage * PAGE_SIZE),
      isPersonalized: true
    });
  },

  // 搜索输入处理
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase();
    const filteredPois = this.data.pois.filter(poi => 
      poi.name.toLowerCase().includes(keyword) || 
      poi.category.toLowerCase().includes(keyword)
    );

    this.setData({
      searchKeyword: keyword,
      filteredPois: filteredPois,
      displayPois: filteredPois.slice(0, PAGE_SIZE),
      currentPage: 1,
      hasMore: filteredPois.length > PAGE_SIZE
    });
  },

  // 加载更多数据
  onReachBottom() {
    if (!this.data.hasMore) return;

    const nextPage = this.data.currentPage + 1;
    const start = (nextPage - 1) * PAGE_SIZE;
    const newDisplayPois = this.data.filteredPois.slice(0, start + PAGE_SIZE);

    this.setData({
      displayPois: newDisplayPois,
      currentPage: nextPage,
      hasMore: newDisplayPois.length < this.data.filteredPois.length
    });
  },

  // 计算两点之间的距离
  calculateDistance(userLocation, poi) {
    if (!userLocation) return null;
    
    const R = 6371; // 地球半径，单位km
    const dLat = this.deg2rad(poi.latitude - userLocation.latitude);
    const dLon = this.deg2rad(poi.longitude - userLocation.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(userLocation.latitude)) * Math.cos(this.deg2rad(poi.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // 距离，单位km
    return Math.round(d * 1000); // 转换为米并四舍五入
  },

  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  onPoiTap(e) {
    const poi = e.currentTarget.dataset.poi;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage) {
      prevPage.handlePoiSelect(poi);
    }
    
    wx.navigateBack();
  }
}); 