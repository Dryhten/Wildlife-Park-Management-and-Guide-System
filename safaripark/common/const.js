// common/const.js

// 门票类型
export const TICKET_TYPES = [
  {
    key: 'fullPrice',
    name: '全价票',
    price: 220,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '适用于所有年龄段游客',
    details: {
      bookingNotice: [
        "适用成人或1.5米(含)以上儿童（包含门票、小火车、亲子乐园、演出等）",
        "单次入园凭证，不可重复使用，不可改签",
        "出游当天购买为门市价，建议提前预订",
        "进入安检区域请配合安检，提前打开背包",
        "禁止携带宠物及其他各类动物入园",
        "请勿携带食物、飞行器等有安全隐患的物品入园"
      ],
      usageNotice: ["一笔订单多张票，不支持部分退款，不支持部分使用"],
      refundNotice: [
        "未使用的电子票出游日前申请退票可全额无损退款",
        "当日购买当日入园的电子票未出游时，当日申请退款可全额无损退款",
        "退款款项将在7个工作日内原路返回",
        "未使用的电子票自出游日起30天后过期，退票需联系客服"
      ],
      invoiceNotice: [
        "如需发票，务必在出游当天15点之前开取",
        "若游玩当天忘记开票，请游玩归来后联系景区客服"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'child',
    name: '儿童优待票',
    price: 140,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '适用于1.2米以下儿童',
    details: {
      bookingNotice: [
        "适用于1.2米以下儿童",
        "仅限儿童，必须在家长陪同下使用"
      ],
      usageNotice: [
        "仅适用于儿童，凭票可进入亲子乐园等指定区域",
        "每张儿童票必须有一名成人票作为陪同"
      ],
      refundNotice: [
        "儿童票在未使用前可全额退款",
        "未使用的电子票退票时需提供家长身份证明"
      ],
      invoiceNotice: [
        "请在购票后24小时内申请开票",
        "开票需提供有效证件"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'preferential',
    name: '优待票',
    price: 140,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '适用于符合优待票条件的游客',
    details: {
      bookingNotice: [
        "包含门票、小火车、亲子乐园、演出",
        "适用范围:",
        "1) 七十周岁以上老人凭有效证件",
        "2) 三十年以上教龄的教师凭有效证件",
        "3) 现役军人凭有效证件",
        "4) 残疾人凭有效证件",
        "注：其他优待票范围不包括年卡，仅针对零售票有效"
      ],
      usageNotice: [
        "1、单次入园凭证，不可重复使用，不可改签",
        "2、出游当天购买为门市价，建议提前一天预订",
        "3、一笔订单多张票，不支持部分退款，不支持部分使用"
      ],
      refundNotice: [
        "1、提前预订: 未使用的电子票出游日前申请退票，可全额无损退款；其它时间申请退票每单收取5%手续费",
        "2、购买当日入园的电子票未出游时，当日申请退款可全额无损退款",
        "3、未使用申请退款的，款项在7个工作日之内原路返回",
        "4、未使用的电子票，自出游日起30天后过期系统自动核销，退票需主动联系客服",
        "5、如需发票，务必在出游当天15点之前凭预订信息至12号售票窗口开取；如游玩当天忘记开发票的，游玩归来后主动联系景区客服并提供开票信息和邮箱地址，我们开具电子发票发至所提供的邮箱",
        "6、如有疑问请咨询：400-102-6688"
      ],
      invoiceNotice: [
        "如需发票，请在出游当天15点之前凭预订信息至12号售票窗口开取",
        "如游玩当天忘记开发票的，游玩归来后主动联系景区客服并提供开票信息和邮箱地址，我们开具电子发票发至所提供的邮箱"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'student',
    name: '大学生票',
    price: 180,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '适用全日制在读大学生(凭全日制大学生证购买及入园)',
    details: {
      bookingNotice: [
        "适用全日制在读大学生(凭全日制大学生证购买及入园)(包含门票、小火车、亲子乐园、演出)",
        "单次入园凭证，不可重复使用，不可改签",
        "进入安检区域请有序排队，提前打开背包，配合安检",
        "禁止携带宠物及其他各类动物入园",
        "请勿携带蔬菜、肉类、油炸食品、外卖类食品入园",
        "请勿携带飞行器，滑板车、平衡车等有安全隐患的车辆入园"
      ],
      usageNotice: ["一笔订单多张票，不支持部分退款，不支持部分使用"],
      refundNotice: [
        "提前预订:未使用的电子票出游日前申请退票，可全额无损退款;其它时间申请退票每单收取5%手续费",
        "当日购买当日入园的电子票未出游时，当日申请退款可全额无损退款",
        "未使用申请退款的，款项在7个工作日之内原路返回",
        "未使用的电子票，自出游日起30天后过期系统自动核销，退票需主动联系客服"
      ],
      invoiceNotice: [
        "如需发票，请在出游当天15点之前凭预订信息至12号售票窗口开取",
        "如游玩当天忘记开发票的，游玩归来后主动联系景区客服并提供开票信息和邮寄邮箱地址，我们开具后发至提供的邮箱"
      ],
      customerService: "如有疑问请咨询:400-102-6688"
    }
  },
  {
    key: 'carPass',
    name: '自驾游车辆通行证',
    price: 220,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '仅限7座及7座以下车辆(不含景区门票)',
    details: {
      bookingNotice: [
        "仅限7座及7座以下车辆准许进入(车票不含景区门票，需另行购买门票方可使用)",
        "限1车使用，车上人员单独购票",
        "自驾游园每日限额，为保障您的游玩体验，请提前购票",
        "一笔订单多张票，不支持部分退款，不支持部分使用",
        "进入安检区域请有序排队，提前打开背包，配合安检",
        "禁止携带宠物及其他各类动物入园",
        "请勿携带蔬菜、肉类、油炸食品、外卖类食品入园"
      ],
      usageNotice: ["建议提前一天预订"],
      refundNotice: [
        "提前预订:未使用的电子票出游日前申请退票，可全额无损退款;其它时间申请退票每单收取5%手续费",
        "当日购买当日入园的电子票未出游时，当日申请退款可全额无损退款",
        "未使用申请退款的，款项在7个工作日之内原路返回",
        "未使用的电子票，自出游日起30天后过期系统自动核销，退票需主动联系客服"
      ],
      invoiceNotice: [
        "如需发票，请在出游当天15点之前凭预订信息至12号售票窗口开取",
        "如游玩当天忘记开发票的，游玩归来后主动联系景区客服并提供开票信息和邮寄邮箱地址，我们开具后发至提供的邮箱"
      ],
      customerService: "如有疑问请咨询:400-102-6688"
    }
  }
];

// 年卡类型
export const ANNUAL_CARD_TYPES = [
  {
    key: 'singleFull',
    name: '通玩的单人年卡',
    price: 880,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '单人使用，全年不限次入园',
    tags: ['激活使用', '不限次', '365天通用'],
    details: {
      bookingNotice: [
        "全年365天通用",
        "预订年卡的游客，凭手机短信和身份证原件至园区年卡中心办理激活，激活成功后即可使用",
        "网上预订只限年卡新用户，年卡续卡需在年卡中心现场办理",
        "未激活的年卡可申请全额退款"
      ],
      usageNotice: [
        "年卡有效期一年，持卡人完成支付及信息录入视为激活成功，激活之日即为年卡起效日期",
        "单人年卡可单独使用",
        "年卡持卡人入园可携带1.2米以下儿童免费入园(每名成人限带1名)，儿童身高超过1.2米需另行购买优惠票"
      ],
      refundNotice: [
        "年卡激活后，除联系电话变更和身份证到期更换外，不办理持卡人其他信息的变更手续"
      ],
      invoiceNotice: [
        "持卡人如需发票，请在入园游玩当天至售票窗口凭购票短信开具并领取发票"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'doubleFull',
    name: '通玩的双人年卡',
    price: 1760,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '双人使用，全年不限次入园',
    tags: ['激活使用', '不限次', '365天通用'],
    details: {
      bookingNotice: [
        "全年365天通用",
        "预订年卡的游客，凭手机短信和身份证原件至园区年卡中心办理激活，激活成功后即可使用",
        "网上预订只限年卡新用户，年卡续卡需在年卡中心现场办理",
        "双人年卡:适用于两位成人或1.5米以上儿童",
        "未激活的年卡可申请全额退款"
      ],
      usageNotice: [
        "年卡有效期一年，持卡人完成支付及信息录入视为激活成功，激活之日即为年卡起效日期",
        "双人年卡可同时使用，也可单人使用(只限登记人员)",
        "年卡持卡人入园可携带1.2米以下儿童免费入园(每名成人限带1名)，儿童身高超过1.2米需另行购买优惠票"
      ],
      refundNotice: [
        "年卡激活后，除联系电话变更和身份证到期更换外，不办理持卡人其他信息的变更手续"
      ],
      invoiceNotice: [
        "持卡人如需发票，请在入园游玩当天至售票窗口凭购票短信开具并领取发票"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'childFull',
    name: '通玩的儿童年卡',
    price: 480,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '适用于1.2-1.5米儿童，全年不限次入园',
    tags: ['激活使用', '不限次', '365天通用'],
    details: {
      bookingNotice: [
        "适用于1.2-1.5米儿童",
        "儿童年卡持卡人入园时须至少一名成人陪同",
        "未激活的年卡可申请全额退款"
      ],
      usageNotice: [
        "年卡有效期一年，持卡人完成支付及信息录入视为激活成功，激活之日即为年卡起效日期",
        "儿童年卡持卡人必须由成人陪同入园"
      ],
      refundNotice: [
        "年卡激活后，除联系电话变更和身份证到期更换外，不办理持卡人其他信息的变更手续"
      ],
      invoiceNotice: [
        "持卡人如需发票，请在入园游玩当天至售票窗口凭购票短信开具并领取发票"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'singleHoliday',
    name: '普通单人年卡',
    price: 680,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '单人使用，节假日不可入园',
    tags: ['节假日不可用'],
    details: {
      bookingNotice: [
        "此年卡在节假日期间不可使用",
        "适用于单人，其他时间内有效"
      ],
      usageNotice: [
        "年卡有效期一年，持卡人完成支付及信息录入视为激活成功，激活之日即为年卡起效日期",
        "仅在非节假日期间有效"
      ],
      refundNotice: [
        "年卡激活后，除联系电话变更和身份证到期更换外，不办理持卡人其他信息的变更手续"
      ],
      invoiceNotice: [
        "持卡人如需发票，请在入园游玩当天至售票窗口凭购票短信开具并领取发票"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'doubleHoliday',
    name: '普通双人年卡',
    price: 1360,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '双人使用，节假日不可入园',
    tags: ['节假日不可用'],
    details: {
      bookingNotice: [
        "此年卡在节假日期间不可使用",
        "适用于双人，其他时间内有效"
      ],
      usageNotice: [
        "年卡有效期一年，持卡人完成支付及信息录入视为激活成功，激活之日即为年卡起效日期",
        "仅在非节假日期间有效"
      ],
      refundNotice: [
        "年卡激活后，除联系电话变更和身份证到期更换外，不办理持卡人其他信息的变更手续"
      ],
      invoiceNotice: [
        "持卡人如需发票，请在入园游玩当天至售票窗口凭购票短信开具并领取发票"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  },
  {
    key: 'childHoliday',
    name: '普通儿童年卡',
    price: 420,
    count: 0,
    imageUrl: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.hjP1xfzvAV2ZWmYdqIl2_QHaE8?rs=1&pid=ImgDetMain',
    description: '适用于1.2-1.5米儿童，节假日不可入园',
    tags: ['节假日不可用'],
    details: {
      bookingNotice: [
        "此年卡在节假日期间不可使用",
        "适用于1.2-1.5米儿童，其他时间内有效"
      ],
      usageNotice: [
        "年卡有效期一年，持卡人完成支付及信息录入视为激活成功，激活之日即为年卡起效日期",
        "仅在非节假日期间有效"
      ],
      refundNotice: [
        "年卡激活后，除联系电话变更和身份证到期更换外，不办理持卡人其他信息的变更手续"
      ],
      invoiceNotice: [
        "持卡人如需发票，请在入园游玩当天至售票窗口凭购票短信开具并领取发票"
      ],
      customerService: "如有疑问请拨打客服热线：400-102-6688"
    }
  }
];

// 默认日期格式
export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'; // 例如：2024-07-01

// 页面状态常量
export const PAGE_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// 价格单位（人民币）
export const CURRENCY_UNIT = '¥';

// 商品类型
export const ITEM_TYPES = {
  TICKET: 'ticket',   // 门票
  ANNUAL_CARD: 'annual_card', // 年卡
};

// 支付方式
export const PAYMENT_METHODS = {
  ALIPAY: '支付宝',
  WECHAT: '微信支付',
  CREDIT_CARD: '信用卡',
};

// 最大选择数量
export const MAX_SELECTION_COUNT = 10;

// 其他常量
export const MAX_DISCOUNT = 0.5; // 最大折扣50%
export const DEFAULT_DISCOUNT = 1.0; // 默认无折扣

// 结算页标题
export const SETTLEMENT_PAGE_TITLE = '订单结算';

// 提示信息
export const MESSAGES = {
  ADD_TO_CART_SUCCESS: '已成功添加到购物车',
  REMOVE_FROM_CART_SUCCESS: '已从购物车移除',
  EMPTY_CART: '购物车为空',
  INVALID_SELECTION: '无效选择',
  PLEASE_LOGIN: '请登录后进行购买',
  INSUFFICIENT_STOCK: '库存不足',
};

// 订单状态
export const ORDER_STATUS = {
  PENDING: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  DELIVERED: '已完成',
  CANCELED: '已取消',
};

