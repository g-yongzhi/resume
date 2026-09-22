# 壁纸网站 API 文档

## 基础信息

- 基础URL: `http://localhost:3000/api`
- 所有请求和响应均使用 JSON 格式
- 认证方式：Bearer Token
- 文件上传：multipart/form-data

## 通用响应格式

### 成功响应
```json
{
    "success": true,
    "message": "操作成功",
    "data": {} // 可选，具体数据
}
```

### 错误响应
```json
{
    "success": false,
    "message": "错误信息"
}
```

## 认证相关 API

### 用户注册
- **URL**: `/auth/register`
- **方法**: `POST`
- **描述**: 注册新用户
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "token": "JWT令牌",
      "user": {
        "id": 1,
        "username": "用户名"
      }
    }
  }
  ```

### 用户登录
- **URL**: `/auth/login`
- **方法**: `POST`
- **描述**: 用户登录
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "user": {
        "id": 1,
        "username": "用户名"
      }
    }
  }
  ```

## 壁纸相关 API

### 上传壁纸
- **URL**: `/wallpapers`
- **方法**: `POST`
- **描述**: 上传新壁纸
- **认证**: 需要
- **请求体**: `multipart/form-data`
  - `image`: 图片文件
  - `resolution`: 分辨率 (4K/2K/1080P)
  - `categories`: 分类ID数组 (JSON字符串)
- **响应**:
  ```json
  {
    "success": true,
    "message": "上传成功",
    "data": {
      "id": 1
    }
  }
  ```

### 获取壁纸列表
- **URL**: `/wallpapers`
- **方法**: `GET`
- **描述**: 获取壁纸列表
- **查询参数**:
  - `category_id`: 分类ID (可选)
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 10)
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "filename": "文件名",
        "original_filename": "原始文件名",
        "resolution": "4K",
        "uploader_name": "上传者",
        "categories": "分类1,分类2",
        "download_count": 0,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 获取壁纸详情
- **URL**: `/wallpapers/:id`
- **方法**: `GET`
- **描述**: 获取单个壁纸的详细信息
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "filename": "文件名",
      "original_filename": "原始文件名",
      "resolution": "4K",
      "uploader_name": "上传者",
      "categories": "分类1,分类2",
      "download_count": 0,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
  ```

### 下载壁纸
- **URL**: `/wallpapers/:id/download`
- **方法**: `GET`
- **描述**: 下载壁纸文件
- **响应**: 文件流

### 删除壁纸
- **URL**: `/wallpapers/:id`
- **方法**: `DELETE`
- **描述**: 删除壁纸
- **认证**: 需要（仅上传者可删除）
- **响应**:
  ```json
  {
    "success": true,
    "message": "删除成功"
  }
  ```

## 分类相关 API

### 获取分类列表
- **URL**: `/categories`
- **方法**: `GET`
- **描述**: 获取所有分类
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "分类名称",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 获取分类详情
- **URL**: `/categories/:id`
- **方法**: `GET`
- **描述**: 获取单个分类的详细信息
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "分类名称",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
  ```

### 创建分类
- **URL**: `/categories`
- **方法**: `POST`
- **描述**: 创建新分类
- **认证**: 需要
- **请求体**:
  ```json
  {
    "name": "分类名称"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "创建成功",
    "data": {
      "id": 1
    }
  }
  ```

### 更新分类
- **URL**: `/categories/:id`
- **方法**: `PUT`
- **描述**: 更新分类信息
- **认证**: 需要
- **请求体**:
  ```json
  {
    "name": "新分类名称"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "更新成功"
  }
  ```

### 删除分类
- **URL**: `/categories/:id`
- **方法**: `DELETE`
- **描述**: 删除分类
- **认证**: 需要
- **响应**:
  ```json
  {
    "success": true,
    "message": "删除成功"
  }
  ```

## 错误码说明

- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 注意事项

1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer <token>`
2. 文件上传大小限制为 10MB
3. 只支持图片文件格式
4. 壁纸分辨率只支持 4K、2K、1080P
5. 删除操作不可恢复，请谨慎操作 