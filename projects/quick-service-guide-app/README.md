# 快速办事指南软件

一个使用 Kotlin 和 Jetpack Compose 编写的 Android 办事指南应用，主要用于展示不同城市、不同办事分类下的事项流程、所需材料、办理地点、搜索和待办记录。

本仓库整理自 Android Studio 工程目录，已移除本地配置、Gradle 缓存和构建产物。软著证书、使用说明书、源码 PDF 等证明材料未放入公开仓库，可作为线下材料补充。

## 功能模块

- 城市选择
- 办事分类浏览
- 热门事项列表
- 事项搜索
- 办事详情、材料、地点、步骤展示
- 待办事项与历史记录
- Jetpack Compose 页面组件

## 技术栈

- Kotlin
- Android Jetpack Compose
- Material 3
- Navigation Compose
- Gradle Kotlin DSL

## 目录结构

```text
.
├── app/src/main/java/com/example/myapplication1/
│   ├── data/            # 数据模型和本地数据仓库
│   ├── ui/components/   # 通用 Compose 组件
│   ├── ui/navigation/   # 页面导航
│   ├── ui/screens/      # 页面
│   └── ui/theme/        # 主题样式
├── build.gradle.kts
└── settings.gradle.kts
```

## 本地运行

1. 使用 Android Studio 打开项目根目录。
2. 等待 Gradle 同步完成。
3. 选择模拟器或真机运行 `app`。

## 说明

当前项目数据主要来自本地内存数据，用于演示办事指南类应用的信息组织和页面交互，不包含线上政务接口。
