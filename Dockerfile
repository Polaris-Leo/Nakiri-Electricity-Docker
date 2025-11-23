# 阶段 1: 构建前端
FROM node:20-alpine AS builder
WORKDIR /app

# 单独复制 package.json 以利用缓存
COPY package.json package-lock.json* ./
RUN npm install

# 复制所有源码并构建
COPY . .
RUN npm run build

# 阶段 2: 生产环境
FROM node:20-alpine
WORKDIR /app

# 安装生产环境依赖 (sqlite3 需要构建工具，alpine 需要 python/make/g++)
RUN apk add --no-cache python3 make g++

COPY package.json ./
# 仅安装后端运行时需要的依赖
RUN npm install --production

# 从阶段 1 复制编译好的前端文件
COPY --from=builder /app/dist ./dist

# 复制后端源码
COPY server.js scraper.js database.js ./

# 创建数据目录 (用于挂载 Volume)
RUN mkdir -p data

# 环境变量默认值
ENV PORT=8080
ENV DB_PATH=./data/main.db
ENV ROOM_ID=""
ENV ROOM_URL=""
ENV BUILD_ID=""
ENV PART_ID="0"

EXPOSE 8080

CMD ["node", "server.js"]