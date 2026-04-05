# 发布流程

```bash
# 1. 验证改动
npm run verify

# 2. 提交并发布
npm version patch  # 或 minor/major
npm publish

# 3. 恢复 Claude settings 为 npx 方式
# ~/.claude/settings.json:
#   "statusLine": { "command": "npx @wangjs-jacky/glm-coding-plan-statusline@latest", "type": "command" }

# 4. 取消本地链接
npm unlink -g @wangjs-jacky/glm-coding-plan-statusline
```
