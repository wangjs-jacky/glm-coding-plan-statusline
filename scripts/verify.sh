#!/bin/bash
# 本地验证脚本 - 清缓存 + 运行状态栏 + 检查关键字段
# 用法: npm run verify

set -e
cd "$(dirname "$0")/.."

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
RESET='\033[0m'

echo -e "${YELLOW}[1/3] 清除缓存...${RESET}"
rm -f /tmp/.glm-statusline-cache/*.json
echo "  已清除"

echo -e "${YELLOW}[2/3] 请求 API 并生成状态栏...${RESET}"
OUTPUT=$(echo '{}' | node bin/cli.js 2>&1)
echo "$OUTPUT"
echo ""

echo -e "${YELLOW}[3/3] 检查关键字段...${RESET}"

PASS=true

# 检查 5H 重置时间
if echo "$OUTPUT" | grep -q '↻[0-9]\{2\}:[0-9]\{2\}'; then
  echo -e "  ${GREEN}✓${RESET} 5H 重置时间 (↻HH:mm)"
else
  echo -e "  ${RED}✗${RESET} 5H 重置时间缺失"
  PASS=false
fi

# 检查 MCP 配额
if echo "$OUTPUT" | grep -q 'MCP'; then
  echo -e "  ${GREEN}✓${RESET} MCP 配额"
else
  echo -e "  ${RED}✗${RESET} MCP 配额缺失"
  PASS=false
fi

# 检查 Context
if echo "$OUTPUT" | grep -q 'Context'; then
  echo -e "  ${GREEN}✓${RESET} Context 使用率"
else
  echo -e "  ${RED}✗${RESET} Context 使用率缺失"
  PASS=false
fi

# 检查模型名称
if echo "$OUTPUT" | grep -q 'GLM\|glm'; then
  echo -e "  ${GREEN}✓${RESET} 模型名称"
else
  echo -e "  ${RED}✗${RESET} 模型名称缺失"
  PASS=false
fi

echo ""
if [ "$PASS" = true ]; then
  echo -e "${GREEN}所有检查通过${RESET}"
else
  echo -e "${RED}部分检查未通过，请检查上方输出${RESET}"
  exit 1
fi
