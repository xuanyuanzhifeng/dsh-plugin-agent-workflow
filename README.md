# DeepSeek Harness Agent 工作流

`dsh-plugin-agent-workflow` 是一个可独立安装的 DeepSeek Harness Web UI 插件。它在原有“对话”和“轨迹”之外增加“工作流”标签页，以用户对话轮次为入口，把 Agent 的模型请求、模型响应和工具调用呈现为清晰的执行链路。

插件不会替换或修改 DeepSeek Harness 内置的“轨迹”功能。

## 界面预览

### 工作流总览

左侧按用户对话轮次组织任务，右侧按时间顺序显示本轮发生的模型调用和工具调用。页面顶部汇总用户对话数、模型调用数、工具调用数和总耗时。

![工作流总览](docs/images/workflow-overview.png)

### 请求详情

点击请求卡片后，可以检查该次模型请求真实记录的系统提示词、`messages[]` 消息体和工具定义。三个区域均使用可折叠 JSON 树展示，并支持复制和放大查看。

![模型请求详情](docs/images/workflow-request-details.png)

## 主要功能

- **按轮次浏览**：左侧固定显示当前 Session 的用户对话轮次，包括提示词摘要、开始时间、模型调用数、工具调用数和完成状态。
- **执行链路可视化**：每次模型调用依次展示请求、响应和工具调用卡片，一行内容超出可视区域时支持横向滚动。
- **完整请求检查**：请求详情分别展示真实记录的 `system`、提供方无关的 `messages[]` 和 `tools`，JSON 节点可以逐级展开或收起。
- **响应内容检查**：展示 reasoning、content、工具调用以及当次模型响应的原始记录。
- **工具执行状态**：区分运行中、完成和失败状态，并展示调用参数、执行结果、耗时和错误摘要。
- **Token 与缓存统计**：分别显示输入、未缓存输入、缓存读取、缓存写入和输出 Token，便于分析上下文复用情况。
- **大数据量浏览**：轮次列表和模型调用列表独立滚动，模型调用行使用虚拟化渲染，长链路不会挤压整个页面。

## 数据来源

工作流页面由 DeepSeek Harness Session 中真实记录的事件生成。系统提示词、工具定义、响应和工具结果来自内置 Trajectory 投影；`messages[]` 按 DSH 与模型请求相同的 Session surface 追加、替换规则，在每次请求边界重建。

插件只读取并展示已有记录，不会向模型请求中增加消息、提示词或工具。

## 兼容版本

| 插件版本 | DSH 版本 |
| --- | --- |
| `0.2.x` | `dsh@0.1.5-rc.2` |
| `0.1.x` | `dsh@0.1.0-rc.8` |

DeepSeek Harness 仍处于预发布阶段，不同 RC 版本的客户端接口可能发生变化。升级 DSH 后，需要同时安装与新版本适配的插件版本。

## 安装

### 安装本地 `.tgz` 包

假设安装包位于当前目录：

```sh
npx --yes @deepseek-ai/dsh@0.1.5-rc.2 plugin \
  --profile web \
  add ./dsh-plugin-agent-workflow-0.2.0.tgz \
  --workspace-root
```

检查安装结果：

```sh
npx --yes @deepseek-ai/dsh@0.1.5-rc.2 plugin \
  --profile web \
  list --depth 0
```

列表中出现 `dsh-plugin-agent-workflow 0.2.0` 表示安装成功。重启 Web UI 后即可看到“工作流”标签页：

```sh
npx --yes @deepseek-ai/dsh@0.1.5-rc.2 web
```

### 从 GitHub 安装

仓库发布 `v0.2.0` 标签后，可以直接安装固定版本。`web` profile：

```sh
npx --yes @deepseek-ai/dsh@0.1.5-rc.2 plugin \
  --profile web \
  add github:xuanyuanzhifeng/dsh-plugin-agent-workflow#v0.2.0 \
  --workspace-root
```

`video` profile 使用相同插件版本：

```sh
npx --yes @deepseek-ai/dsh@0.1.5-rc.2 plugin \
  --profile video \
  add github:xuanyuanzhifeng/dsh-plugin-agent-workflow#v0.2.0 \
  --workspace-root

pnpm dsh --profile video
```

固定 Release 标签或 commit 可以避免安装内容随分支变化。只有在信任源码的情况下，才应允许包管理器执行 Git 依赖的构建脚本。

## 卸载

```sh
npx --yes @deepseek-ai/dsh@0.1.5-rc.2 plugin \
  --profile web \
  remove dsh-plugin-agent-workflow \
  --workspace-root
```

卸载后重启 DSH Web。该操作只移除独立的“工作流”插件，不会影响内置的“轨迹”标签页。

## 本地开发与打包

需要 Node.js `^22.19.0` 或 `>=24.0.0`，以及 pnpm 11。

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm pack
```

`pnpm test` 会先构建宿主入口和浏览器插件包。`pnpm pack` 生成可直接安装的 `dsh-plugin-agent-workflow-<version>.tgz` 文件。

## 已知限制

- 汇总数据只覆盖客户端能够加载的 Session 历史；无法取得的更早事件不会计入统计。
- JSON 展开状态和卡片选中状态保存在当前页面中，不提供可分享的深链接。
- 同一次响应中的多个工具调用以可横向滚动的线性序列展示，不绘制并行分支图。

## License

MIT
