# Nakiri Electricity Monitor

Nakiri Electricity 是一个现代化、高颜值的宿舍电量监控面板。

它可以帮助你实时追踪特定房间的电力消耗情况，提供详细的图表分析、充值记录检测以及剩余可用天数估算。项目采用前后端分离架构（SERN Stack），并针对 Docker 部署进行了深度优化。

✨ 功能特性

📊 深度数据分析：

实时电量趋势图（支持平滑曲线与数据点交互）。

核心指标看板：当前余量、近3小时消耗、单日最大/最小消耗。

深度分析：24小时消耗、7天消耗、上次充值金额及时间、预计可用天数估算。

🎨 现代化 UI 设计：

基于 Tailwind CSS 的响应式布局，完美适配桌面与移动端。

原生支持 深色模式 (Dark Mode)，随系统自动切换或手动切换。

丝滑的 Framer Motion 交互动画。

🐳 Docker 容器化：

支持通过环境变量 (ENV) 动态配置监控房间、楼栋信息和抓取地址。

数据持久化支持 (SQLite)。

多阶段构建，镜像体积小巧。

🤖 自动化运行：

后端内置 Cron 定时任务，每小时自动抓取最新数据。

智能识别充值行为（排除充值带来的电量跳变干扰消耗计算）。

🛠️ 技术栈

前端: React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React

后端: Node.js, Express, Axios, Node-cron

数据库: SQLite3

## 部署方式: Docker

🚀 Docker 部署

这是最简单的部署方式。无需安装 Node.js 环境，只需 Docker 即可。

### 1. 拉取


### 2. 运行容器

使用 docker run 启动服务。你需要通过 -e 参数传入房间配置。

基本运行示例：

docker run -d \
  --name nakiri-electricity \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -e ROOM_ID=506 \
  nakiri-electricity


完整配置示例 (推荐使用完整 URL 以提高稳定性)：

docker run -d \
  --name nakiri-electricity \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -e ROOM_ID=101 \
  -e BUILD_ID=1 \
  -e PART_ID=0 \
  -e ROOM_URL="[https://yktyd.ecust.edu.cn/epay/wxpage/wanxiao/eleresult?sysid=1&roomid=101&areaid=2&buildid=1](https://yktyd.ecust.edu.cn/epay/wxpage/wanxiao/eleresult?sysid=1&roomid=101&areaid=2&buildid=1)" \
  nakiri-electricity


访问地址: http://localhost:8080

### 3. 环境变量说明

变量名

必填

说明

示例

ROOM_ID

✅

房间号，用于数据库标识和默认查询

506

ROOM_URL

⚠️

强烈推荐。抓取电量的完整 URL。如果不填，系统会尝试根据 ROOM_ID 拼接默认 URL，但这可能因楼栋编号混乱而失败。

https://yktyd...

BUILD_ID

❌

楼栋号，仅用于前端标题显示

1

PART_ID

❌

校区 ID，仅用于前端标题显示 (0: 奉贤, 1: 徐汇)

0

DB_PATH

❌

SQLite 数据库路径，默认为 /app/data/main.db

./data/main.db

PORT

❌

服务运行端口，默认为 8080

8080

### 4、高级配置：构建镜像

如果你使用的是非AMD64架构的系统，或运行时报错，可在项目根目录下运行：

docker build -t nakiri-electricity .

## 💻 本地开发指南

如果你想修改代码或进行二次开发：

1. 安装依赖

npm install


2. 启动开发环境

你需要同时开启两个终端窗口：

终端 1 (后端 API):

### 设置必要的环境变量 (PowerShell 示例)
$env:ROOM_ID="506"; node server.js


终端 2 (前端 Vite):

npm run dev


访问 http://localhost:5173 进行开发调试。

3. 本地构建

npm run build


构建完成后，dist 目录将包含静态文件，此时运行 node server.js 即可在 http://localhost:8080 看到完整应用。

📂 项目结构

.
├── src/                # React 前端源码
│   ├── App.jsx         # 主应用逻辑 (UI, 数据计算, 图表)
│   ├── main.jsx        # 入口文件
│   └── index.css       # Tailwind 样式配置
├── dist/               # 构建后的静态文件 (由 npm run build 生成)
├── data/               # 数据库存储目录
├── server.js           # Express 后端入口 & API 定义
├── scraper.js          # 爬虫逻辑 (Axios)
├── database.js         # SQLite 数据库连接与初始化
├── Dockerfile          # Docker 构建文件
├── package.json        # 项目依赖配置
├── vite.config.js      # Vite 配置 (含 API 代理)
└── tailwind.config.js  # Tailwind 配置


📄 License

MIT License
