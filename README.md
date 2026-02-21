# GLM Coding Plan Statusline

<p align="center">
  <strong>Smart Status Bar for GLM Coding Plan</strong>
</p>

<p align="center">
  Real-time usage monitoring for GLM Coding Plan users
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@wangjs-jacky/glm-coding-plan-statusline.svg" alt="npm version">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/Node.js-16+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue.svg" alt="Platform">
</p>

<p align="center">
  <a href="./README_CN.md">中文文档</a>
</p>

---

## Features

- **Real-time Quota Monitoring** - Display MCP monthly quota usage percentage
- **Token Usage Tracking** - Monthly/Daily/Session level token consumption statistics
- **Context Progress Bar** - Visualize context window usage
- **Smart Color Alerts** - Automatic color change warnings based on usage rate
- **Smart Caching** - Reduce API requests, improve response speed
- **Flexible Configuration** - Support multiple display modes

## Requirements

- **Node.js**: Version ≥ 16.0.0
- **Claude Code**: Used with GLM Coding Plan
- **GLM Coding Plan**: Valid ANTHROPIC_AUTH_TOKEN required

## Quick Start

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

## Display Example

```
GLM-5 │ Sess:160.0K │ Day:42.8M │ Mon:979.2M
5H ██░░░░░░ 22% │ MCP ███░░░░░ 28% │ Context █████░░░ 68% (200K)
```

### Fields

**Line 1: Token Statistics**
| Field | Description | Color |
|-------|-------------|-------|
| **GLM-5** | Current model | Cyan bold |
| **Sess:160.0K** | Session tokens | Gray |
| **Day:42.8M** | Daily tokens | Default |
| **Mon:979.2M** | Monthly tokens | Blue |

**Line 2: Quota Progress Bars**
| Field | Description | Color Rules |
|-------|-------------|-------------|
| **5H** | 5-hour quota used | Green(<50%) / Yellow(50-80%) / Red(>80%) |
| **MCP** | Monthly quota used | Green(<50%) / Yellow(50-80%) / Red(>80%) |
| **Context** | Context window usage | Green(<50%) / Yellow(50-80%) / Red(>80%) |

## Options

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

## Environment Variables

Ensure these environment variables are set (usually in settings.json env field):

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-token-here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic"
  }
}
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Issues and Pull Requests are welcome!

## Contact

- **Author**: wangjs-jacky
- **GitHub**: https://github.com/wangjs-jacky/glm-coding-plan-statusline
- **Issues**: https://github.com/wangjs-jacky/glm-coding-plan-statusline/issues

---

<p align="center">
  If this project helps you, please give it a ⭐️ Star!
</p>
