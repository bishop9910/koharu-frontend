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

- `/home/albums`：首页图库列表，游客可直接浏览；搜索框支持 `#标签` 自动匹配，左侧可切换我的收藏、我点赞的
- `/home/favorites`：我收藏的图库
- `/home/liked`：我点赞的图库
- `/home/albums/:id`：图库详情，查看图库内图片；点赞、收藏、举报、编辑、增删图片按权限显示
- `/login`、`/register`：登录、注册（密码使用 RSA-OAEP 加密后提交）
- `/profile/me`：个人资料与头像
- `/profile/studio`：创作中心，集中上传图片、创建/管理图库、管理标签（审核员及以上）
- `/profile/avatar`：头像投稿；审核员可处理待审头像
- `/profile/password`：修改密码（先验证当前密码换取 reauth token）
- `/profile/delete`：删除账号
- `/profile/submissions`：已通过投稿，按“已归档图库 / 未归档图片”分组
- `/profile/images/{pending,rejected}`：待审核、未通过投稿

未登录用户可以浏览图库和公开资料；进入个人中心、点赞/收藏/举报或管理图库时才要求登录。图库的点赞、收藏与举报均由后端记录，收藏和点赞列表跨设备同步。

审核台、图库密码修改、审计日志等管理端页面由另一个前端实现，本仓库不提供这些入口。

## 接口封装

`src/api` 按后端模块划分，覆盖 `docs-backend/openapi.json` 的全部操作：

- `auth.ts`：公钥、登录、刷新 Token、二次验证
- `users.ts`：注册、用户列表、当前用户、资料更新、改密、删号、角色
- `image.ts`：上传、列表、待审、审核、修改、缩略图、签名下载、删除
- `avatars.ts`：待审头像、上传、审核、头像流、删除
- `albums.ts`：图库创建/查询/搜索/更新/删除/解锁/图片增删、点赞、收藏、举报、重新提交评审、整集评审
- `album-reports.ts`：举报队列、举报详情、核实、驳回
- `album-reviews.ts`：待评审图集
- `tags.ts`：标签列表、创建、删除
- `app.ts`、`library.ts`、`review-exemptions.ts`、`audit-logs.ts`：根信息、图库密钥、自审豁免、审计日志
