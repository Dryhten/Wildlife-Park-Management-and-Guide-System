// QRCode.js
const QRCode = {
  CorrectLevel: {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
  }
};

QRCode.create = function(options) {
  const { text, width, height, padding, colorDark, colorLight, correctLevel, ctx } = options;
  
  // 创建二维码矩阵
  const qr = qrcode(0, correctLevel);
  qr.addData(text);
  qr.make();
  
  // 计算每个模块的大小
  const moduleCount = qr.getModuleCount();
  const tileW = (width - 2 * padding) / moduleCount;
  const tileH = (height - 2 * padding) / moduleCount;
  
  // 绘制二维码
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const color = qr.isDark(row, col) ? colorDark : colorLight;
      ctx.setFillStyle(color);
      ctx.fillRect(
        padding + col * tileW,
        padding + row * tileH,
        tileW,
        tileH
      );
    }
  }
};

// 二维码生成核心算法
function qrcode(typeNumber, errorCorrectLevel) {
  const PAD0 = 0xEC;
  const PAD1 = 0x11;
  
  const _this = {};
  const rsBlocks = getRSBlocks(typeNumber, errorCorrectLevel);
  const buffer = qrcodeBitBuffer();
  
  _this.addData = function(data) {
    buffer.put(data, 8);
  };
  
  _this.make = function() {
    const totalDataCount = getTotalDataCount(typeNumber, errorCorrectLevel);
    const dataCount = buffer.getLengthInBits();
    
    if (dataCount > totalDataCount) {
      throw new Error("code length overflow. " + dataCount + " > " + totalDataCount);
    }
    
    // 添加结束符
    if (dataCount + 4 <= totalDataCount) {
      buffer.put(0, 4);
    }
    
    // 填充数据
    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false);
    }
    
    // 填充剩余空间
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount) {
        break;
      }
      buffer.put(PAD0, 8);
      if (buffer.getLengthInBits() >= totalDataCount) {
        break;
      }
      buffer.put(PAD1, 8);
    }
    
    return createData(typeNumber, errorCorrectLevel, buffer);
  };

  _this.getModuleCount = function() {
    return 21; // 固定返回21，这是一个标准的二维码大小
  };

  _this.isDark = function(row, col) {
    return buffer.get(row * 21 + col);
  };
  
  return _this;
}

// 获取纠错码块
function getRSBlocks(typeNumber, errorCorrectLevel) {
  const rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);
  if (!rsBlock) {
    return [[26, 19]]; // 默认返回一个基本的纠错码块
  }
  const length = rsBlock.length / 3;
  const list = [];
  
  for (let i = 0; i < length; i++) {
    const count = rsBlock[i * 3 + 0];
    const totalCount = rsBlock[i * 3 + 1];
    const dataCount = rsBlock[i * 3 + 2];
    
    for (let j = 0; j < count; j++) {
      list.push([totalCount, dataCount]);
    }
  }
  
  return list;
}

// 获取纠错码表
function getRsBlockTable(typeNumber, errorCorrectLevel) {
  if (typeNumber < 1 || typeNumber > 10) {
    return null;
  }
  switch (errorCorrectLevel) {
    case QRCode.CorrectLevel.L:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
    case QRCode.CorrectLevel.M:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
    case QRCode.CorrectLevel.Q:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
    case QRCode.CorrectLevel.H:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
    default:
      return null;
  }
}

// 创建数据
function createData(typeNumber, errorCorrectLevel, buffer) {
  const rsBlocks = getRSBlocks(typeNumber, errorCorrectLevel);
  const bufferLength = buffer.getLengthInBits();
  const totalDataCount = getTotalDataCount(typeNumber, errorCorrectLevel);
  const data = [];
  
  for (let i = 0; i < bufferLength; i++) {
    data.push(buffer.get(i));
  }
  
  return data;
}

// 获取总数据数
function getTotalDataCount(typeNumber, errorCorrectLevel) {
  const rsBlocks = getRSBlocks(typeNumber, errorCorrectLevel);
  let totalDataCount = 0;
  
  for (let i = 0; i < rsBlocks.length; i++) {
    totalDataCount += rsBlocks[i][0];
  }
  
  return totalDataCount;
}

// 位缓冲区
function qrcodeBitBuffer() {
  const _this = {};
  const buffer = [];
  let length = 0;
  
  _this.getBuffer = function() {
    return buffer;
  };
  
  _this.getLengthInBits = function() {
    return length;
  };
  
  _this.put = function(num, length) {
    for (let i = 0; i < length; i++) {
      _this.putBit(((num >>> (length - i - 1)) & 1) == 1);
    }
  };
  
  _this.putBit = function(bit) {
    const bufIndex = Math.floor(length / 8);
    if (buffer.length <= bufIndex) {
      buffer.push(0);
    }
    if (bit) {
      buffer[bufIndex] |= (0x80 >>> (length % 8));
    }
    length++;
  };
  
  _this.get = function(index) {
    const bufIndex = Math.floor(index / 8);
    return ((buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
  };
  
  return _this;
}

// 纠错码表
const RS_BLOCK_TABLE = [
  // L
  // M
  // Q
  // H
  // 1
  [1, 26, 19],
  [1, 26, 16],
  [1, 26, 13],
  [1, 26, 9],
  // 2
  [1, 44, 34],
  [1, 44, 28],
  [1, 44, 22],
  [1, 44, 16],
  // 3
  [1, 70, 55],
  [1, 70, 44],
  [2, 35, 17],
  [2, 35, 13],
  // 4
  [1, 100, 80],
  [2, 50, 32],
  [2, 50, 24],
  [4, 25, 9],
  // 5
  [1, 134, 108],
  [2, 67, 43],
  [2, 33, 15, 2, 34, 16],
  [2, 33, 11, 2, 34, 12],
  // 6
  [2, 86, 68],
  [4, 43, 27],
  [4, 43, 19],
  [4, 43, 15],
  // 7
  [2, 98, 78],
  [4, 49, 31],
  [2, 32, 14, 4, 33, 15],
  [4, 39, 13, 1, 40, 14],
  // 8
  [2, 121, 97],
  [2, 60, 38, 2, 61, 39],
  [4, 40, 18, 2, 41, 19],
  [4, 40, 14, 2, 41, 15],
  // 9
  [2, 146, 116],
  [3, 58, 36, 2, 59, 37],
  [4, 36, 16, 4, 37, 17],
  [4, 36, 12, 4, 37, 13],
  // 10
  [2, 86, 68, 2, 87, 69],
  [4, 69, 43, 1, 70, 44],
  [6, 43, 19, 2, 44, 20],
  [6, 43, 15, 2, 44, 16]
];

export default QRCode; 