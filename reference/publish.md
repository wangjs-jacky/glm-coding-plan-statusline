# 发布流程

## 一次性配置：Automation Token

npm 启用双因素认证后，`npm publish` 每次需要浏览器确认 OTP，无法自动化。通过 Automation Token 绕过。

### 创建 Granular Access Token

1. 登录 [npmjs.com](https://www.npmjs.com) → 头像 → **Access Tokens**
2. **Generate New Token** → 选择 **Granular Access Token**
3. 配置：
   - Token name: `glm-statusline-publish`
   - Expiration: 90 天（按需设置）
   - Packages: `Read and write`
   - Organizations: `@wangjs-jacky`
4. 复制生成的 token

### 写入本地配置

```bash
# 添加到 ~/.npmrc（只需一次）
echo '//registry.npmjs.org/:_authToken=npm_你的token' >> ~/.npmrc
```

配置完成后 `npm publish` 不再需要浏览器确认，可直接流水线执行。

## 发布命令

```bash
# 一键发布：验证 → 升版本 → 发布 → 推送
npm run verify && npm version patch && npm publish && git push origin main --tags
```

或分步执行：

```bash
# 1. 验证改动
npm run verify

# 2. 升版本 + 发布
npm version patch  # 或 minor/major
npm publish

# 3. 推送（npm version 会自动创建 commit 和 tag）
git push origin main --tags
```

## 发布后收尾

```bash
# 恢复 Claude settings 为 npx 方式
# ~/.claude/settings.json:
#   "statusLine": { "command": "npx @wangjs-jacky/glm-coding-plan-statusline@latest", "type": "command" }

# 取消本地链接
npm unlink -g @wangjs-jacky/glm-coding-plan-statusline
```
