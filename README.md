# 野生动物园管理与导览系统

## 项目简介

这是一个综合性的野生动物园管理和导览系统。系统采用多端架构设计，包含微信小程序、Web管理后台、AI动物识别服务和后端API服务。系统为游客提供智能导览、安全预警、表演预约等功能，同时为园区管理人员提供数据统计和运营管理工具。

## 系统架构

### 前端应用
- **微信小程序** (`safaripark/`) - 游客端应用
- **Vue.js管理后台** (`hello/`) - 园区管理端

### 后端服务
- **Spring Boot API** (`demo/`) - 主要业务逻辑和数据库操作
- **Flask AI服务** (`animal_flask/`) - 动物识别AI服务

## 主要功能

### 游客端功能（微信小程序）
- 🗺️ **智能导览** - 基于GPS定位的园区导览
- ⚠️ **安全预警** - 实时危险区域检测和警告
- 🎭 **表演预约** - 动物表演在线预约
- 📊 **园区流量** - 实时查看各园区人流情况
- 🎧 **语音播报** - 园区介绍和动物知识播报
- 📍 **位置服务** - 精确的园区内定位导航

### 管理端功能（Vue.js后台）
- 📈 **数据统计** - 游客流量、预约数据统计
- 🎪 **表演管理** - 表演信息增删改查
- 🗺️ **园区管理** - 园区信息和地理范围管理
- ⚠️ **危险区域** - 危险区域设置和管理
- 👥 **用户管理** - 游客信息管理

### AI服务功能
- 🐾 **动物识别** - 基于YOLO模型的动物图像识别
- 📸 **实时检测** - 支持图片上传进行动物识别

## 技术栈

### 前端技术
- **微信小程序** - 原生小程序开发
- **Vue.js 2.6** - 前端框架
- **Element UI** - UI组件库
- **Axios** - HTTP客户端

### 后端技术
- **Spring Boot 2.7** - Java后端框架
- **MyBatis Plus** - ORM框架
- **MySQL 8.0** - 数据库
- **Flask** - Python Web框架
- **YOLO** - 目标检测模型

### 开发工具
- **Maven** - Java项目构建
- **npm** - Node.js包管理
- **Git** - 版本控制

## 项目结构

```
Wildlife-Park-Management-and-Guide-System/
├── safaripark/                 # 微信小程序
│   ├── pages/                  # 页面文件
│   ├── components/             # 组件文件
│   ├── common/                 # 公共配置
│   ├── utils/                  # 工具函数
│   ├── images/                 # 图片资源
│   ├── app.js                  # 小程序入口
│   ├── app.json                # 小程序配置
│   └── database.sql            # 数据库结构
├── hello/                      # Vue.js管理后台
│   ├── src/                    # 源代码
│   ├── public/                 # 静态资源
│   ├── package.json            # 依赖配置
│   └── vue.config.js           # Vue配置
├── demo/                       # Spring Boot后端
│   ├── src/                    # 源代码
│   ├── pom.xml                 # Maven配置
│   └── target/                 # 编译输出
└── animal_flask/               # Flask AI服务
    ├── models/                 # AI模型文件
    └── app.py                  # Flask应用
```

## 快速开始

### 环境要求
- Node.js 14+
- Java 8+
- Python 3.7+
- MySQL 8.0+
- 微信开发者工具

### 安装步骤

#### 1. 数据库初始化
```sql
# 导入数据库结构
mysql -u root -p < safaripark/database.sql
```

#### 2. 启动Spring Boot后端
```bash
cd demo
mvn spring-boot:run
```

#### 3. 启动Vue.js管理后台
```bash
cd hello
npm install
npm run serve
```

#### 4. 启动Flask AI服务
```bash
cd animal_flask
pip install -r requirements.txt
python app.py
```

#### 5. 配置微信小程序
- 使用微信开发者工具打开 `safaripark/` 目录
- 配置AppID和服务器域名
- 编译运行

## 核心特性

### 实时定位与安全预警
- 基于GPS的实时位置追踪
- 危险区域自动检测
- 智能警告推送

### 智能导览系统
- 个性化推荐路线
- 语音播报功能
- 园区流量实时显示

### AI动物识别
- 高精度动物识别
- 支持多种动物种类
- 实时检测响应

### 数据可视化
- 游客流量统计
- 预约数据分析
- 运营报表生成

## 数据库设计

系统采用关系型数据库设计，主要包含以下核心表：
- `zoos` - 动物园信息
- `parks` - 园区信息
- `performances` - 动物表演
- `danger_zones` - 危险区域
- `park_traffic` - 园区流量
- `park_poi` - 点位信息

## 部署说明

### 生产环境部署
1. 配置MySQL数据库连接
2. 部署Spring Boot应用到服务器
3. 配置Nginx反向代理
4. 部署Vue.js应用到Web服务器
5. 配置微信小程序服务器域名

### 环境变量配置
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=test
DB_USER=root
DB_PASSWORD=your_password

# 微信小程序配置
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret
```

## 开发团队

- 前端开发：微信小程序 + Vue.js
- 后端开发：Spring Boot + Flask
- AI算法：YOLO目标检测
- 数据库设计：MySQL关系型数据库

## 许可证

本项目采用 MIT 许可证。

## 联系方式
dryhtenofficial@163.com
如有问题或建议，请联系开发团队。 