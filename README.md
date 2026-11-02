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
  api/         接口定义与 DTO 类型（按后端模块拆分，index.ts 统一导出）
  components/  布局、反馈组件
  enums/       角色、状态字符串枚举
  router/      路由、meta 与守卫
  stores/      Pinia 状态
  utils/       请求、加密、媒体地址、格式化
  view/        页面
docs-backend/  后端文档
```

## 页面

- `/home/gallery`、`/home/albums`：图库与图集，游客可直接浏览
- `/login`、`/register`：登录、注册（密码使用 RSA-OAEP 加密后提交）
- `/profile/me`：个人资料、头像与图片上传（上传入口只放在个人中心）
- `/profile/avatar`：头像投稿；审核员可处理待审头像
- `/profile/password`：修改密码（先验证当前密码换取 reauth token）
- `/profile/delete`：删除账号
- `/profile/images/{approved,pending,rejected}`：我的投稿

未登录用户可以浏览图库、图集和公开资料；进入个人中心时才要求登录。

## 接口封装

`src/api` 按后端模块划分，覆盖 `docs-backend/openapi.json` 的全部操作：

- `auth.ts`：公钥、登录、刷新 Token、二次验证
- `users.ts`：注册、用户列表、当前用户、资料更新、改密、删号、角色
- `image.ts`：上传、列表、待审、审核、修改、缩略图、签名下载、删除
- `avatars.ts`：待审头像、上传、审核、头像流、删除
- `albums.ts`：图集创建/查询/搜索/更新/删除/解锁/图片增删
- `tags.ts`：标签列表、创建、删除
- `app.ts`、`library.ts`、`review-exemptions.ts`、`audit-logs.ts`：根信息、图库密钥、自审豁免、审计日志

这里只提供请求函数与类型，不包含对应管理界面。
