# 包合集修改日志

## 2026-11-19 — LGC_MA_Fury_Localization 2.0.0

- 将汉化工具来源仓库更新为 `LgcChina/LGC_MA_Fury_Localization`，收录 MA 与 VRCFury 合并正式版 2.0.0。
- 统一包 ID：`com.lgcchina.ma-fury-localization`；旧 1.0.0 发行版及标签移除，不再收录旧独立包；使用前备份自定义词典。
- 安装：VCC / ALCOM 刷新当前订阅并安装 `LGC_MA_Fury_Localization`；入口为 Unity 顶部 `LGC > LGC_MA_Fury_Localization v2.0.0`。
- 需要 Unity 2022.3 / VRChat SDK Base；MA 与 VRCFury 按安装情况独立启用，不修改原版文件。
- 订阅地址保持 `https://lgcchina.github.io/LGC-VRC-Packages/index.json`，源配置更新后触发索引重新生成与 Pages 部署。

## 2026-11-19 — LGC MA 简体中文扩展 1.0.0

- 修复合集发布工作流 1.0.0：显式安装现有生成器所需的 .NET 6，避免 runner 缺少运行时导致在线索引无法更新。
- 收录 LgcChina/LGC-MA-Localization 的 1.0.0 正式 VPM 发布。
- 包 ID：com.lgcchina.ma-localization-probe；订阅地址保持 https://lgcchina.github.io/LGC-VRC-Packages/index.json。
- 安装：VCC / ALCOM 刷新合集，安装 LGC MA 简体中文扩展；原版 MA 源需可用。
- 注意：最低适配目标 MA 1.10.0，完整旧版覆盖待实际确认；升级前另存包内自定义译文。