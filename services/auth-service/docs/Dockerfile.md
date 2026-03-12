## Auth Service Dockerfile

Dockerfile này dùng **multi-stage build** để build và chạy `auth-service` theo kiểu production, tối ưu kích thước image và bảo mật.

### Tổng quan các stage

- **`base`**: Chuẩn bị Node + pnpm dùng chung.
- **`deps`**: Cài dependencies cho workspace (để build).
- **`builder`**: Build `@chatapp/common` rồi `@chatapp/auth-service`.
- **`production`**: Image runtime nhỏ gọn, chỉ chứa dependency production và code đã build.

---

### 1. Stage `base`

```dockerfile
FROM node:22-alpine AS base

#Install pnpm
RUN corepack enable & corepack prepare pnpm@10.14.0 --activate

WORKDIR /app
```

- Dùng image **`node:22-alpine`** (nhỏ, phù hợp production).
- Bật **corepack** và chuẩn bị đúng version **pnpm 10.14.0** → không phải cài pnpm thủ công, build luôn ổn định.
- Đặt thư mục làm việc `/app` cho các stage sau.

---

### 2. Stage `deps` – cài dependencies cho build

```dockerfile
FROM base AS deps

#Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./

#Copy package/json file for all needed package
COPY package/common/package.json ./package/common/package.json
COPY package/auth-service/package.json ./package/auth-service/package.json

#Install dependencies
RUN pnpm install --frozen-lockfile
```

- Kế thừa từ `base`.
- Copy các file cấu hình:
  - `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
  - `tsconfig.json`, `tsconfig.base.json`
  - `package.json` của `@chatapp/common` và `@chatapp/auth-service`.
- Chạy `pnpm install --frozen-lockfile`:
  - Cài đúng version theo lockfile.
  - Tận dụng layer cache: chỉ khi `package.json`/lockfile đổi mới phải cài lại.

---

### 3. Stage `builder` – build common + auth-service

```dockerfile
FROM deps as builder

#COPY SOURCE CODE
COPY packages/common ./packages/common
COPY services/auth-service/package.json ./services/auth-service/package.json

#Build common package first
RUN pnpm --filter @chatapp/common build

#Build auth service package
RUN pnpm --filter @chatapp/auth-service build
```

- Kế thừa `deps` (đã có `node_modules` đầy đủ).
- Copy toàn bộ source:
  - `packages/common`
  - `packages/auth-service`
- Build đúng thứ tự phụ thuộc:
  - Build `@chatapp/common` trước.
  - Sau đó build `@chatapp/auth-service`.
- Kết quả: mã TypeScript compile vào `dist/` trong từng package.

---

### 4. Stage `production` – image runtime

```dockerfile
FROM node:22-alpine AS production

#Install pnpm
RUN corepack enable & corepack prepare pnpm@10.14.0 --activate

#Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

WORKDIR /app
```

- Lại dùng `node:22-alpine` nhưng cho runtime.
- Cài pnpm để cài dependency production.
- Tạo user **non-root** `nodeuser` (uid 1001) thuộc group `nodejs`:
  - Tăng bảo mật, tránh chạy bằng root trong container.

Copy cấu hình + cài dependency production:

```dockerfile
#Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./

#Copy package/json file for all needed package
COPY package/common/package.json ./package/common/package.json
COPY package/auth-service/package.json ./package/auth-service/package.json

#Install dependencies
RUN pnpm install --frozen-lockfile --production
```

- Cài chỉ **production dependencies** (`--production`) → image nhỏ hơn, ít rủi ro hơn.

Copy code đã build từ stage `builder`:

```dockerfile
#Copy built artifcats from builder
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/auth-service/dist ./packages/auth-service/dist
```

- Chỉ copy thư mục `dist` (JS đã build) thay vì cả source TypeScript.

Thiết lập quyền, env và CMD:

```dockerfile
#Change ownership of the files to the non-root user
RUN chown -R nodeuser:nodejs /app

USER nodeuser

ENV NODE_ENV=production
ENV AUTH_SERVICE_PORT=4003

EXPOSE 4003

WORKDIR /app/services/auth-service

CMD ["node", "dist/index.js"]
```

- `chown` toàn bộ `/app` cho `nodeuser`, sau đó `USER nodeuser` → process chạy với user non-root.
- Set:
  - `NODE_ENV=production`
  - `AUTH_SERVICE_PORT=4003`
  - `EXPOSE 4003` để document port service.
- Đổi `WORKDIR` sang `/app/services/auth-service`.
- Chạy entrypoint `node dist/index.js` (file JS đã được build từ TS).

---

### Tóm tắt

- Multi-stage build giúp:
  - Tách rõ bước build và runtime.
  - Giảm kích thước image (chỉ giữ lại dist + prod deps).
- Build đúng thứ tự packages trong monorepo (`common` → `auth-service`).
- Chạy bằng non-root user, sẵn sàng cho môi trường production.