# Moker - 贴膜门店管理系统

本仓库包含三部分：后端 API、管理后台、H5/小程序端。

## 目录结构
- `server`：后端 API（Node.js + TypeScript + Prisma）
- `admin`：管理后台（Vue 3 + Vite + Element Plus）
- `h5`：H5/小程序（uni-app + Vue 3）

## 运行环境
- Node.js >= 18
- PostgreSQL >= 13

## 本地开发

### 1) 后端 API
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
默认地址：`http://localhost:8001`

### 2) 管理后台
```bash
cd admin
npm install
npm run dev
```
默认地址：`http://localhost:9000`

### 3) H5 / 小程序
```bash
cd h5
npm install
npm run dev:h5
```
默认地址：`http://localhost:9100`

小程序开发：
```bash
npm run dev:mp-weixin
npm run dev:mp-toutiao
```

## 环境变量
将根目录的 `.env.example` 复制为 `server/.env` 并修改：
```bash
cp .env.example server/.env
```
