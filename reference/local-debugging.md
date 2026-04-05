# 本地调试

## 核心问题

改完代码不生效，通常是两个原因：
1. `npx @latest` 有独立缓存（`~/.npm/_npx/`），不走 npm link
2. API 数据有缓存（`/tmp/.glm-statusline-cache/`），旧数据没有新字段

## 改完代码后的标准流程

```bash
npm run verify
```

自动完成：清除缓存 → 请求 API → 输出状态栏 → 检查关键字段（重置时间、MCP、Context、模型名称）。

## 首次环境搭建

```bash
# 1. 建立全局链接
npm link

# 2. 修改 Claude settings，从 npx 改为直接命令
# ~/.claude/settings.json:
#   "statusLine": { "command": "glm-statusline", "type": "command" }
# （原来用 npx @wangjs-jacky/glm-coding-plan-statusline@latest 会绕过链接）
```

## 手动操作

```bash
# 清除缓存
rm -f /tmp/.glm-statusline-cache/*.json

# 用空数据测试
echo '{}' | glm-statusline

# 用模拟上下文测试
echo '{"model":{"display_name":"glm-5.1"},"context_window":{"used_percentage":28,"context_window_size":200000,"current_usage":{"input_tokens":5000,"output_tokens":3000}}}' | glm-statusline

# 本地模式（不请求 API）
echo '{}' | glm-statusline --local
```
