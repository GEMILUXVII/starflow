# Changelog / 更新日志

All notable changes to this project will be documented in this file.

本文件记录项目的所有重要变更。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.5] - 2025-01-16

### Fixed / 修复

- Fixed page scrolling to top when adding/removing list tags
- 修复添加/移除标签时页面回到顶部的问题
- Fixed list badge text not centered
- 修复 List 标签文字不居中的问题

### Changed / 变更

- Use bind mount for postgres data persistence (easier backup)
- 使用 bind mount 挂载数据库目录（便于备份）

---

## [1.2.4] - 2025-01-16

### Fixed / 修复

- Fixed batch classification missing repositories due to incomplete AI responses
- 修复 AI 响应不完整导致部分仓库未被分类的问题

### Improved / 改进

- Limited to 15 standard categories to prevent excessive List creation
- 限制为 15 个标准分类，避免创建过多 List
- Force AI to use predefined categories only
- 强制 AI 只能使用预定义分类
- Added fallback handling for failed classifications
- 添加分类失败时的兜底处理

---

## [1.2.3] - 2025-01-16

### Added / 新增

- Configurable request interval and concurrency for batch classification
- 可配置批量分类的请求间隔和并发数
- Parallel processing support (default 3 concurrent requests)
- 并行处理支持（默认 3 并发）

### Improved / 改进

- Prompt now requires classification (no empty results)
- Prompt 现在强制要求给出分类（不允许空结果）
- Fixed sidebar scrolling issue when too many Lists
- 修复 Lists 过多时侧边栏无法滚动的问题
- Fixed repository names overflow in batch classify dialog
- 修复批量分类对话框中仓库名称溢出问题
- Reduced default request interval from 2.5s to 1s
- 默认请求间隔从 2.5 秒降至 1 秒

---

## [1.2.2] - 2025-01-15

### Added / 新增

- One-click batch AI classification for all uncategorized repositories
- 一键整理功能，批量 AI 分类所有未分类仓库
- New List confirmation dialog before creating AI-suggested lists
- 新 List 确认对话框，创建前让用户确认

### Improved / 改进

- Rate limiting protection with 2.5s interval between requests
- API 限流保护，请求间隔 2.5 秒
- Auto-retry on 429 errors (up to 3 times)
- 429 错误自动重试（最多 3 次）

---

## [1.2.1] - 2025-01-15

### Improved / 改进

- Enhanced AI classification accuracy with README summary extraction
- AI 分类准确性提升，支持 README 摘要提取
- Smarter prompt focusing on functionality rather than tech stack
- 更智能的 Prompt，根据功能而非技术栈分类
- Shorter List names (≤12 characters) for better UI display
- 更短的 List 名称（≤12字符）以优化界面显示
- README summaries are cached to reduce API calls
- README 摘要缓存，减少 API 调用

---

## [1.2.0] - 2025-01-15

### Added / 新增

- AI-powered repository classification with OpenAI compatible APIs
- AI 智能分类功能，支持 OpenAI 兼容 API
- Support for custom AI endpoints (proxies, Ollama, etc.)
- 支持自定义 AI 端点（代理服务、Ollama 等）
- AI configuration in settings page
- 设置页面添加 AI 配置选项
- Auto-create Lists based on AI suggestions
- 根据 AI 建议自动创建 Lists

---

## [1.1.1] - 2025-01-15

### Changed / 变更

- Replace native browser confirm dialogs with custom ConfirmDialog component
- 使用自定义 ConfirmDialog 组件替换浏览器原生确认框
- Unified confirmation dialog style for unstar and delete actions
- 统一取消 Star 和删除操作的确认对话框风格

---

## [1.1.0] - 2025-01-15

### Added / 新增

- Stats dashboard with language distribution and lists statistics
- 统计面板，包含语言分布和 Lists 统计
- Pie chart for language breakdown
- 语言分布饼图
- Bar charts for language ranking and lists repository count
- 语言排行和 Lists 仓库数量柱状图

### Fixed / 修复

- Footer GitHub link now points to project repository
- 页脚 GitHub 链接指向正确的项目仓库
- Settings page GitHub link corrected
- 设置页面 GitHub 链接修正
- Docker Compose now uses Docker Hub image by default
- Docker Compose 默认使用 Docker Hub 镜像

---

## [1.0.0] - 2025-01-15

### Added / 新增

- GitHub OAuth authentication / GitHub OAuth 登录认证
- Sync and display GitHub starred repositories / 同步并展示 GitHub Stars
- Lists for organizing repositories / Lists 分类管理
- Notes for repositories / 仓库笔记功能
- Search and filter functionality / 搜索和筛选功能
- Import/Export data (JSON/CSV) / 数据导入导出 (JSON/CSV)
- Dark/Light theme toggle / 深色/浅色主题切换
- Keyboard shortcuts / 键盘快捷键
- Docker deployment support / Docker 部署支持
- Responsive design / 响应式设计

---

[1.2.5]: https://github.com/GEMILUXVII/starflow/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/GEMILUXVII/starflow/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/GEMILUXVII/starflow/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/GEMILUXVII/starflow/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/GEMILUXVII/starflow/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/GEMILUXVII/starflow/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/GEMILUXVII/starflow/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/GEMILUXVII/starflow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/GEMILUXVII/starflow/releases/tag/v1.0.0
