-- 动物园表
CREATE TABLE zoos (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- 动物园ID
    name VARCHAR(255) NOT NULL,           -- 动物园名称
    city VARCHAR(100) NOT NULL,           -- 所在城市
    address VARCHAR(255) NOT NULL,        -- 详细地址
    opening_hours VARCHAR(255),           -- 开放时间
    contact_phone VARCHAR(20),            -- 联系电话
    description TEXT,                     -- 动物园简介
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='动物园表';

-- 园区信息表
CREATE TABLE parks (
    id INT AUTO_INCREMENT PRIMARY KEY, -- 园区ID
    zoo_id INT NOT NULL,              -- 所属动物园ID
    name VARCHAR(255) NOT NULL,        -- 园区名称
    background TEXT,                   -- 背景信息
    features TEXT,                     -- 特色景点
    animal_distribution JSON,          -- 动物分布
    audio_guide TEXT,                  -- 语音播报介绍
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (zoo_id) REFERENCES zoos(id) ON DELETE CASCADE -- 外键约束
) COMMENT='园区信息表';

-- 动物表演表
CREATE TABLE performances (
    id INT AUTO_INCREMENT PRIMARY KEY,           -- 表演ID
    zoo_id INT NOT NULL,                         -- 所属动物园ID
    title VARCHAR(255) NOT NULL,                 -- 表演名称（如：小火车课堂、鸟类展示）
    duration VARCHAR(50) NOT NULL,               -- 演出时长（如：30分钟）
    location VARCHAR(255) NOT NULL,              -- 演出地点（如：乘车游览区）
    description TEXT,                            -- 演出简介
    image_url VARCHAR(512),                      -- 表演图片URL
    park_id INT NOT NULL,                        -- 所属园区ID
    show_time TIME NOT NULL,                     -- 表演时间（如：10:00）
    show_date DATE NOT NULL,                     -- 表演日期
    status TINYINT DEFAULT 1,                    -- 表演状态（1-正常，0-取消）
    max_capacity INT,                            -- 最大预约人数
    current_bookings INT DEFAULT 0,              -- 当前预约人数
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE,
    FOREIGN KEY (zoo_id) REFERENCES zoos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动物表演表';

-- 园区流量表
CREATE TABLE park_traffic (
    id INT AUTO_INCREMENT PRIMARY KEY, -- 流量统计ID
    zoo_id INT NOT NULL,              -- 所属动物园ID
    park_id INT NOT NULL,              -- 园区ID
    current_people INT NOT NULL,       -- 当前园区内人数
    queue_people INT NOT NULL,         -- 当前排队人数
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新时间
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE, -- 外键约束
    FOREIGN KEY (zoo_id) REFERENCES zoos(id) ON DELETE CASCADE -- 外键约束
) COMMENT='园区流量表';

-- 园区地理范围表
CREATE TABLE park_geometries (
    id INT AUTO_INCREMENT PRIMARY KEY, -- 园区地理范围ID
    zoo_id INT NOT NULL,              -- 所属动物园ID
    park_id INT NOT NULL,              -- 园区ID（外键）
    geometry TEXT,                     -- 园区地理范围（多边形）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE, -- 外键约束
    FOREIGN KEY (zoo_id) REFERENCES zoos(id) ON DELETE CASCADE -- 外键约束
) COMMENT='园区地理范围表';

-- 危险区域表
CREATE TABLE danger_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- 危险区域ID
    zoo_id INT NOT NULL,                  -- 所属动物园ID
    name VARCHAR(100) NOT NULL,           -- 危险区域名称
    description TEXT,                     -- 危险区域描述
    geometry TEXT NOT NULL,               -- 危险区域地理范围（多边形坐标）
    risk_level TINYINT NOT NULL,         -- 危险等级（1-低风险，2-中风险，3-高风险）
    status TINYINT DEFAULT 1,            -- 状态（0-已解除，1-生效中）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新时间
    created_by VARCHAR(50),              -- 创建人
    updated_by VARCHAR(50),              -- 更新人
    FOREIGN KEY (zoo_id) REFERENCES zoos(id) ON DELETE CASCADE -- 外键约束
) COMMENT='危险区域表';

-- 点位信息表
CREATE TABLE park_poi (
    id VARCHAR(32) PRIMARY KEY,
    zoo_id INT NOT NULL,              -- 所属动物园ID
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    category VARCHAR(100),
    address VARCHAR(255),
    FOREIGN KEY (zoo_id) REFERENCES zoos(id) ON DELETE CASCADE -- 外键约束
) COMMENT='点位信息表'; 