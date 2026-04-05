# 项目结构

```
src/
├── index.js      # 主入口，编排缓存和格式化
├── api.js        # API 客户端，获取用量数据
├── formatter.js  # 状态栏渲染（颜色、进度条、布局）
├── cache.js      # 缓存管理（/tmp/.glm-statusline-cache/）
└── bridge.js     # GSD Bridge 兼容层
bin/
└── cli.js        # CLI 入口，读取 stdin 并输出状态栏
scripts/
└── verify.sh     # 本地验证脚本（npm run verify）
reference/        # 参考文档
```

## 状态栏格式

```
glm-5.1 │ Sess:55.9K │ Day:32.3M │ Mon:458.6M
5H ██░░░░░░30% ↻15:38 │ MCP ████████100% │ Context ██░░░░░░28% (200K)
```

| 字段 | 说明 | 数据来源 |
|------|------|----------|
| `Sess` | 当前会话 Token | Claude Code stdin |
| `Day` | 日使用量 | model-usage API |
| `Mon` | 月使用量 | model-usage API |
| `5H` | 5 小时配额百分比 | quota/limit API (TOKENS_LIMIT) |
| `↻HH:mm` | 5H 配额重置时间 | quota/limit API (nextResetTime) |
| `MCP` | MCP 工具调用配额 | quota/limit API (TIME_LIMIT) |
| `Context` | 上下文窗口使用率 | Claude Code stdin |

## 缓存

API 数据缓存在 `/tmp/.glm-statusline-cache/`：

| 文件 | TTL | 内容 |
|------|-----|------|
| `quota.json` | 2 分钟 | MCP/5H 配额 + nextResetTime |
| `daily.json` | 2 分钟 | 日使用量 |
| `monthly.json` | 10 分钟 | 月使用量 |

## API 说明

端点：`https://open.bigmodel.cn/api/monitor/usage/`

| 端点 | 用途 |
|------|------|
| `quota/limit` | 配额限制（MCP、5H） |
| `model-usage` | 模型使用量（月/日） |
| `tool-usage` | 工具使用量 |

**陷阱**：API 的 `TIME_LIMIT` 实际对应 MCP 配额，`TOKENS_LIMIT` 实际对应 5H 配额（标签互换了）。

调试原始响应：
```bash
curl -s 'https://open.bigmodel.cn/api/monitor/usage/quota/limit' \
  -H "Authorization: $ANTHROPIC_AUTH_TOKEN" | python3 -m json.tool
```
