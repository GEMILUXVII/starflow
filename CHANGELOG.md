# Changelog / 更新日志

All notable changes to this project will be documented in this file.

本文件记录项目的所有重要变更。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.2.1]: https://github.com/GEMILUXVII/starflow/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/GEMILUXVII/starflow/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/GEMILUXVII/starflow/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/GEMILUXVII/starflow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/GEMILUXVII/starflow/releases/tag/v1.0.0
