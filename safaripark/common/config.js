// API基础地址配置
export const API_BASE_URL = 'http://localhost:8090';

// API 路径配置
export const API_PATHS = {
  // 订单相关
  ORDER: {
    CREATE: '/api/orders/create',
    UPDATE_STATUS: '/api/orders/updateStatus',
    GET_USER_ORDERS: '/api/orders/user',
    GET_ORDER_IDS: '/api/orders/getOrderIds',
  },
  // 用户相关
  USER: {
    LOGIN: '/api/user/login',
    UPDATE: '/api/user/update',
    BIND: '/api/user/bind',
    GET: '/api/user/get',
    GET_PREFERENCES: '/api/user-preferences/get',
    UPDATE_CURRENT_ZOO: '/api/user/update_current_zoo'
  },
  // 表演相关
  PERFORMANCE: {
    PERFORMANCES: '/api/admin/performance/performances',
  },
  PARK_BOOKING: {
    PARK_LIST: '/api/park_booking/park_list',
    BOOK: '/api/park_booking/book',
    CANCEL: '/api/park_booking/cancel',
  },
  PARK_TRAFFIC: {
    LIST: '/api/admin/park_traffic/list',
    UPDATE: '/api/admin/park_traffic/update',
    REALTIME: '/api/admin/park_traffic/realtime',
  },
  // 表演预约相关
  PERFORMANCE_BOOKING: {
    BOOK: '/api/admin/performance_booking/book',
    DELETE: '/api/admin/performance_booking/delete',
    UPDATE: '/api/admin/performance_booking/update',
    BOOKING_LIST: '/api/admin/performance_booking/booking_list',
    UPDATE_STATUS: '/api/admin/performance_booking/update_status',
  },
  // 反馈相关
  FEEDBACK: {
    ADD: '/api/admin/feedback/add',
  },
  USER_PREFERENCE: {
    LOGIN: '/api/user_preference/login',
    GET: '/api/user_preference/get',
    SAVE: '/api/user_preference/save',
    TOGGLE_PERSONALIZED: '/api/user_preference/toggle_personalized',
  },
  // 动物识别相关
  ANIMAL_DETECTION: {
    DETECT: '/api/animal/detect',
    INFO: '/api/admin/animal/info'
  },
  PARK_GEOMETRY: {
    REGIONS: '/api/park-geometry/regions',
    REPORT_LOCATION: '/api/park-geometry/report-location'
  },
  PARK_POI: {
    POIS: '/api/park/pois'
  },
  PARK: {
    GEOMETRIES: '/api/admin/park/geometries',
    INFO: '/api/admin/park/info'
  },
  DANGER_ZONE: {
    CHECK: '/api/danger-zone/check'
  },
  QR: {
    GENERATE: '/api/qr/generate'
  }
};

// 动态获取API URL的函数
const getApiUrl = (path) => {
  return `${API_BASE_URL}${path}`;
};

// 完整的API URL
export const API_URLS = {
  ORDER: {
    CREATE: () => getApiUrl(API_PATHS.ORDER.CREATE),
    UPDATE_STATUS: () => getApiUrl(API_PATHS.ORDER.UPDATE_STATUS),
    GET_USER_ORDERS: () => getApiUrl(API_PATHS.ORDER.GET_USER_ORDERS),
    GET_ORDER_IDS: (orderKey) => getApiUrl(`${API_PATHS.ORDER.GET_ORDER_IDS}/${orderKey}`),
  },
  USER: {
    LOGIN: () => getApiUrl(API_PATHS.USER.LOGIN),
    UPDATE: () => getApiUrl(API_PATHS.USER.UPDATE),
    BIND: () => getApiUrl(API_PATHS.USER.BIND),
    GET: () => getApiUrl(API_PATHS.USER.GET),
    GET_PREFERENCES: () => getApiUrl(API_PATHS.USER.GET_PREFERENCES),
    UPDATE_CURRENT_ZOO: () => getApiUrl(API_PATHS.USER.UPDATE_CURRENT_ZOO)
  },
  PERFORMANCE: {
    PERFORMANCES: () => getApiUrl(API_PATHS.PERFORMANCE.PERFORMANCES),
  },
  PERFORMANCE_BOOKING: {
    BOOK: () => getApiUrl(API_PATHS.PERFORMANCE_BOOKING.BOOK),
    DELETE: () => getApiUrl(API_PATHS.PERFORMANCE_BOOKING.DELETE),
    UPDATE: () => getApiUrl(API_PATHS.PERFORMANCE_BOOKING.UPDATE),
    BOOKING_LIST: () => getApiUrl(API_PATHS.PERFORMANCE_BOOKING.BOOKING_LIST),
    UPDATE_STATUS: () => getApiUrl(API_PATHS.PERFORMANCE_BOOKING.UPDATE_STATUS)
  },
  PARK_BOOKING: {
    PARK_LIST: () => getApiUrl(API_PATHS.PARK_BOOKING.PARK_LIST),
    BOOK: () => getApiUrl(API_PATHS.PARK_BOOKING.BOOK),
    CANCEL: () => getApiUrl(API_PATHS.PARK_BOOKING.CANCEL)
  },
  PARK_TRAFFIC: {
    LIST: () => getApiUrl(API_PATHS.PARK_TRAFFIC.LIST),
    UPDATE: () => getApiUrl(API_PATHS.PARK_TRAFFIC.UPDATE),
    REALTIME: () => getApiUrl(API_PATHS.PARK_TRAFFIC.REALTIME)
  },
  FEEDBACK: {
    ADD: () => getApiUrl(API_PATHS.FEEDBACK.ADD),
  },
  USER_PREFERENCE: {
    GET: () => getApiUrl(API_PATHS.USER_PREFERENCE.GET),
    SAVE: () => getApiUrl(API_PATHS.USER_PREFERENCE.SAVE),
    TOGGLE_PERSONALIZED: () => getApiUrl(API_PATHS.USER_PREFERENCE.TOGGLE_PERSONALIZED)
  },
  ANIMAL_DETECTION: {
    DETECT: () => getApiUrl(API_PATHS.ANIMAL_DETECTION.DETECT),
    INFO: (englishName) => getApiUrl(`${API_PATHS.ANIMAL_DETECTION.INFO}?englishName=${englishName}`)
  },
  PARK_GEOMETRY: {
    REGIONS: () => getApiUrl(API_PATHS.PARK_GEOMETRY.REGIONS),
    REPORT_LOCATION: () => getApiUrl(API_PATHS.PARK_GEOMETRY.REPORT_LOCATION)
  },
  PARK_POI: {
    POIS: () => getApiUrl(API_PATHS.PARK_POI.POIS)
  },
  PARK: {
    GEOMETRIES: () => getApiUrl(API_PATHS.PARK.GEOMETRIES),
    INFO: () => getApiUrl(API_PATHS.PARK.INFO)
  },
  DANGER_ZONE: {
    CHECK: () => getApiUrl(API_PATHS.DANGER_ZONE.CHECK)
  }
};