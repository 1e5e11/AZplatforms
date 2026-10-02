# 模型 API 使用文档

这是啊这AI I（啊这一号）的api文档。有关于模型的技术细节，请阅读[技术文档](https://ssssssss.eu.org/md/#src=https%3A%2F%2Fssssssss.eu.org%2Fai%2Fdocs%2FAZ%2520I%2Ftech.md&page=1)。

本服务兼容 OpenAI Chat Completions 的文本聊天格式，支持普通 JSON 返回、SSE 流式输出、指定种子和并发排队。

## 地址与模型

| 项目 | 值 |
| --- | --- |
| 网页 | `https://ai.realgeneral.eu.org/` |
| OpenAI SDK Base URL | `https://ai.realgeneral.eu.org/v1` |
| 聊天接口 | `POST /v1/chat/completions` |
| 模型列表 | `GET /v1/models` |
| 模型详情 | `GET /v1/models/AZ%20I` |
| 模型名称 | `AZ I` |
| 健康状态与部署信息 | `GET /health` |


默认不要求 API Key。若服务端设置了环境变量 `API_KEY`，请求须携带 `Authorization: Bearer 你的密钥`。官方 SDK 必须提供 `api_key` / `apiKey`；服务端未启用认证时可填写任意非空值，例如 `local`。

## 普通调用

以下 curl 示例适用于 Bash：

```bash
curl https://ai.realgeneral.eu.org/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"AZ I","messages":[{"role":"user","content":"你好，请简单介绍自己。"}],"seed":42,"temperature":0.8,"top_p":0.95,"top_k":40,"repetition_penalty":1.1}'
```

Windows PowerShell 示例：

```powershell
$requestBody = @{
    model = 'AZ I'
    messages = @(@{ role = 'user'; content = '你好，请简单介绍自己。' })
    seed = 42
} | ConvertTo-Json -Depth 8
$result = Invoke-RestMethod -Method Post `
    -Uri 'https://ai.realgeneral.eu.org/v1/chat/completions' `
    -ContentType 'application/json; charset=utf-8' `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($requestBody))
$result.choices[0].message.content
```

回答位于 `choices[0].message.content`。返回对象包括 `id`、`object: "chat.completion"`、Unix 秒时间 `created`、`model`、`choices` 和 `usage`；`usage` 包含输入、输出及总 token 数。`finish_reason` 为 `stop`（模型结束）或 `length`（达到生成上限）。

额外返回实际 `seed` 和权重指纹 `system_fingerprint`。不传种子时服务生成随机种子；种子 `0` 有效。

## 流式调用

请求设置 `stream: true`。接口返回 `Content-Type: text/event-stream`，每条事件为 `data: {...}`，以空行分隔。

```json
{
  "model": "AZ I",
  "messages": [{ "role": "user", "content": "写一个 Python 循环示例。" }],
  "seed": 42,
  "stream": true,
  "stream_options": { "include_usage": true }
}
```

首条 `chat.completion.chunk` 包含助手角色和实际种子；后续通过 `choices[0].delta.content` 返回新增文本，客户端应按顺序追加。最后一个选择块给出 `finish_reason`。若启用 `include_usage`，结束前另有 `choices: []` 的用量块。整个流以 `data: [DONE]` 结束。

等待或生成期间的 `: keep-alive` 是 SSE 注释，SDK 会忽略。流式响应头 `X-Seed` 也包含实际种子，`X-Request-ID` 可对应本地日志。生成中发生错误时会发送带 `error` 对象的 SSE 事件。

## Python 官方 SDK

安装：`pip install openai`。

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://ai.realgeneral.eu.org/v1",
    api_key="local",  # 开启认证后换成服务端设置的密钥
)

stream = client.chat.completions.create(
    model="AZ I",
    messages=[{"role": "user", "content": "你好，请简单介绍自己。"}],
    seed=42,
    temperature=0.8,
    top_p=0.95,
    stream=True,
    stream_options={"include_usage": True},
    extra_body={"top_k": 40, "repetition_penalty": 1.1},
)

for event in stream:
    if event.choices:
        print(event.choices[0].delta.content or "", end="", flush=True)
    elif event.usage:
        print("\n用量：", event.usage.total_tokens)
```

## Node.js 官方 SDK

安装：`npm install openai`。

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://ai.realgeneral.eu.org/v1',
  apiKey: 'local',
});

const stream = await client.chat.completions.create({
  model: 'AZ I',
  messages: [{ role: 'user', content: '你好，请简单介绍自己。' }],
  seed: 42,
  temperature: 0.8,
  top_p: 0.95,
  top_k: 40,
  repetition_penalty: 1.1,
  stream: true,
  stream_options: { include_usage: true },
});

for await (const event of stream) {
  process.stdout.write(event.choices[0]?.delta?.content ?? '');
}
```

`top_k` 和 `repetition_penalty` 为本服务扩展字段。TypeScript 使用 SDK 时，可将它们加入带扩展字段类型的请求对象，或自行发送 JSON。

## 参数与固定策略

| 参数 | 默认 | 说明 |
| --- | ---: | --- |
| `model` | 必填 | 使用 `AZ I` |
| `messages` | 必填 | 文本对话历史，最后一条为非空用户问题 |
| `stream` | `false` | 是否使用 SSE |
| `seed` | 随机 | `0..4294967295` 的整数 |
| `temperature` | `0.8` | `0..5`；0 为贪心解码 |
| `top_p` | `0.95` | 大于 0 且不大于 1 |
| `top_k` | `40` | 扩展字段，`0..65536`；0 关闭 Top K 截断 |
| `repetition_penalty` | `1.1` | 扩展字段，`1..5`；1 关闭重复惩罚 |
| `n` | `1` | 当前仅支持一个回答 |

生成上限由 Node.js `options.mjs` 中 `MAX_NEW_TOKENS = 1000` 固定。客户端的 `max_tokens`、`max_completion_tokens` 和 `max_new_tokens` 均不能修改这个值，传入时会被忽略；遇到结束 token 可以提前结束。

思考策略由同一文件中的 `REASONING_MODE = 'off'` 固定。网页没有思考开关，API 不接受 `reasoning_mode`，包括传入 `"off"`；传入会返回 HTTP 400。`reasoning_effort`、`thinking`、`enable_thinking` 和 `reasoning` 等替代参数同样不接受。模型生成的 `<think>...</think>` 内容会在服务端过滤，流式期间也会隐藏；未闭合思考块隐藏到回答结束。

同一权重版本、完整上下文、采样参数和种子可复现相同输出。换权重后，同种子的回答可能变化；贪心解码时种子不影响结果。

## 消息与兼容范围

支持 `system`、`developer`、`user`、`assistant` 文本消息；`developer` 按系统消息处理。`content` 可为字符串或仅含 `{ "type": "text", "text": "..." }` 的数组。

请求体最多 256 KiB，消息最多 100 条；每条内容最多 16000 字符，总计最多 64000 字符。总上下文为 4000 token，固定预留 1000 token 用于生成，超长历史会保留最近内容。

兼容范围为文本 Chat Completions、模型列表和模型详情。工具调用、多模态、JSON Schema 输出、自定义 `stop`、`logit_bias`、`logprobs`、非零 `frequency_penalty` / `presence_penalty` 暂不支持；重复控制使用本服务的 `repetition_penalty`。不支持的已识别能力返回参数错误。

并发采用共享权重和连续批处理。输入长度和 KV 内存预算决定实际同时生成的会话数，其他请求排队；等待容量或内存限额已满时返回 503。

## 错误

OpenAI 接口使用如下错误结构：

```json
{
  "error": {
    "message": "reasoning_mode 由服务端控制，API 不接受该参数",
    "type": "invalid_request_error",
    "param": null,
    "code": null
  }
}
```

常见状态码：400 参数无效或不支持，401 密钥无效，404 模型或接口不存在，413 请求体过大，503 服务不可用或等待容量已满，504 排队或推理超时。SSE 建立之后，错误通过流中的 `error` 对象返回，HTTP 状态已经是 200。


## 原有网页接口

网页继续使用 `POST /api/generate`，支持 `prompt` 或 `messages`；流式为 NDJSON，`token.text` 是累计文本，应替换回答区域。外部 OpenAI 客户端使用 `/v1/chat/completions`，其 `delta.content` 应追加。两个接口使用相同的模型、思考策略、生成上限和日志。

原有 `/api/jobs` 仍提供异步任务提交与查询。旧日志中的 `mode: "chat"` 表示采用聊天提示格式；`reasoning_mode: "off"` 表示关闭思考展示，更新后的简洁日志已省略这两个字段。
