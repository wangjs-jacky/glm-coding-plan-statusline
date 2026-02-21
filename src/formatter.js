/**
 * 状态栏格式化器
 * 负责生成状态栏的显示输出
 */

// ANSI 颜色代码
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // 前景色
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // 亮色
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
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
 * 生成进度条
 */
function makeProgressBar(percent, width = 10) {
  const filled = Math.round(percent * width / 100);
  const empty = width - filled;

  // 根据百分比选择颜色
  let color;
  if (percent < 50) {
    color = COLORS.green;
  } else if (percent < 80) {
    color = COLORS.yellow;
  } else {
    color = COLORS.red;
  }

  const bar = '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  return `${color}${bar}${COLORS.reset}`;
}

/**
 * 根据 MCP 剩余百分比获取颜色
 */
function getQuotaColor(remaining) {
  if (remaining >= 50) return COLORS.green;
  if (remaining >= 20) return COLORS.yellow;
  return COLORS.red;
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
      // 工作目录
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
 * 显示顺序：每5小时 > 当前会话 > 日 > 月 > MCP剩余
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

  // MCP 配额（月度 Token 配额）
  const mcpPercentage = usageData?.quota?.mcpUsage?.percentage || 0;
  const mcpRemaining = 100 - mcpPercentage;

  // 5 小时配额（API 调用限流）
  const fiveHourPercentage = usageData?.quota?.fiveHourQuota?.percentage || 0;
  const fiveHourRemaining = 100 - fiveHourPercentage;

  // 月度/日度数据
  const monthlyTokens = usageData?.monthly?.totalTokens || 0;
  const dailyTokens = usageData?.daily?.dailyTokens || 0;
  const monthlyDisplay = formatTokens(monthlyTokens);
  const dailyDisplay = formatTokens(dailyTokens);

  // 进度条（上下文）
  const progressBar = makeProgressBar(context.contextUsed);

  // 5h 进度条（剩余百分比）
  const fiveHourBar = makeProgressBar(fiveHourRemaining);

  // MCP 进度条（剩余百分比）
  const mcpBar = makeProgressBar(mcpRemaining);

  // 构建第一行
  const parts = [];

  // 模型
  parts.push(`${COLORS.cyan}${context.model}${COLORS.reset}`);

  // Token 使用 - 按新顺序：5小时配额 > 会话 > 日 > 月 > MCP
  const tokenParts = [];

  // 每5小时配额（进度条）
  if (showFiveHours) {
    tokenParts.push(`5h${fiveHourBar}${fiveHourRemaining}%`);
  }

  // 当前会话
  if (showSession) {
    tokenParts.push(`${COLORS.dim}会话:${sessionDisplay}${COLORS.reset}`);
  }

  // 日
  if (showDaily) {
    tokenParts.push(`${COLORS.magenta}日:${dailyDisplay}${COLORS.reset}`);
  }

  // 月
  if (showMonthly) {
    tokenParts.push(`${COLORS.blue}月:${monthlyDisplay}${COLORS.reset}`);
  }

  if (tokenParts.length > 0) {
    parts.push(tokenParts.join(' '));
  }

  // MCP 配额（进度条）
  if (showMCP) {
    parts.push(`MCP${mcpBar}${mcpRemaining}%`);
  }

  const line1 = parts.join(' │ ');

  if (!showContext) {
    return line1;
  }

  // 第二行：上下文进度条
  const line2 = `Ctx ${progressBar} ${context.contextUsed}% (${contextDisplay})`;

  if (twoLines) {
    return `${line1}\n${line2}`;
  }

  return `${line1} │ ${progressBar} ${context.contextUsed}%`;
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
  getQuotaColor,
  parseContext,
  formatStatusLine,
  formatCompactStatusLine
};
