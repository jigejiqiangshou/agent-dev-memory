---
name: agent-dev-memory
description: >-
  Maintains project-local hot state (state.json), decision logs, and verified
  fact / dead-end libraries for multi-session development; coordinates handoff,
  cold start, and Git commit points without replacing Git. Use when starting a
  session, saving progress, ending a session, switching tasks, before compaction,
  or when the user mentions handoff, DEV_STATE, memory, or resume.
---

# Agent Dev Memory

跨会话开发用的记忆与状态约定。Git 负责版本备份;本 Skill 负责「下次从哪继续」的热状态、决策指针、已验证事实与已排除路线,以及产物引用。不引入 MCP、锁服务或第二套备份工具。

记忆只记**已经发生的事**和**当前的状态**。技术路线、任务分解、路线图属于项目的 spec/spec 类文档,不属于记忆(见 [`references/semantics.md`](references/semantics.md) §Memory vs spec)。

## Instructions

### 1. Resolve binding

1. 读取仓库根 `AGENTS.md`(若无则扫 `README.md` 中的 Agent / memory 小节)。
2. 解析 `state_root`;未声明时默认 `memory/`。
3. 解析 **spec 位置**(constitution / plan / tasks / ADR / 声明过的约定);未声明时按项目实际结构判断,并注意有些项目没有 spec。
4. 解析允许写入的产物目录;未声明时默认可写仓库内非只读路径,且**不得**把大产物正文塞进记忆文件。
5. 新项目粘贴源:本包根目录 [`AGENTS.md.fragment`](AGENTS.md.fragment)。用法见 [`references/project-binding.md`](references/project-binding.md)。

### 2. Cold start

1. **先读 spec**(若项目有):constitution、spec、plan、tasks 或声明的约定。没有方向,`focus` 一句话撑不起来。
2. 解析热状态文件,按以下顺序取**第一个**命中:
   1. `{state_root}/state.json`(规范名,契约见 [`references/semantics.md`](references/semantics.md))。解析失败按 [`references/workflow.md`](references/workflow.md) §Failure handling 修复,**不得**在解析失败时继续"续接"叙事;
   2. `{state_root}/STATE.json` / `State.json`(大小写回退);
   3. 存量:`{state_root}/STATE.md` / `DEV_STATE.md`:先按上一步取到 spec,再按 workflow §Migrate legacy 转为 `state.json`,并在同一次交接中删除旧文件(冷启动第 1 步不受此路径变化影响);
   4. 全部缺失:按契约新建,并在回执中说明这是**新建**而非续接。
3. **读 `coldStart: true` 的事实条目**(只读这些,不读全量事实索引):`{state_root}/facts/INDEX.json`(路径以 `memoryStores.facts` 为准)。
4. 仅当需要细节时,按热状态中的指针打开决策档案(如 `{state_root}/log/`)。
5. 向用户确认 §下一步(或等价字段)前,先核对五问字段是否齐全;缺字段先补齐再动手。
6. 不得擅自重做热状态已标明完成的步骤,也不得重新验证库里已有的事实,除非用户明确要求。

**冷启动不读**死路索引与全量事实索引——它们在「选路/取舍」和「验证之前」才读,那样才真正起作用(读法见 workflow §Read map)。

### 3. During work

1. 关键决策、否决项、不可逆参数:追加一条决策档案;热状态只留指针。**日志条目要带上是如何走到这个产物的**:目标、讨论或排查路径、被否决的选项及理由、最终决定。见 workflow §What the decision log must and must not be。
2. 产物本体写在项目目录或项目声明路径;记忆里只登记路径与含义。
3. 方向性内容(将要怎么做、路线、任务分解)写进 spec,不写进记忆;spec 不存在或不可写时按 workflow §Direction routing 处理。
4. 两类库是**事件驱动**的,发生即写,不要攒到会话结束:
   - 验证刚完成 → 写 `facts/`(方法、证据、适用范围缺一不可;缺方法只能记 `hypothesis`);
   - 路线试过并失败 → 写 `deadends/`(必须带 `reason` 与 `reopenIf`);
   - 先写正文,再更新 `INDEX.json`;索引是唯一查询入口,**查询一律先读索引**。
5. **只有主 agent 写 memory。** 子代理/队友不直接写;它们自管各自的 memory,或在汇报时提交接近索引条目形状的建议,由主 agent 校验后落盘(格式见 workflow §Sub-agent reports)。
6. JSON 容器与五问字段名固定(见 [`references/semantics.md`](references/semantics.md) §Hot-state contract);字段内的措辞、语言与附加字段自定;必须能回答[五问](references/semantics.md)。

### 4. Triggers → persist

在以下任一时机进入检点(checkpoint):任务/里程碑完成、阻塞出现或解除、切换无关任务、compaction 之前、git commit 之前、会话结束、长会话(约 30 分钟)。

**双阈值**:`log/` 在上述**每一个**时机都写;`state.json` 只在进展/阻塞/产物**确实变化**时改。

检点五问(完整判据见 [`references/workflow.md`](references/workflow.md) §Checkpoint):

1. 进展/阻塞/产物真的变了吗 → 是则改 `state.json`
2. 有新验证的结论吗 → 是则写 `facts/`(未验证的假设不是事实)
3. 有试过并失败的路吗 → 是则写 `deadends/`
4. 有既有事实的前提不再成立吗 → 是则标 `stale`
5. 待写内容里有"将要怎么做"吗 → 那是 spec 的事,先写 spec

**纯讨论、无产物 → 不写任何 log**;一旦有产物,条目必须包含产物得以成立的过程。

然后按 [`references/workflow.md`](references/workflow.md) 的 Git 分工表:该 commit 则提示或执行 commit;琐碎改动不必强行提交。落盘必须保证 `state.json` 可解析(写入协议见 workflow §Failure handling);解析失败时不得宣称交接完成。落盘后向用户回执已更新的热状态路径、`updated` 值与时间。

### 5. Light check（交接前）

全部通过后再视为有效交接:

- [ ] 写入路径落在项目允许范围内
- [ ] `state.json` 可被 JSON 解析,且必填字段(`schema`/`updated`/`focus`/`blockers`/`next`/`artifacts`/`decisions`)齐全、非空字段非空;空值写成 `[]`
- [ ] 热状态能回答五问
- [ ] 关键产物有可定位的路径引用;**计划中但尚未创建的产物不得登记**
- [ ] 若有未提交的关键产物:已 commit,或热状态中显式写明「故意未提交」及原因
- [ ] `state_root` 下无遗留的 Markdown 热状态(`STATE.md` / `DEV_STATE.md`)与其并存
- [ ] `facts/INDEX.json` 与 `deadends/INDEX.json` 可解析,且索引条目与正文一一对应
- [ ] 记忆中没有 spec 已经拥有的方向性内容(除非显式标注为降级托管或 spec 写入被拒)
- [ ] 每条 `verified` 事实都有 `verified` 字段;每条死路都有 `reopenIf`;`coldStart: true` 不超过 10 条

不做项目专用硬门禁(语言、框架、验收阈值留给各仓库自己的规则)。

## References

- [semantics.md](references/semantics.md) — 四库语义、五问、事实与死路契约、`coldStart`、memory 与 spec 的边界
- [workflow.md](references/workflow.md) — 触发、读写矩阵、检点五问、索引写入协议、Git 分工
- [project-binding.md](references/project-binding.md) — 如何粘贴 fragment
- [extraction.md](references/extraction.md) — 从旧 handover 抽什么/弃什么
- [examples/fictional-site-generator/](examples/fictional-site-generator/) — 虚构示例
