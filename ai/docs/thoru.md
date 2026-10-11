# NVIDIA DRIVE Thor-U 详细硬件参数与算力分析

Thor-U 是 NVIDIA DRIVE Thor 系列中的车规级智能驾驶 SoC，主要用于自动驾驶、ADAS、视觉感知和车端 AI 推理。

需要先区分三个名称：

- DRIVE Thor-U：汽车智能驾驶芯片，也是这里讨论的主体。
- DRIVE AGX Thor：NVIDIA 汽车开发平台，官方开发套件的完整规格不等于 Thor-U 量产配置。
- Jetson T4000 / T5000：主要面向机器人、物理 AI 的 Thor 系列计算模组，不能直接把它们的 CUDA 核心数、显存和功耗当作 Thor-U 的参数。

Thor-U 与上述产品有共同的技术基础，但 GPU 配置、开放算力、功耗和内存配置可能不同。NVIDIA 公开的 DRIVE AGX Thor 平台峰值达到 1000 INT8 TOPS、2000 FP4 TFLOPS，而这不代表每个 Thor-U 产品均达到相同数值。

[image](https://www.google.com/s2/favicons?domain=https://developer.nvidia.com\&sz=32)

NVIDIA Developer

+2



## 一、Thor-U 核心硬件规格

已找到 NVIDIA 2026 年 8 月更新的 DriveOS 7.2.5 官方功率配置文档，里面直接列出了 Thor-U 和 Thor-X 的 CPU 数量、GPU TPC 数量和各硬件模块的频率。

这是比第三方宣传资料更可靠的对照依据。

官方可确认的 THOR-U 配置

DriveOS 7.2.5

CPU

# 12 核

Neoverse V3AE

GPU TPC

# 7

Blackwell

GPU 频率

# 1.53 GHz

MaxP 档位

| 参数        | DRIVE Thor-U      | DRIVE Thor-X |
| --------- | ----------------- | ------------ |
| 芯片 SKU    | TA1080SA          | TA1090SA     |
| GPU 架构    | Blackwell         | Blackwell    |
| CPU 架构    | Arm Neoverse V3AE | 相同           |
| CPU 核心    | 12                | 14           |
| CPU 配置频率  | 2601 MHz          | 2601 MHz     |
| GPU TPC   | 7                 | 10           |
| GPU 配置频率  | 1530 MHz          | 1575 MHz     |
| PVA 视觉加速器 | 1                 | 1            |
| NVENC 编码器 | 2                 | 2            |
| NVDEC 解码器 | 1                 | 2            |
| OFA 光流加速器 | 1                 | 1            |
| ISP 图像处理器 | 2                 | 2            |
| NVJPG 单元  | 2                 | 2            |
| DRAM 配置时钟 | 4266 MHz          | 4266 MHz     |

上述均来自 NVIDIA 的实际功率配置表，而非按照 AI TOPS 比例倒推。

[image](https://www.google.com/s2/favicons?domain=https://developer.nvidia.com\&sz=32)

NVIDIA Developer

+1



### GPU CUDA 核心数量及 FP32 算力

根据 Thor GPU 的公开架构，每个 TPC 包含 2 个 SM，每个 SM 配有 128 个 CUDA 核心。因此可以由 Thor-U 官方公布的 7 个 TPC 推算：

\\[ 7\times2\times128=\boxed{1792\text{ CUDA 核心}} \\]

对应 14 个 SM，计算能力属于 Thor 系列 Blackwell GPU 的技术体系。

假设其 FP32 CUDA 核心每周期完成一次 FMA（计为两次浮点运算），且全部核心在 1.53 GHz 下工作：

\\[ 1792\times2\times1.53\times10^9 \\]

得到理论峰值：

\\[ \boxed{5.484\ \mathrm{TFLOPS\ (FP32)}} \\]

这是根据官方单元数量、频率与架构推算的理论值，不是 NVIDIA 单独发布的 Thor-U FP32 跑分。

对照 Thor-X，同样的方法可得：

\\[ 2560\times2\times1.575 =8.064\ \mathrm{TFLOPS} \\]

其结果与 Thor 系列高配置 GPU 已公开的 FP32 理论性能一致。

[image](https://www.google.com/s2/favicons?domain=https://developer.download.nvidia.com\&sz=32)

NVIDIA Developer Download

+1



## 二、各精度 AI 算力

Thor-U 的 AI 性能主要来自 Blackwell GPU 的 Tensor Core，而不是普通 FP32 CUDA 单元。

理想汽车在 2025 年 7 月发布的车型资料中正式采用 700 TOPS 作为 Thor-U 的 AI 算力指标。其技术人员还解释了 FP8 与 FP4 的理论算力差异。

[image](https://www.google.com/s2/favicons?domain=https://ir.lixiang.com\&sz=32)

Li Auto Inc.

+1



### Thor-U 各精度性能表

| 计算精度         | 算力                  | 数据性质            |
| ------------ | ------------------- | --------------- |
| FP64         | 未公布                 | 暂无可靠值           |
| FP32（CUDA）   | 5.48 TFLOPS         | 理论推算            |
| TF32（Tensor） | 未公布                 | 支持情况依具体软件       |
| FP16（Tensor） | 约 350 TFLOPS        | 按同系列指标推算        |
| BF16（Tensor） | 未公布                 | 不宜直接等同 FP16 标称值 |
| FP8 / INT8   | 约 700 TFLOPS / TOPS | 车企公布的峰值口径       |
| FP4          | 约 1400 TFLOPS       | 车企技术人员给出的峰值     |
| INT4         | 未单独公布               | 不等于 FP4         |

表中 AI 高峰值是特定 Tensor Core 计算口径下的数字，并非所有模型都可达到。NVIDIA 尚未在所查公开资料中提供完整的 Thor-U Dense/Sparse 分项表。

[image](https://www.google.com/s2/favicons?domain=https://www.sina.cn\&sz=32)

Sina Mobile

+2

Thor-U 不同精度的理论峰值

Tensor Core AI 算力，FP16 为推算；FP8/INT8 与 FP4 为车企披露口径，不能与 FP32 CUDA 直接等量比较。

04008001,2001,600FP16FP8 / INT8FP4

### 为什么出现 500、700、1400 TOPS？

网络资料的差异主要来自计算精度、软件开放性能及测试口径。

在典型 Tensor Core 理论吞吐关系中，输入精度减半通常允许更高的并行运算量：

\\[ \mathrm{FP16:FP8:FP4}\approx1:2:4 \\]

例如，按车企所给口径：

\\[ 350:700:1400=1:2:4 \\]

但必须进一步区分：

- Dense（稠密）：不要求权重满足特定结构化稀疏模式。
- Sparse（稀疏）：利用支持的结构化稀疏性跳过部分乘法，符合条件时某些 Tensor Core 运算的峰值可达到 Dense 的约两倍。
- 实际有效算力：还受到 Tensor Core 利用率、数据重排、算子融合、内存带宽、功耗限制和推理框架的影响。

2025 年曾有关于 Thor-U 实际仅能释放约 500 TOPS 的报道；理想汽车随后明确表示，其 INT8/FP8 混合推理口径可达 700 TOPS。因此不能直接认定 500 TOPS 是其硬件极限。

[image](https://www.google.com/s2/favicons?domain=https://www.sina.cn\&sz=32)

Sina Mobile

+1



## 三、内存与带宽

Thor-U 所属的 DRIVE AGX Thor 开发平台使用 LPDDR5X 统一内存。NVIDIA DriveOS 明确提供 32 GB 和 64 GB 的板级内存配置，64 GB 为相应开发配置的默认选项。

[image](https://www.google.com/s2/favicons?domain=https://developer.nvidia.com\&sz=32)

NVIDIA Developer

+1



| 参数             | 数值                |
| -------------- | ----------------- |
| 内存类型           | LPDDR5X           |
| 开发板配置          | 32 GB / 64 GB     |
| 内存总线           | 256-bit（平台规格）     |
| DRAM 时钟        | 4266 MHz          |
| 等效传输速率         | 8532 MT/s         |
| 理论带宽           | 273 GB/s          |
| 内存架构           | CPU / GPU 共享物理内存  |
| GPU 独立 GDDR 显存 | 无                 |
| ECC            | 支持相关配置选项，具体看板卡和软件 |

带宽计算：

\\[ \frac{256}{8}\times8532\times10^6 =273.024\ \mathrm{GB/s} \\]

这解释了为什么 Thor-U 虽然拥有高达数百 TOPS 的 AI 算力，但运行大语言模型时，仍可能受到内存带宽限制。

### 本地 LLM 推理能力

如果使用 64 GB 统一内存配置，单纯从模型权重大小看，可能容纳：

| 模型规模 | Q4 近似权重大小 | 容纳情况           |
| ---- | --------- | -------------- |
| 8B   | 4–5 GB    | 轻松             |
| 14B  | 7–9 GB    | 轻松             |
| 27B  | 14–17 GB  | 可以             |
| 32B  | 17–21 GB  | 可以             |
| 70B  | 35–45 GB  | 可能，取决于可用内存及上下文 |

这些数字未包含全部 KV Cache、计算缓冲区以及车载软件系统占用。

例如，27B Q4 模型权重假设占用 16 GB，单用户逐 token 解码时，仅依据理论带宽计算：

\\[ \frac{273}{16}\approx17.1\ \mathrm{token/s} \\]

这是一个简化的、假定每生成一个 token 都需从 DRAM 读取全部权重的带宽模型估算，不是实测生成速度。KV Cache、带宽利用率、权重缓存和具体内核都会改变结果。

## 四、CPU 缓存与处理器架构

Thor-U 使用 Arm Neoverse V3AE，属于面向汽车计算的 Armv9 系列高性能 CPU。

同系列 Thor 的公开 CPU 架构资料给出的缓存结构如下：

| 参数      | 数值                 |
| ------- | ------------------ |
| 指令集     | Armv9.2-A          |
| CPU 核心  | 12                 |
| 最高配置频率  | 2.601 GHz          |
| L1 指令缓存 | 每核 64 KB           |
| L1 数据缓存 | 每核 64 KB           |
| L2 缓存   | 每核 1 MB            |
| L3 系统缓存 | 共享 16 MB           |
| SIMD    | NEON、SVE2          |
| 应用场景    | 传感器处理、决策、任务调度、通用计算 |

缓存容量来自同架构 Thor 模组的资料；作为 Thor-U 的具体缓存值，还应以其芯片技术手册确认。

[image](https://www.google.com/s2/favicons?domain=https://www.arm.com\&sz=32)

Arm®

+2



## 五、视频、视觉与汽车专用硬件

Thor-U 不只是 CPU + GPU，还配备了一系列专用处理器。根据 NVIDIA 官方 MaxP 配置：

| 硬件单元      | 数量           | 频率       |
| --------- | ------------ | -------- |
| PVA       | 1            | 1100 MHz |
| 光流加速器 OFA | 1            | 1560 MHz |
| NVENC     | 2            | 1560 MHz |
| NVDEC     | 1            | 1560 MHz |
| ISP       | 2            | 1044 MHz |
| VIC 图像合成  | 1            | 844 MHz  |
| NVJPG     | 2            | 1560 MHz |
| FSI 安全岛   | 1 组（4 个锁步核心） | 1250 MHz |

FSI、PVA、ISP 等专用模块在自动驾驶中很重要，因为它们能处理部分无需交给 GPU Tensor Core 的任务。

[image](https://www.google.com/s2/favicons?domain=https://developer.nvidia.com\&sz=32)

NVIDIA Developer



同属 DRIVE AGX Thor 的官方开发平台还公开了：

- 最高 3.5 Gigapixels/s 的 ISP 图像处理能力。
- H.265 编码能力最高约 3.1 Gigapixels/s。
- H.265 解码能力最高约 2.9 Gigapixels/s。
- 16 路 GMSL2 + 2 路 GMSL3 摄像头连接。
- 总计最高 76 Gb/s 的以太网数据传输能力。
- 4 路 CAN 汽车总线接口。

以上是 DRIVE AGX Thor 平台级规格，不保证每款 Thor-U 量产域控制器都开放相同接口。

[image](https://www.google.com/s2/favicons?domain=https://developer.nvidia.com\&sz=32)

NVIDIA Developer



## 六、制造工艺、功耗与软件

| 项目                         | 情况                            |
| -------------------------- | ----------------------------- |
| 制造工艺                       | 台积电 5nm 级工艺，来自第三方芯片拆解         |
| GPU 技术                     | NVIDIA Blackwell              |
| CUDA 计算能力                  | Thor 系列为 SM 11.0，Thor-U 实机需核验 |
| 操作系统                       | DRIVE OS，支持 Linux / QNX 等配置   |
| 开发框架                       | CUDA、TensorRT、cuDNN 等         |
| 汽车功能安全                     | 面向 ISO 26262 ASIL-D 使用场景设计    |
| Thor-U 芯片独立 TDP            | 未找到可靠的公开定值                    |
| 完整 DRIVE AGX Thor 开发系统额定功率 | 350 W，不能当作 Thor-U 芯片功耗        |

工艺信息来自 Yole Group 对小米汽车 Thor-U 域控制器的拆解研究；DriveOS、功能安全和开发系统功率来自 NVIDIA 文档。

[image](https://www.google.com/s2/favicons?domain=https://www.linkedin.com\&sz=32)

Yole Group

+2



其中，350 W 是开发系统的整机供电规格。Jetson T4000 的 40–70 W 也不是 DRIVE Thor-U 官方 TDP，不能混用。

## 七、Thor-U、Thor-X、Jetson T4000、T5000 横向比较

| 参数         | Thor-U       | Thor-X    | Jetson T4000 | Jetson T5000 |
| ---------- | ------------ | --------- | ------------ | ------------ |
| CPU 核数     | 12           | 14        | 12           | 14           |
| GPU TPC    | 7            | 10        | 6            | 10           |
| CUDA 核心    | ≈1792\*      | 2560\*    | 1536         | 2560         |
| GPU 最大配置频率 | 1.530 GHz    | 1.575 GHz | 1.530 GHz    | 1.575 GHz    |
| FP32 理论峰值  | ≈5.48T\*     | ≈8.06T\*  | 4.70T        | 8.06T        |
| FP4 峰值     | ≈1400T       | ≈2000T    | 1200T        | 2070T        |
| 内存         | 板级 32/64 GB  | 平台 64 GB  | 64 GB        | 128 GB       |
| 理论内存带宽     | 273 GB/s（平台） | 273 GB/s  | 273 GB/s     | 273 GB/s     |
| 主要用途       | 汽车           | 汽车        | 机器人          | 机器人          |

\* 表示按官方硬件单元配置及架构推算；FP4 的 Thor-U/Thor-X 值采用汽车行业披露口径，Jetson 则为 NVIDIA 官方标示的稀疏 FP4 峰值，测量口径未必完全等同。

[image](https://www.google.com/s2/favicons?domain=https://developer.nvidia.com\&sz=32)

NVIDIA Developer

+2

## 总结

从硬件结构看，Thor-U 并不是单纯“700 TOPS 的 NPU”，而是一颗包含 12 核高性能 Arm CPU、约 1792 个 CUDA 核心、Blackwell Tensor Core、273 GB/s 级统一内存系统和多种视觉专用加速器的车规计算芯片。

如果把它作为通用 CUDA / 本地 LLM 计算平台评价，最关键的三个指标是约 5.48 TFLOPS FP32、273 GB/s 内存带宽和 32/64 GB 的开发板内存配置；而 700 TOPS 主要体现低精度 Tensor Core 矩阵计算吞吐能力。

目前仍有三项重要数据没有足够可靠的 Thor-U 专属公开依据：完整 Dense/Sparse 各精度算力表、准确 Tensor Core 数量，以及量产芯片的独立 TDP。不能简单把 Jetson T4000 的对应数据移植过来。

最值得直接查阅的两个 NVIDIA 官方文档是 [Thor-U / Thor-X 功率和单元配置表](https://developer.nvidia.com/docs/drive/drive-os/7.2.5/public/drive-os-linux-sdk-ea/platform-customization/System_Software_Settings/PowerProfiles.html) 与 [Thor-U SKU 与内存配置文档](https://developer.nvidia.com/docs/drive/drive-os/7.2.5/public/drive-os-linux-sdk-ea/getting-started/bind_partitions.html)。
