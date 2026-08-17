import { Router } from 'express';
import { pool } from '../db.js';
import { mapCityRow } from '../utils.js';

const router = Router();

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// 构建城市信息上下文
async function buildCityContext(cityId?: string): Promise<string> {
  if (!cityId) {
    // 没有指定城市时，返回所有城市概览
    const [rows] = await pool.query('SELECT * FROM cities');
    const cities = (rows as any[]).map(mapCityRow);
    const cityList = cities.map(c =>
      `- ${c.name}（${c.province}）：综合评分${c.overallScore}，房价${c.housingPrice}元/㎡，平均薪资${c.averageSalary}元/月，${c.tags.join('、')}`
    ).join('\n');
    return `以下是平台收录的所有城市概览：\n${cityList}`;
  }

  // 指定了城市时，返回该城市的详细信息
  const [rows] = await pool.query('SELECT * FROM cities WHERE id = ?', [cityId]);
  if ((rows as any[]).length === 0) {
    return '未找到该城市信息';
  }
  const city = mapCityRow((rows as any[])[0]);
  return `用户当前正在查看「${city.name}」的城市详情，以下是该城市的完整数据：
- 城市：${city.name}（${city.province}）
- 城市等级：${city.level}
- 综合宜居评分：${city.overallScore}/10
- 房价：${city.housingPrice}元/㎡
- 平均薪资：${city.averageSalary}元/月
- 物价水平：${city.priceLevel}/10
- 教育资源：${city.educationScore}/10
- 医疗资源：${city.medicalScore}/10
- 交通便利：${city.transportationScore}/10
- 就业机会：${city.employmentScore}/10
- 空气质量：${city.airQualityScore}/10
- 绿化环境：${city.greeningScore}/10
- 生活节奏（分数越低越悠闲）：${city.lifePaceScore}/10
- 气候舒适度：${city.climateScore}/10
- 标签：${city.tags.join('、')}
- 靠海：${city.isCoastal ? '是' : '否'}，有山脉：${city.hasMountains ? '是' : '否'}，历史名城：${city.isHistorical ? '是' : '否'}
- 城市简介：${city.description}`;
}

// 系统提示词
function buildSystemPrompt(cityContext: string): string {
  return `你是"如意城市"平台的 AI 助手，专注于帮助用户了解中国各城市的宜居情况。

你的职责：
1. 根据平台数据回答用户关于城市的问题
2. 帮用户分析城市的教育、医疗、交通、就业、环境等指标
3. 对比不同城市的优劣
4. 给出客观、中立的宜居建议

回答要求：
- 语气亲切友好，像朋友聊天一样
- 回答简洁明了，不要太长，用要点和分段组织
- 适当使用 emoji 让回答更生动
- 基于平台数据分析，不要编造数据
- 如果用户问的数据你不确定，坦诚告知

${cityContext}`;
}

// POST /api/chat - AI 对话
router.post('/', async (req, res) => {
  try {
    const { messages, cityId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '请提供对话消息' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
      return res.status(500).json({ error: 'AI 服务未配置，请在 server/.env 中设置 DEEPSEEK_API_KEY' });
    }

    // 构建城市上下文
    const cityContext = await buildCityContext(cityId);
    const systemPrompt = buildSystemPrompt(cityContext);

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API 错误:', errorData);
      return res.status(502).json({
        error: `AI 服务响应异常 (${response.status})`,
        detail: errorData.error?.message || '未知错误',
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我没有理解你的问题。';

    res.json({ reply });
  } catch (err) {
    console.error('聊天 API 错误:', err);
    res.status(500).json({
      error: 'AI 服务暂时不可用',
      detail: err instanceof Error ? err.message : '未知错误',
    });
  }
});

export default router;
