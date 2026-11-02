# Koharu Frontend

Koharu 图片站的前端，基于 Vue 3、TypeScript、Vite、Pinia、Vue Router 与 Naive UI。

后端接口文档位于 `docs-backend/`，所有接口统一使用 `/api` 前缀。

## 开发

```sh
pnpm install
pnpm dev
```

开发服务器会把 `/api` 代理到 `http://localhost:3000`。如需指向其他地址，设置 `VITE_API_BASE_URL`。

## 构建与检查

```sh
pnpm type-check
pnpm build
```

## 目录

```text
src/
  api/         接口定义与 DTO 类型
  components/  布局、反馈组件
  enums/       角色、状态字符串枚举
  router/      路由、meta 与守卫
  stores/      Pinia 状态
  utils/       请求、加密、媒体地址、格式化
  view/        页面
docs-backend/  后端文档
```

## 页面

- `/login`、`/register`：登录、注册（密码使用 RSA-OAEP 加密后提交）
- `/home/gallery`：图库（虚拟滚动）
- `/home/albums`：图集列表
- `/profile/me`：个人资料与头像
- `/profile/avatar`：头像投稿；审核员可处理待审头像
- `/profile/password`：修改密码（先验证当前密码换取 reauth token）
- `/profile/delete`：删除账号
- `/profile/images/{approved,pending,rejected}`：我的投稿
