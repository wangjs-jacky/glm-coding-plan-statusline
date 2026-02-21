/**
 * 状态栏格式化器
 * 负责生成状态栏的显示输出
 */

// ANSI 颜色代码
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // 前景色
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * 格式化 Token 数量
 */
function formatTokens(tokens) {
  if (!tokens || tokens === 0) return '0';

  if (tokens >= 1e9) {
    return (tokens / 1e9).toFixed(1) + 'B';
  }
  if (tokens >= 1e6) {
    return (tokens / 1e6).toFixed(1) + 'M';
  }
  if (tokens >= 1e3) {
    return (tokens / 1e3).toFixed(1) + 'K';
  }
  return tokens.toString();
}

/**
 * 格式化上下文大小
 */
function formatContextSize(size) {
  if (size >= 1e6) {
    return (size / 1e6).toFixed(0) + 'M';
  }
  if (size >= 1e3) {
    return (size / 1e3).toFixed(0) + 'K';
  }
  return size.toString();
}

/**
 * 根据百分比获取颜色
 */
function getPercentColor(percent) {
  if (percent < 50) return COLORS.green;
  if (percent < 80) return COLORS.yellow;
  return COLORS.red;
}

/**
 * 生成进度条
 */
function makeProgressBar(percent, width = 10) {
  const filled = Math.round(percent * width / 100);
  const empty = width - filled;
  const color = getPercentColor(percent);
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${color}${bar}${COLORS.reset}`;
}

/**
 * 解析 Claude Code 传入的上下文 JSON
 */
function parseContext(input) {
  try {
    const data = typeof input === 'string' ? JSON.parse(input) : input;

    return {
      model: data?.model?.display_name || 'GLM',
      modelId: data?.model?.id || '',
      contextUsed: data?.context_window?.used_percentage || 0,
      contextSize: data?.context_window?.context_window_size || 0,
      inputTokens: data?.context_window?.current_usage?.input_tokens || 0,
      outputTokens: data?.context_window?.current_usage?.output_tokens || 0,
      cacheCreationTokens: data?.context_window?.current_usage?.cache_creation_input_tokens || 0,
      cacheReadTokens: data?.context_window?.current_usage?.cache_read_input_tokens || 0,
      currentDir: data?.workspace?.current_dir || '',
    };
  } catch (e) {
    return {
      model: 'GLM',
      contextUsed: 0,
      contextSize: 0,
      inputTokens: 0,
      outputTokens: 0
    };
  }
}

/**
 * 生成状态栏输出
 */
function formatStatusLine(context, usageData, options = {}) {
  const {
    showMonthly = true,
    showDaily = true,
    showSession = true,
    showMCP = true,
    showContext = true,
    showFiveHours = true,
    twoLines = true
  } = options;

  // 计算会话 Token
  const sessionTokens = context.inputTokens + context.outputTokens +
    context.cacheCreationTokens + context.cacheReadTokens;

  // 格式化数值
  const sessionDisplay = formatTokens(sessionTokens);
  const contextDisplay = formatContextSize(context.contextSize);

  // 配额数据
  const mcpUsed = usageData?.quota?.mcpUsage?.percentage || 0;
  const fiveHourUsed = usageData?.quota?.fiveHourQuota?.percentage || 0;

  // 月度/日度数据
  const monthlyTokens = usageData?.monthly?.totalTokens || 0;
  const dailyTokens = usageData?.daily?.dailyTokens || 0;
  const monthlyDisplay = formatTokens(monthlyTokens);
  const dailyDisplay = formatTokens(dailyTokens);

  // 第一行：模型 + Token 统计
  const line1Parts = [];
  line1Parts.push(`${COLORS.cyan}${COLORS.bold}${context.model}${COLORS.reset}`);

  if (showSession) {
    line1Parts.push(`${COLORS.dim}会话:${sessionDisplay}${COLORS.reset}`);
  }
  if (showDaily) {
    line1Parts.push(`日:${dailyDisplay}`);
  }
  if (showMonthly) {
    line1Parts.push(`${COLORS.blue}月:${monthlyDisplay}${COLORS.reset}`);
  }

  const line1 = line1Parts.join(' │ ');

  // 第二行：所有进度条
  const barParts = [];

  if (showFiveHours) {
    const bar = makeProgressBar(fiveHourUsed, 8);
    const color = getPercentColor(fiveHourUsed);
    barParts.push(`5h ${bar}${color}${fiveHourUsed}%${COLORS.reset}`);
  }

  if (showMCP) {
    const bar = makeProgressBar(mcpUsed, 8);
    const color = getPercentColor(mcpUsed);
    barParts.push(`MCP ${bar}${color}${mcpUsed}%${COLORS.reset}`);
  }

  if (showContext) {
    const bar = makeProgressBar(context.contextUsed, 8);
    barParts.push(`Ctx ${bar}${context.contextUsed}% (${contextDisplay})`);
  }

  const line2 = barParts.join(' │ ');

  if (twoLines) {
    return `${line1}\n${line2}`;
  }

  return `${line1} │ ${line2}`;
}

/**
 * 生成简化版状态栏 (单行)
 */
function formatCompactStatusLine(context, usageData) {
  return formatStatusLine(context, usageData, {
    showMonthly: false,
    showDaily: true,
    showSession: true,
    showMCP: true,
    showContext: true,
    showFiveHours: true,
    twoLines: false
  });
}

module.exports = {
  COLORS,
  formatTokens,
  formatContextSize,
  makeProgressBar,
  getPercentColor,
  parseContext,
  formatStatusLine,
  formatCompactStatusLine
};
