### 依赖分析工具

#### 安装依赖

```bash
cd ./dep-graph-server
npm install
````

```bash
cd ./dep-graph-web
npm install
````

#### 启动服务
```bash
  npm run dev -- --dep=3 --path=./package-lock.json
```