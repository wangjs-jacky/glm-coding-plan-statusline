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

<p align="center">
  <a href="./README.md">English</a>
</p>

---

## 功能特性

- **实时配额监控** - 显示 MCP 月度配额使用百分比
- **Token 使用追踪** - 月度/日度/会话三级 Token 消耗统计
- **上下文进度条** - 可视化上下文窗口使用情况
- **智能颜色提示** - 根据使用率自动变色警告
- **智能缓存** - 减少 API 请求，提升响应速度
- **灵活配置** - 支持多种显示模式

## 系统要求

- **Node.js**: 版本 ≥ 16.0.0
- **Claude Code**: 配合 GLM Coding Plan 使用
- **GLM Coding Plan**: 需要有效的 ANTHROPIC_AUTH_TOKEN

## 快速开始

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

## 显示效果

```
GLM-5 │ Sess:160.0K │ Day:42.8M │ Mon:979.2M
5H ██░░░░░░ 22% │ MCP ███░░░░░ 28% │ Context █████░░░ 68% (200K)
```

### 字段说明

**第一行：Token 统计**
| 字段 | 说明 | 颜色 |
|------|------|------|
| **GLM-5** | 当前模型 | 青色加粗 |
| **Sess:160.0K** | 当前会话 Token | 灰色 |
| **Day:42.8M** | 今日 Token 消耗 | 默认 |
| **Mon:979.2M** | 当月 Token 消耗 | 蓝色 |

**第二行：配额进度条**
| 字段 | 说明 | 颜色规则 |
|------|------|----------|
| **5H** | 5小时配额已使用 | 绿(<50%) / 黄(50-80%) / 红(>80%) |
| **MCP** | 月度配额已使用 | 绿(<50%) / 黄(50-80%) / 红(>80%) |
| **Context** | 上下文使用率 | 绿(<50%) / 黄(50-80%) / 红(>80%) |

## 配置选项

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

## 环境变量

确保以下环境变量已设置（通常在 settings.json 的 env 字段中）：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-token-here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic"
  }
}
```

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

- **作者**: wangjs-jacky
- **GitHub**: https://github.com/wangjs-jacky/glm-coding-plan-statusline
- **Issues**: https://github.com/wangjs-jacky/glm-coding-plan-statusline/issues

---

<p align="center">
  如果这个项目对你有帮助，请给一个 ⭐️ Star！
</p>
