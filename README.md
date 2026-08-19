# 如意城市 —— 城市生活指南平台 · 项目总结文档

> 一个帮助用户「选城市、看城市、比城市、聊城市」的全栈 Web 应用。

---

## 目录

1. [技术栈与框架图](#1-技术栈与框架图)
2. [系统需求分析](#2-系统需求分析)
3. [系统总体设计](#3-系统总体设计)
4. [系统实现](#4-系统实现)
5. [工作总结](#5-工作总结)

---

## 1. 技术栈与框架图

### 1.1 技术栈总览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端框架** | React 18 + TypeScript | 组件化开发，类型安全 |
| **构建工具** | Vite 6 | 极速 HMR，ESM 原生支持 |
| **路由** | React Router 7 | 声明式路由，嵌套路由 |
| **状态管理** | Zustand 5 | 轻量级全局状态管理 |
| **样式方案** | Tailwind CSS 3 + clsx + tailwind-merge | 原子化 CSS，条件类名合并 |
| **图表库** | ECharts 5 (echarts-for-react) | 雷达图、数据可视化 |
| **图标库** | Lucide React | 轻量 SVG 图标 |
| **后端框架** | Express 4 (Node.js) | RESTful API 服务 |
| **数据库** | MySQL 8 + mysql2 | 关系型数据库，连接池 |
| **文件上传** | Multer | 多图上传，磁盘存储 |
| **运行时** | tsx (开发) / tsc (编译) | TypeScript 直接执行 |

### 1.2 技术框架图

```
┌─────────────────────────────────────────────────────────────────┐
│                        浏览器 (Browser)                          │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐      │
│  │  React UI │  │  Router  │  │ Zustand  │  │  ECharts  │      │
│  │ Component │  │  Routes  │  │  Store   │  │  Charts   │      │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └───────────┘      │
│        │              │              │                            │
│        └──────────┬───┴──────────────┘                           │
│                   │  Axios / fetch                                │
│                   ▼                                               │
├───────────────────────────────────────────────────────────────────┤
│                     Vite Dev Server (:5173)                       │
│                   代理 /api → Express (:3000)                     │
├───────────────────────────────────────────────────────────────────┤
│                      Express 后端 (:3000)                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ Cities │ │ Users  │ │Reviews │ │ Notes  │ │ Admin  │  ...    │
│  │ Route  │ │ Route  │ │ Route  │ │ Route  │ │ Route  │         │
│  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘         │
│      └──────────┴──────────┴──────────┴──────────┘               │
│                         │  mysql2/promise                          │
│                         ▼                                         │
├───────────────────────────────────────────────────────────────────┤
│                      MySQL 8 数据库                                │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌────────────┐  │
│  │cities│ │users │ │reviews │ │notes │ │admins│ │note_likes  │  │
│  └──────┘ └──────┘ └────────┘ └──────┘ └──────┘ └────────────┘  │
│  ┌──────────────┐                                                 │
│  │announcements │                                                 │
│  └──────────────┘                                                 │
└───────────────────────────────────────────────────────────────────┘
```

### 1.3 前端目录结构

```
src/
├── App.tsx                  # 根组件 + 路由注册
├── main.tsx                 # 入口文件
├── components/
│   ├── layout/              # 布局组件 (Navbar, Footer, AIAssistant, CreateNoteModal...)
│   └── ui/                  # UI 组件 (NoteCard, CityCard, RadarChart, Pagination...)
├── pages/                   # 页面组件
│   ├── Home.tsx             # 首页
│   ├── SmartMatch.tsx       # 智能匹配
│   ├── MatchResult.tsx      # 匹配结果
│   ├── CityList.tsx         # 城市大全
│   ├── CityDetail.tsx       # 城市详情
│   ├── CityCompare.tsx      # 城市对比
│   ├── Community.tsx        # 分享社区
│   ├── NoteDetail.tsx       # 笔记详情
│   ├── MapView.tsx          # 地图视图
│   ├── Login.tsx / Register.tsx
│   ├── Profile*.tsx         # 个人中心
│   └── admin/               # 后台管理
├── store/                   # Zustand 状态管理
│   ├── useCityStore.ts      # 城市数据
│   ├── useUserStore.ts      # 用户认证
│   ├── useCompareStore.ts   # 对比列表
│   ├── useMatchStore.ts     # 匹配偏好
│   └── useUIStore.ts        # UI 状态 (Toast等)
├── lib/api.ts               # API 封装层
├── utils/                   # 工具函数 (matching算法, helpers)
└── types/index.ts           # TypeScript 类型定义
```

---

## 2. 系统需求分析

### 2.1 可行性分析

| 维度 | 分析 |
|------|------|
| **技术可行性** | React + Express + MySQL 是成熟的主流技术栈，社区资源丰富，Vite 构建工具开发体验优秀，完全能够支撑本项目所有功能需求 |
| **经济可行性** | 全部采用开源技术，无授权费用。开发环境基于本地 MySQL + Node.js，部署可使用轻量云服务器，成本极低 |
| **操作可行性** | 前端采用 Tailwind CSS 响应式设计，兼容桌面与移动端；后台管理界面操作直观，管理门槛低 |
| **社会可行性** | 城市选择是当代年轻人高频需求（就业、定居、旅游），平台具有实际社会价值 |

### 2.2 功能性需求

#### 2.2.1 用例图

```
                    ┌─────────────────────────────────────────┐
                    │           如意城市系统                     │
                    │                                         │
                    │  ┌─────────┐  ┌──────────┐  ┌────────┐  │
                    │  │智能匹配  │  │ 城市大全  │  │城市对比 │  │
                    │  └────┬────┘  └────┬─────┘  └───┬────┘  │
                    │       │            │             │       │
                    │  ┌────┴────┐ ┌─────┴────┐ ┌────┴────┐  │
                    │  │分享社区  │ │ 城市详情  │ │地图视图 │  │
                    │  └────┬────┘ └─────┬────┘ └────┬────┘  │
                    │       │            │             │       │
                    │  ┌────┴────┐ ┌─────┴────┐              │
                    │  │笔记详情  │ │ 个人中心  │              │
                    │  └─────────┘ └──────────┘              │
                    │                                         │
                    │  ┌─────────────────────────────────┐    │
                    │  │        后台管理系统               │    │
                    │  │  城市/用户/评价/笔记/公告管理     │    │
                    │  └─────────────────────────────────┘    │
                    └─────────────────────────────────────────┘
          注册/登录                      管理后台
     ┌───────────┐                  ┌───────────┐
     │  普通用户  │──────────────────│  管理员   │
     └───────────┘                  └───────────┘
```

#### 2.2.2 功能模块说明

| 模块 | 子功能 | 描述 |
|------|--------|------|
| **智能匹配** | 偏好设置 | 用户设置房价预算、期望薪资、11维权重滑块、特殊要求 |
| | 匹配算法 | 加权评分 + 硬性条件过滤，输出 Top 城市排名 |
| | 结果展示 | 雷达图对比、匹配分数、城市卡片 |
| **城市大全** | 列表展示 | 卡片式布局，支持省份/城市等级筛选、搜索 |
| | 城市详情 | 基本信息、11维雷达图、房价薪资数据、用户评价 |
| | 地图视图 | ECharts 地图可视化，点击城市可跳转详情 |
| **城市对比** | 对比清单 | 侧边栏胶囊组件，最多选 4 个城市 |
| | 对比详情 | 抽屉式面板，多维度数据表格 + 雷达图叠加 |
| **分享社区** | 瀑布流浏览 | CSS columns 响应式瀑布流，城市筛选 + 排序 |
| | 发布笔记 | 多图上传(最多9张) + 绑定城市 + 标题/内容 |
| | 笔记详情 | 图片画廊(Lightbox) + 点赞 + 作者信息 |
| **用户系统** | 注册/登录 | 手机号注册，JWT-like 会话 |
| | 个人中心 | 资料修改、收藏城市、浏览历史、我的评价 |
| **后台管理** | 仪表盘 | 数据统计卡片 + 快捷操作 |
| | 内容管理 | 城市/用户/评价/笔记/公告 CRUD + 审核 |
| **AI 助手** | 智能对话 | 基于后端 chat 路由的城市咨询 AI 对话 |

### 2.3 非功能性需求

| 需求类型 | 要求 |
|---------|------|
| **性能** | 首屏加载 < 3s；API 响应 < 500ms；图片懒加载；分页查询 |
| **安全** | SQL 参数化查询防注入；用户身份校验；管理员权限隔离；点赞防重复(唯一索引) |
| **可用性** | 响应式布局兼容移动端；Toast 友好提示；空状态引导；加载骨架 |
| **可维护性** | TypeScript 类型安全；模块化组件拆分；统一 API 封装层 |
| **可扩展性** | RESTful API 设计；数据库表预留扩展字段；组件化便于复用 |

### 2.4 需求建模 —— UML 用例图

```
┌──────────┐                        ┌───────────────┐
│          │──── 注册/登录 ────────▶│  用户认证模块   │
│          │                        └───────────────┘
│          │                        ┌───────────────┐
│          │──── 设置匹配偏好 ─────▶│  智能匹配模块   │
│          │         ┌── 查看结果──▶│               │
│  普通用户 │         │              └───────────────┘
│          │         │              ┌───────────────┐
│          │──── 浏览城市 ─────────▶│  城市信息模块   │
│          │         ├── 查看详情──▶│               │
│          │         ├── 查看地图──▶│               │
│          │         └── 查看评价──▶│               │
│          │                        └───────────────┘
│          │                        ┌───────────────┐
│          │──── 发布笔记 ─────────▶│  社区分享模块   │
│          │         ├── 浏览笔记──▶│               │
│          │         ├── 点赞笔记──▶│               │
│          │         └── 查看详情──▶│               │
│          │                        └───────────────┘
│          │                        ┌───────────────┐
│          │──── 添加对比 ─────────▶│  城市对比模块   │
│          │         └── 查看对比──▶│               │
└──────────┘                        └───────────────┘

┌──────────┐                        ┌───────────────┐
│          │──── 管理城市 ─────────▶│               │
│          │──── 管理用户 ─────────▶│  后台管理模块   │
│  管理员   │──── 审核评价 ─────────▶│               │
│          │──── 审核笔记 ─────────▶│               │
│          │──── 发布公告 ─────────▶│               │
└──────────┘                        └───────────────┘
```

---

## 3. 系统总体设计

### 3.1 系统总体架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (Frontend)                       │
│                   React + TypeScript                     │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  View Layer │  │ State Layer  │  │  API Layer    │  │
│  │  (Pages &   │──│  (Zustand    │──│  (lib/api.ts) │  │
│  │  Components)│  │   Stores)    │  │               │  │
│  └─────────────┘  └──────────────┘  └───────┬───────┘  │
│                                            │            │
└────────────────────────────────────────────┼────────────┘
                                             │ HTTP / REST
                                             ▼
┌─────────────────────────────────────────────────────────┐
│                    后端 (Backend)                        │
│                   Express + TypeScript                   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Middleware  │  │    Routes    │  │   Database   │  │
│  │  (CORS,JSON, │──│  (8 modules) │──│   (MySQL)    │  │
│  │   Static)    │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              路由模块                              │   │
│  │  cities │ users │ reviews │ notes │ admin │      │   │
│  │  announcements │ upload │ chat                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**架构特点**：
- **前后端分离**：前端 Vite Dev Server 通过代理转发 API 请求到 Express
- **三层架构**：View（组件）→ Store（状态）→ API（请求），职责清晰
- **统一 API 封装**：`lib/api.ts` 封装所有 HTTP 请求，组件不直接调用 fetch
- **路由模块化**：后端按业务域拆分为 8 个独立路由文件

### 3.2 功能模块划分

```
如意城市平台
│
├── 前台用户端
│   ├── 首页模块 ────────── Hero展示 + 热门城市 + 公告
│   ├── 智能匹配模块 ────── 偏好设置 + 加权算法 + 结果展示
│   ├── 城市信息模块 ────── 列表 + 详情 + 地图 + 评价
│   ├── 城市对比模块 ────── 对比清单 + 多维数据对比
│   ├── 分享社区模块 ────── 瀑布流 + 发布笔记 + 详情
│   ├── 用户中心模块 ────── 登录注册 + 资料管理 + 收藏
│   └── AI助手模块 ──────── 智能城市咨询对话
│
└── 后台管理端
    ├── 仪表盘 ──────────── 数据统计 + 快捷入口
    ├── 城市管理 ─────────── CRUD + 数据编辑
    ├── 用户管理 ─────────── 查看 + 禁用/启用
    ├── 评价审核 ─────────── 列表 + 审核通过/拒绝
    ├── 笔记管理 ─────────── 列表 + 审核 + 批量操作
    └── 公告管理 ─────────── 发布 + 编辑 + 上下线
```

### 3.3 数据库设计

#### 3.3.1 ER 图

```
┌──────────────┐         ┌──────────────┐
│    cities    │         │    users     │
├──────────────┤         ├──────────────┤
│ id (PK)      │◀───┐    │ id (PK)      │
│ name         │    │    │ username     │
│ province     │    │    │ phone (UQ)   │
│ level        │    │    │ password     │
│ image        │    │    │ avatar       │
│ overall_score│    │    │ favorites(JSON)│
│ housing_price│    │    │ is_disabled  │
│ ...11项评分  │    │    │ created_at   │
│ tags (JSON)  │    │    └──────┬───────┘
└──────┬───────┘    │           │
       │            │           │
       │     ┌──────┴───────┐   │
       │     │   reviews    │   │
       │     ├──────────────┤   │
       ├─────│ city_id (FK) │   │
       │     │ user_id (FK) │◀──┤
       │     │ rating       │   │
       │     │ content      │   │
       │     │ is_approved  │   │
       │     └──────────────┘   │
       │                        │
       │     ┌──────────────┐   │
       ├─────│    notes     │   │
       │     ├──────────────┤   │
       │     │ city_id (FK) │   │
       │     │ user_id (FK) │◀──┤
       │     │ title        │   │
       │     │ content      │   │
       │     │ images(JSON) │   │
       │     │ like_count   │   │
       │     │ view_count   │   │
       │     │ is_approved  │   │
       │     └──────┬───────┘   │
       │            │            │
       │     ┌──────┴───────┐   │
       │     │ note_likes   │   │
       │     ├──────────────┤   │
       │     │ note_id (FK) │◀──┤
       │     │ user_id (FK) │◀──┘
       │     │ (UQ:note+user)│
       │     └──────────────┘
       │
       │     ┌──────────────┐
       ├─────│announcements │
       │     ├──────────────┤
       │     │ id (PK)      │
       │     │ title        │
       │     │ content      │
       │     │ is_active    │
       │     └──────────────┘
       │
       │     ┌──────────────┐
       └─────│   admins     │
             ├──────────────┤
             │ id (PK)      │
             │ username(UQ) │
             │ password     │
             └──────────────┘
```

#### 3.3.2 表结构设计

**cities 城市表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(32) PK | 城市ID |
| name | VARCHAR(50) | 城市名称 |
| province | VARCHAR(50) | 所属省份 |
| level | ENUM | 城市等级(first/new-first/second/third-fourth) |
| image / banner_image | TEXT | 列表图 / Banner图 |
| description | TEXT | 城市描述 |
| overall_score | DECIMAL(3,1) | 综合评分 |
| housing_price | INT | 房价(元/㎡) |
| average_salary | INT | 平均薪资 |
| price_level | DECIMAL(3,1) | 物价指数 |
| education/medical/transportation/employment_score | DECIMAL(3,1) | 4项基础设施评分 |
| air_quality/greening/life_pace/climate_score | DECIMAL(3,1) | 4项环境评分 |
| tags | JSON | 标签数组 |
| is_coastal / has_mountains / is_historical | BOOLEAN | 地理特征 |

**users 用户表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(32) PK | 用户ID |
| username | VARCHAR(50) | 用户名 |
| phone | VARCHAR(20) UQ | 手机号(登录凭证) |
| password | VARCHAR(255) | 密码 |
| avatar | TEXT | 头像URL |
| favorites | JSON | 收藏城市ID数组 |
| is_disabled | BOOLEAN | 是否禁用 |

**notes 笔记表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(32) PK | 笔记ID |
| user_id | VARCHAR(32) | 作者ID (索引) |
| username / user_avatar | VARCHAR/TEXT | 冗余作者信息 |
| city_id | VARCHAR(32) | 绑定城市ID (索引) |
| city_name | VARCHAR(50) | 冗余城市名 |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 正文 |
| images | JSON | 图片URL数组 |
| like_count / comment_count / view_count | INT | 互动数据 |
| is_approved | BOOLEAN | 审核状态 |
| created_at / updated_at | TIMESTAMP | 时间戳 |

**note_likes 点赞表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(32) PK | 记录ID |
| note_id | VARCHAR(32) | 笔记ID (索引) |
| user_id | VARCHAR(32) | 用户ID (索引) |
| UNIQUE KEY | (note_id, user_id) | 联合唯一，防重复点赞 |

**reviews / announcements / admins** 表结构见 ER 图，此处不再赘述。

### 3.4 接口设计

#### 3.4.1 后端 API 总览

| 模块 | 前缀 | 主要接口 |
|------|------|---------|
| 城市 | `/api/cities` | `GET /` 列表, `GET /:id` 详情 |
| 用户 | `/api/users` | `POST /register`, `POST /login`, `GET /:id`, `PUT /:id` |
| 评价 | `/api/reviews` | `GET /?cityId=`, `POST /`, `PUT /:id/approve` |
| 笔记 | `/api/notes` | `GET /` 列表, `GET /:id` 详情, `POST /` 发布, `POST /upload-images`, `POST /:id/like`, `DELETE /:id` |
| 管理 | `/api/admin` | `POST /login`, `GET /dashboard`, `GET/DELETE /notes`, `POST /notes/:id/approve`, `POST /notes/batch-*` |
| 公告 | `/api/announcements` | `GET /`, `POST /`, `PUT /:id` |
| 上传 | `/api/upload` | `POST /image` 单图, `POST /images` 多图 |
| AI对话 | `/api/chat` | `POST /` 流式对话 |

#### 3.4.2 核心 API 说明 —— 笔记模块

```
GET /api/notes
  Query: cityId, sort(latest|hot|popular), page, pageSize, userId
  Response: { list: Note[], total, page, pageSize, hasMore }

GET /api/notes/:id
  Query: userId
  Response: Note (含 isLiked 状态, viewCount 自动+1)

POST /api/notes
  Body: { userId, username, userAvatar, cityId, title, content, images[] }
  Response: Note (后端校验城市存在性, 覆盖前端传入的冗余字段)

POST /api/notes/upload-images
  FormData: images[] (最多9张, 单张5MB, jpg/png/webp/gif)
  Response: { urls: string[] }

POST /api/notes/:id/like
  Body: { userId }
  Response: { liked: boolean, likeCount: number }
  (利用唯一索引防重复, 幂等切换)

DELETE /api/notes/:id
  Body: { userId }
  (事务: 先删note_likes, 再删notes)
```

---

## 4. 系统实现

### 4.1 开发环境搭建

```bash
# 1. 前端依赖安装
npm install

# 2. 后端依赖安装
cd server && npm install

# 3. 配置数据库连接
#    编辑 server/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=ruyi_city

# 4. 初始化数据库 (建库 + 建表 + 导入种子数据)
cd server && npm run init-db

# 5. 启动后端 (端口 3000)
npm run dev    # tsx watch 热重载

# 6. 启动前端 (端口 5173)
cd .. && npm run dev
```

**环境要求**：Node.js >= 18, MySQL >= 8.0, npm >= 9

### 4.2 核心模块详细实现

#### 4.2.1 智能匹配算法

基于加权评分模型，用户设置 11 个维度的权重，算法对每个城市计算综合匹配分数。

```typescript
// src/utils/matching.ts

// 归一化：将原始值映射到 0~10 区间
const normalizeScore = (value: number, min: number, max: number, reverse: boolean = false): number => {
  let score = ((value - min) / (max - min)) * 10;
  score = Math.max(0, Math.min(10, score));
  return reverse ? 10 - score : score;  // 房价越低分越高(reverse=true)
};

export const calculateMatchScore = (city: City, preferences: MatchPreferences): number => {
  const totalWeight = housingWeight + salaryWeight + ... + climateWeight;
  if (totalWeight === 0) return city.overallScore;

  const housingScore = normalizeScore(city.housingPrice, 5000, 80000, true);
  const salaryScore  = normalizeScore(city.averageSalary, 5000, 20000);
  const priceScore   = 10 - city.priceLevel;

  let totalScore = 0;
  totalScore += housingScore * housingWeight;
  totalScore += salaryScore * salaryWeight;
  // ... 11个维度加权求和

  return totalScore / totalWeight;  // 归一化到 0~10
};

// 先过滤不满足硬性条件的城市，再计算匹配分排序
export const matchCities = (cities, preferences) => {
  const filtered = filterCities(cities, preferences);  // 房价上限、期望薪资、特殊要求
  return filtered
    .map(city => ({ city, score: calculateMatchScore(city, preferences) }))
    .sort((a, b) => b.score - a.score);
};
```

#### 4.2.2 瀑布流社区 + 多图上传

**瀑布流布局** —— CSS columns 实现：

```tsx
// src/pages/Community.tsx
<div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
  {notes.map((note) => (
    <NoteCard key={note.id} note={note} onNoteChange={handleNoteChange} />
  ))}
</div>

// src/components/ui/NoteCard.tsx —— 卡片防断裂
<div className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-white ...">
```

**多图上传** —— Multer 后端 + 前端 FormData：

```typescript
// server/src/routes/notes.ts
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },  // 单张 5MB
});

router.post('/upload-images', upload.array('images', 9), (req, res) => {
  const urls = (req.files as any[]).map(f => `/uploads/${f.filename}`);
  res.json({ urls });
});
```

```tsx
// src/components/layout/CreateNoteModal.tsx
const handleFiles = async (files: FileList | null) => {
  const remaining = MAX_IMAGES - images.length;  // MAX_IMAGES = 9
  if (remaining <= 0) { showToast(`最多上传 ${MAX_IMAGES} 张图片`, 'warning'); return; }
  const toUpload = Array.from(files).slice(0, remaining);
  const urls = await noteApi.uploadImages(toUpload);
  setImages(prev => [...prev, ...urls]);
};
```

#### 4.2.3 笔记发布与城市绑定

发布笔记时必须选择城市，后端校验城市存在性并覆盖冗余字段：

```typescript
// server/src/routes/notes.ts — POST /
router.post('/', async (req, res) => {
  const { userId, cityId, title, content, images } = req.body;

  // 1. 校验必填字段
  if (!userId || !cityId || !title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: '信息不完整' });
  }

  // 2. 查城市是否存在，用 DB 真实值覆盖前端传值（防伪造）
  const [cityRows] = await pool.query('SELECT name FROM cities WHERE id = ? LIMIT 1', [cityId]);
  if (cityRows.length === 0) return res.status(400).json({ error: '城市不存在' });
  const cityName = cityRows[0].name;

  // 3. 查用户信息，用 DB 真实值覆盖
  const [userRows] = await pool.query('SELECT username, avatar FROM users WHERE id = ? LIMIT 1', [userId]);

  // 4. 插入笔记
  const id = String(Date.now());
  await pool.query(
    `INSERT INTO notes (id, user_id, username, user_avatar, city_id, city_name, title, content, images)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, username, avatar, cityId, cityName, title, content, JSON.stringify(images || [])]
  );
  res.json(rowToNote(insertedNote));
});
```

#### 4.2.4 点赞防重复

利用数据库唯一索引实现幂等点赞：

```typescript
// server/src/routes/notes.ts — POST /:id/like
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(401).json({ error: '请先登录' });

  try {
    // 尝试插入点赞记录
    await pool.query(
      'INSERT INTO note_likes (id, note_id, user_id) VALUES (?, ?, ?)',
      [String(Date.now()), id, userId]
    );
    // 新增点赞
    await pool.query('UPDATE notes SET like_count = like_count + 1 WHERE id = ?', [id]);
    res.json({ liked: true, likeCount: newCount });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      // 已点赞 → 取消点赞
      await pool.query('DELETE FROM note_likes WHERE note_id = ? AND user_id = ?', [id, userId]);
      await pool.query('UPDATE notes SET like_count = like_count - 1 WHERE id = ?', [id]);
      res.json({ liked: false, likeCount: newCount });
    }
  }
});
```

#### 4.2.5 城市对比雷达图

```tsx
// src/components/ui/RadarChart.tsx
import ReactECharts from 'echarts-for-react';

const indicators = [
  { name: '教育', max: 10 }, { name: '医疗', max: 10 },
  { name: '交通', max: 10 }, { name: '就业', max: 10 },
  { name: '空气', max: 10 }, { name: '绿化', max: 10 },
  { name: '生活节奏', max: 10 }, { name: '气候', max: 10 },
];

<RadarChart cities={compareList} />  // 多城市叠加对比
```

### 4.3 核心功能实现流程图

#### 4.3.1 智能匹配流程

```
┌────────────┐     ┌──────────────┐     ┌──────────────┐
│ 用户进入    │────▶│ 设置偏好权重  │────▶│ 提交匹配请求  │
│ 匹配页面    │     │ (11维滑块)   │     │              │
└────────────┘     └──────────────┘     └──────┬───────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │      filterCities(硬性过滤)      │
                              │  房价上限 / 期望薪资 / 特殊要求   │
                              └────────────────┬────────────────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │   calculateMatchScore(加权评分)  │
                              │   11维归一化 × 权重 → 总分       │
                              └────────────────┬────────────────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │     按匹配分降序排列             │
                              └────────────────┬────────────────┘
                                               │
                         ┌─────────────────────▼──────────────────────┐
                         │            MatchResult 页面                  │
                         │  Top城市卡片 + 雷达图 + 匹配分 + 去详情入口  │
                         └────────────────────────────────────────────┘
```

#### 4.3.2 笔记发布流程

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ 点击发布  │────▶│ 检查登录状态  │────▶│ 打开发布弹窗  │
│ 按钮     │     │ (未登录跳转)  │     │              │
└──────────┘     └──────────────┘     └──────┬───────┘
                                             │
                    ┌────────────────────────┼────────────────────┐
                    │                        │                    │
                    ▼                        ▼                    ▼
            ┌──────────────┐        ┌──────────────┐      ┌──────────────┐
            │ 选择城市      │        │ 上传图片     │      │ 填写标题内容  │
            │ (搜索+下拉)  │        │ (最多9张)    │      │ (字数统计)   │
            └──────┬───────┘        └──────┬───────┘      └──────┬───────┘
                   │                       │                     │
                   └───────────────────────┼─────────────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │   前端校验必填字段       │
                              │   标题/内容/城市/图片    │
                              └────────────┬────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │  POST /api/notes        │
                              │  后端二次校验+城市校验   │
                              │  覆盖冗余字段(防伪造)    │
                              └────────────┬────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │  写入 notes 表           │
                              │  返回新笔记数据          │
                              └────────────┬────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │  Toast 提示成功          │
                              │  关闭弹窗                │
                              │  列表头部插入新笔记      │
                              └─────────────────────────┘
```

#### 4.3.3 笔记点赞流程

```
         ┌──────────┐
         │ 用户点击  │
         │ 点赞按钮  │
         └─────┬────┘
               │
      ┌────────▼────────┐
      │  检查登录状态    │──否──▶ 跳转登录页
      └────────┬────────┘
               │是
      ┌────────▼────────┐
      │ POST /:id/like  │
      │  body: userId   │
      └────────┬────────┘
               │
      ┌────────▼────────────────┐
      │ INSERT INTO note_likes  │
      └────────┬────────────────┘
               │
         ┌─────┴─────┐
         │           │
    成功插入      ER_DUP_ENTRY(已点赞)
         │           │
         ▼           ▼
   like_count+1  DELETE note_likes
   liked:true    like_count-1
   爱心填充动画  liked:false
   爱心恢复
```

---

## 5. 工作总结

### 5.1 已完成功能

| 模块 | 完成情况 | 要点 |
|------|---------|------|
| **首页** | ✅ 完成 | Hero 区 + 热门城市卡片 + 公告栏 + 特性介绍 |
| **智能匹配** | ✅ 完成 | 11 维加权算法 + 硬性过滤 + 雷达图可视化结果 |
| **城市大全** | ✅ 完成 | 卡片列表 + 省份/等级筛选 + 搜索 + 分页 |
| **城市详情** | ✅ 完成 | 11 维雷达图 + 房价薪资数据 + 用户评价 + 收藏 |
| **城市对比** | ✅ 完成 | 胶囊清单 + 抽屉面板 + 多城市雷达图叠加 |
| **地图视图** | ✅ 完成 | ECharts 中国地图 + 点击城市跳转 |
| **分享社区** | ✅ 完成 | 瀑布流 + 城市筛选 + 三种排序 + 滚动加载 |
| **发布笔记** | ✅ 完成 | 多图上传(9张) + 城市绑定 + 字数统计 |
| **笔记详情** | ✅ 完成 | 图片画廊Lightbox + 点赞 + 城市标签跳转 |
| **用户系统** | ✅ 完成 | 注册/登录 + 个人中心 + 收藏 + 历史 + 评价 |
| **后台管理** | ✅ 完成 | 仪表盘 + 城市/用户/评价/笔记/公告管理 + 批量操作 |
| **AI 助手** | ✅ 完成 | 悬浮对话窗 + 后端 chat 路由 |

### 5.2 存在的不足

| 不足项 | 说明 |
|--------|------|
| **无评论系统** | 笔记详情页有 comment_count 字段但未实现评论功能，仅占位 |
| **密码明文存储** | 用户密码未使用 bcrypt 加密，存在安全隐患 |
| **无 JWT 鉴权** | 登录后未签发 Token，接口鉴权依赖前端传 userId，可被伪造 |
| **图片存储本地** | 上传图片存本地磁盘，未使用 OSS/CDN，不适合生产部署 |
| **无搜索功能** | 社区笔记不支持全文搜索（仅按城市筛选） |
| **无消息通知** | 点赞/评论无消息推送 |
| **AI 对话简陋** | chat 路由为基础实现，未接入大模型 API |
| **无单元测试** | 未编写测试用例 |

### 5.3 未来改进方向

| 方向 | 具体措施 |
|------|---------|
| **安全加固** | 引入 bcrypt + JWT；接口添加 Token 中间件；后台管理添加管理员 Token |
| **评论系统** | 新建 comments 表，实现笔记评论 + 回复功能，配合消息通知 |
| **全文搜索** | 引入 Elasticsearch 或 MySQL FULLTEXT 索引，支持笔记/城市搜索 |
| **图片上云** | 接入阿里云 OSS / 七牛云，CDN 加速图片访问 |
| **AI 升级** | 接入大语言模型（如豆包/通义千问），实现智能城市推荐对话 |
| **性能优化** | Redis 缓存热门笔记/城市数据；图片懒加载 + WebP 格式；CDN 静态资源 |
| **移动端适配** | PWA 支持；或开发微信小程序版本 |
| **数据可视化** | 后台增加用户行为分析图表（笔记发布趋势、城市热度排行等） |
| **测试覆盖** | 引入 Vitest + React Testing Library，编写核心模块单元测试 |

---

> **文档生成时间**：2026-08-02
> **项目名称**：如意城市 (ruyi-city)
> **技术栈**：React 18 + TypeScript + Vite + Tailwind CSS + Express + MySQL
