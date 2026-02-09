# 🤖 @cgyudistira/agentkit

> **315+ AI Skills for Code Agents**

[![npm version](https://img.shields.io/npm/v/@cgyudistira/agentkit.svg?style=flat-square)](https://www.npmjs.com/package/@cgyudistira/agentkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**AgentKit** transforms your AI Assistant (Claude, Gemini, Cursor, Windsurf) into a full-stack digital agency. Instead of generic prompts, equip your agent with battle-tested **Skills**—specialized markdown instructions that teach it how to handle complex tasks professionally.

---

## 🚀 Quick Start

```bash
npx @cgyudistira/agentkit
```

This launches the **Setup Wizard** which guides you through:
1. Select your AI Agent (Cursor, Windsurf, Claude, etc.)
2. Choose a Skill Bundle (Full Stack, Security Expert, etc.)
3. Skills are installed to the correct directory

---

## 📦 Installation

### Option 1: Run Wizard (Recommended)
```bash
npx @cgyudistira/agentkit
```

### Option 2: Global Install
```bash
npm install -g @cgyudistira/agentkit
agentkit
```

---

## 🛠️ CLI Commands

| Command | Description |
|---|---|
| `agentkit` | Launch interactive Setup Wizard |
| `agentkit list` | List all skill bundles |
| `agentkit list --skills` | List all 315+ individual skills |
| `agentkit install <bundle>` | Install a skill bundle (e.g. `full-stack`) |
| `agentkit install <skill>` | Install a single skill (e.g. `react-patterns`) |
| `agentkit install --all` | Install ALL 315+ skills (Complete Library) |
| `agentkit status` | Show current setup status |
| `agentkit doctor` | Health check and diagnostics |
| `agentkit search <query>` | Search for skills |
| `agentkit --help` | Show all commands |

---

## 📦 Skill Bundles

| Bundle | Skills | Description |
|---|---|---|
| 💻 **full-stack** | 77 | Modern App Builder |
| 🕵️ **security-expert** | 46 | Pentester & Auditor |
| ✍️ **content-writer** | 34 | Writer & Creator |
| 🤖 **ai-engineer** | 65 | LLM Architect |
| 📊 **data-scientist** | 18 | Data Analyst |
| 🦄 **startup-founder** | 25 | Entrepreneur |
| 🎨 **creative-studio** | 50 | Designer / Artist |

**Total: 315+ skills**

---

## 🔌 Compatibility

| Agent | Type | Skills Path |
|---|---|---|
| **Antigravity** | IDE | `.agent/skills/` |
| **Cursor** | IDE | `.cursor/skills/` |
| **Windsurf** | IDE | `.agent/skills/` |
| **Claude Code** | CLI | `.claude/skills/` |
| **Gemini CLI** | CLI | `.gemini/skills/` |
| **Codex CLI** | CLI | `.codex/skills/` |
| **OpenCode** | CLI | `.agent/skills/` |
| **TRAE Code AI** | IDE | `.trae/skills/` |

---

## 💡 Usage Example

```bash
# 1. Run the wizard
agentkit

# 2. Select "Cursor" as your agent
# 3. Select "Full Stack Developer" bundle
# 4. 77 skills installed to .cursor/skills/

# Now in Cursor, ask:
> "Use the concise-planning skill to help me plan a new feature"
```

---

## 📁 Project Structure

After running `agentkit`, your project will have:

```
your-project/
├── .agent/
│   ├── skills/           # Installed skills
│   ├── workflows/        # Slash command workflows
│   └── agentkit.json     # Configuration
└── ...
```

---

## 🔧 Slash Commands (Workflows)
 
 Slash commands allow you to trigger specific workflows directly within your AI code editor.
 
 | Command | Workflow | Description |
 |---|---|---|
 | `/code-review` | **Code Review** | Comprehensive guidelines for QA and best practices |
 | `/database-migration` | **DB Migration** | Safe workflow for schema changes and data migration |
 | `/debug` | **Debugging** | Systematic approach to identify and resolve issues |
 | `/deploy` | **Deployment** | CI/CD checklist and production release steps |
 | `/git-workflow` | **Git Strategy** | Professional branching, committing, and PR workflow |
 | `/new-feature` | **Feature Dev** | End-to-end guide from requirements to implementation |
 | `/refactor` | **Refactoring** | Safe and systematic code improvement strategies |
 | `/testing` | **Test Suite** | Unit, Integration, and E2E testing best practices |
 
 Workflows are stored in `.agent/workflows/`. You can customize them to fit your team's process.

---

## 🤝 License
 
 MIT © 2025 cgyudistira
 
 ---
 
 *Built with ❤️ by cgyudistira*
