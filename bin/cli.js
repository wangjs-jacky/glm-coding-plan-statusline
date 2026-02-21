#!/usr/bin/env node

/**
 * GLM Coding Plan Statusline CLI
 * 命令行入口
 */

const { generateStatusLine, generateLocalStatusLine, cache } = require('../src/index');

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  local: false,
  compact: false,
  help: false,
  clearCache: false
};

for (const arg of args) {
  switch (arg) {
    case '--local':
    case '-l':
      options.local = true;
      break;
    case '--compact':
    case '-c':
      options.compact = true;
      break;
    case '--help':
    case '-h':
      options.help = true;
      break;
    case '--clear-cache':
      options.clearCache = true;
      break;
  }
}

// 显示帮助
if (options.help) {
  console.log(`
GLM Coding Plan Statusline - GLM Coding Plan 智能状态栏

使用方法:
  npx glm-coding-plan-statusline [选项]

选项:
  --local, -l       仅使用本地上下文数据，不请求 API
  --compact, -c     紧凑模式，单行显示
  --clear-cache     清除缓存
  --help, -h        显示帮助信息

配置方法:
  在 ~/.claude/settings.json 中添加:

  {
    "statusLine": {
      "type": "command",
      "command": "npx glm-coding-plan-statusline"
    }
  }

环境变量:
  ANTHROPIC_AUTH_TOKEN  - GLM API 认证令牌
  ANTHROPIC_BASE_URL    - API 基础 URL

示例:
  # 默认模式 (双行显示)
  npx glm-coding-plan-statusline

  # 紧凑模式 (单行显示)
  npx glm-coding-plan-statusline --compact

  # 本地模式 (无需网络)
  npx glm-coding-plan-statusline --local

更多信息: https://github.com/wangjs-jacky/glm-coding-plan-statusline
`);
  process.exit(0);
}

// 清除缓存
if (options.clearCache) {
  cache.clearAllCache();
  console.log('缓存已清除');
  process.exit(0);
}

// 从 stdin 读取上下文 JSON
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', reject);

    // 如果没有 stdin 数据，使用空对象
    setTimeout(() => {
      if (!data) {
        resolve('{}');
      }
    }, 100);
  });
}

// 主函数
async function main() {
  try {
    const input = await readStdin();

    if (options.local) {
      // 本地模式：不请求 API
      const output = generateLocalStatusLine(input, {
        twoLines: !options.compact
      });
      console.log(output);
    } else {
      // 完整模式：请求 API 获取使用量
      const output = await generateStatusLine(input, {
        twoLines: !options.compact
      });
      console.log(output);
    }
  } catch (error) {
    // 发生错误时输出简单状态栏
    console.log('GLM │ Statusline Error');
    process.exit(0);
  }
}

main();
