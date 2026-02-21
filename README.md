# GLM Coding Plan Statusline

<p align="center">
  <strong>GLM Coding Plan 智能状态栏</strong>
</p>

<p align="center">
  帮助 GLM Coding Plan 用户实时掌握套餐使用情况
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@wangjs-jacky/glm-coding-plan-statusline.svg" alt="npm version">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Node.js-16+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue.svg" alt="Platform">
</p>

---

## 📖 中文文档

### ✨ 核心特性

- 🎯 **实时配额监控** - 显示 MCP 月度配额剩余百分比
- 📊 **Token 使用追踪** - 月度/日度/会话三级 Token 消耗统计
- 📈 **上下文进度条** - 可视化上下文窗口使用情况
- 🌈 **智能颜色提示** - 根据使用率自动变色警告
- ⚡ **智能缓存** - 减少 API 请求，提升响应速度
- 🔧 **灵活配置** - 支持多种显示模式

### 📋 系统要求

- **Node.js**: 版本 ≥ 16.0.0
- **Claude Code**: 配合 GLM Coding Plan 使用
- **GLM Coding Plan**: 需要有效的 ANTHROPIC_AUTH_TOKEN

### 🚀 快速开始

#### 一键配置

在 `~/.claude/settings.json` 中添加：

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx @wangjs-jacky/glm-coding-plan-statusline@latest"
  }
}
```

保存后重新打开 Claude Code 即可看到状态栏！

### 📊 显示效果

```
GLM-5 │ 5h[████████░░]78% 会话:160.0K 日:42.8M 月:979.2M │ MCP[███████░░░]79%
Ctx [██████░░░░] 68% (200K)
```

### 🎨 显示字段说明

| 字段 | 说明 | 颜色规则 |
|------|------|----------|
| **GLM-5** | 当前模型 | 青色 |
| **5h[████████░░]78%** | 5小时配额剩余 | 绿(≥50%) / 黄(20-50%) / 红(<20%) |
| **会话:160.0K** | 当前对话 Token | 灰色 |
| **日:42.8M** | 今日 Token 消耗 | 紫色 |
| **月:979.2M** | 当月 Token 消耗 | 蓝色 |
| **MCP[███████░░░]79%** | 月度配额剩余 | 绿(≥50%) / 黄(20-50%) / 红(<20%) |
| **Ctx [██████░░░░]** | 上下文进度条 | 绿(<50%) / 黄(50-80%) / 红(>80%) |

### ⚙️ 配置选项

```bash
# 完整模式 (双行显示，推荐)
npx @wangjs-jacky/glm-coding-plan-statusline

# 紧凑模式 (单行显示)
npx @wangjs-jacky/glm-coding-plan-statusline --compact

# 本地模式 (不请求 API，仅显示上下文)
npx @wangjs-jacky/glm-coding-plan-statusline --local

# 清除缓存
npx @wangjs-jacky/glm-coding-plan-statusline --clear-cache

# 查看帮助
npx @wangjs-jacky/glm-coding-plan-statusline --help
```

### 🔧 环境变量

确保以下环境变量已设置（通常在 settings.json 的 env 字段中）：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-token-here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic"
  }
}
```

---

## 📖 English Documentation

### ✨ Core Features

- 🎯 **Real-time Quota Monitoring** - Display MCP monthly quota remaining percentage
- 📊 **Token Usage Tracking** - Monthly/Daily/Session level token consumption statistics
- 📈 **Context Progress Bar** - Visualize context window usage
- 🌈 **Smart Color Alerts** - Automatic color change warnings based on usage rate
- ⚡ **Smart Caching** - Reduce API requests, improve response speed
- 🔧 **Flexible Configuration** - Support multiple display modes

### 📋 Requirements

- **Node.js**: Version ≥ 16.0.0
- **Claude Code**: Used with GLM Coding Plan
- **GLM Coding Plan**: Valid ANTHROPIC_AUTH_TOKEN required

### 🚀 Quick Start

#### One-step Configuration

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx @wangjs-jacky/glm-coding-plan-statusline@latest"
  }
}
```

Save and restart Claude Code to see the status bar!

### 📊 Display Example

```
GLM-5 │ 5h[████████░░]78% Session:160.0K Day:42.8M Month:979.2M │ MCP[███████░░░]79%
Ctx [██████░░░░] 68% (200K)
```

### ⚙️ Options

```bash
# Full mode (two lines, recommended)
npx @wangjs-jacky/glm-coding-plan-statusline

# Compact mode (single line)
npx @wangjs-jacky/glm-coding-plan-statusline --compact

# Local mode (no API requests, context only)
npx @wangjs-jacky/glm-coding-plan-statusline --local

# Clear cache
npx @wangjs-jacky/glm-coding-plan-statusline --clear-cache

# Show help
npx @wangjs-jacky/glm-coding-plan-statusline --help
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📞 Contact

- **Author**: wangjs-jacky
- **GitHub**: https://github.com/wangjs-jacky/glm-coding-plan-statusline
- **Issues**: https://github.com/wangjs-jacky/glm-coding-plan-statusline/issues

---

<p align="center">
  如果这个项目对你有帮助，请给一个 ⭐️ Star！
</p>
