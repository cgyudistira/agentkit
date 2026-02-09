const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const prompts = require('prompts');
const { getBundles, getSkillsIndex, PACKAGE_ROOT } = require('../utils');

// Agent configurations
const AGENTS = [
   { title: 'Antigravity (.agent)', value: 'antigravity', path: '.agent/skills', config: '.agent/agentkit.json' },
   { title: 'Cursor (.cursor)', value: 'cursor', path: '.cursor/skills', config: '.cursorrules' },
   { title: 'Claude Code (.claude)', value: 'claude', path: '.claude/skills', config: '.claude/config.json' },
   { title: 'Gemini CLI (.gemini)', value: 'gemini', path: '.gemini/skills', config: '.gemini/settings.json' },
   { title: 'Codex CLI (.codex)', value: 'codex', path: '.codex/skills', config: '.codex/config.json' },
   { title: 'OpenCode (.agent)', value: 'opencode', path: '.agent/skills', config: '.agent/agentkit.json' },
   { title: 'Windsurf (.windsurfrules)', value: 'windsurf', path: '.agent/skills', config: '.windsurfrules' },
   { title: 'TRAE Code AI (.trae)', value: 'trae', path: '.trae/skills', config: '.trae/TRAE_RULES.md' }
];

const readline = require('readline');

// Progress bar helper
function showProgress(current, total, label) {
   const percent = Math.round((current / total) * 100);
   const barLength = 30;
   const filled = Math.round((percent / 100) * barLength);
   const empty = barLength - filled;
   const bar = chalk.cyan('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));

   readline.clearLine(process.stdout, 0);
   readline.cursorTo(process.stdout, 0);

   const safeLabel = (label || '').substring(0, 25).padEnd(25);
   process.stdout.write(`${bar} ${chalk.bold(percent.toString().padStart(3))}% ${chalk.dim(`(${current}/${total})`)} ${safeLabel}`);
}

module.exports = async function wizard() {
   const projectRoot = process.cwd();

   // Step 1: Select AI Agent
   console.log(chalk.cyan('\n📍 Step 1: Select Your AI Agent\n'));

   const agentResponse = await prompts({
      type: 'select',
      name: 'agent',
      message: 'Which AI agent are you using?',
      choices: AGENTS,
      initial: 0
   });

   if (!agentResponse.agent) {
      console.log(chalk.yellow('\nSetup cancelled.'));
      return;
   }

   const selectedAgent = AGENTS.find(a => a.value === agentResponse.agent);

   // Step 2: Select Bundle
   console.log(chalk.cyan('\n📍 Step 2: Select Skill Bundle\n'));

   const bundlesObj = await getBundles();
   const skillsIndex = await getSkillsIndex();

   // Convert bundles object to array
   const bundles = Object.entries(bundlesObj).map(([id, data]) => ({
      id,
      ...data
   }));

   const bundleChoices = bundles.map(b => {
      const categorySkills = skillsIndex.filter(s => s.category === b.id);
      const emoji = b.title ? b.title.split(' ')[0] : '📦';
      const name = b.title ? b.title.split(' ').slice(1).join(' ') : b.id;
      return {
         title: `${emoji} ${name} (${categorySkills.length} skills)`,
         value: b.id,
         description: b.description
      };
   });
   bundleChoices.push({ title: '🌟 Install ALL Skills (315+)', value: 'all' });

   const bundleResponse = await prompts({
      type: 'select',
      name: 'bundle',
      message: 'Which skill bundle do you want?',
      choices: bundleChoices,
      initial: 0
   });

   if (!bundleResponse.bundle) {
      console.log(chalk.yellow('\nSetup cancelled.'));
      return;
   }

   // Step 3: Install with progress bar
   console.log(chalk.cyan('\n📍 Step 3: Installing Skills\n'));

   try {
      // Create skills directory
      const skillsPath = path.join(projectRoot, selectedAgent.path);
      await fs.ensureDir(skillsPath);

      // Get skills to install
      let skillsToInstall = [];

      if (bundleResponse.bundle === 'all') {
         skillsToInstall = skillsIndex;
      } else {
         skillsToInstall = skillsIndex.filter(s => s.category === bundleResponse.bundle);
      }

      const total = skillsToInstall.length;
      console.log(chalk.dim(`Found ${total} skills to install...\n`));

      // Copy skills with progress bar
      let successCount = 0;
      for (let i = 0; i < skillsToInstall.length; i++) {
         const skill = skillsToInstall[i];
         showProgress(i + 1, total, skill.id);

         const sourcePath = path.join(PACKAGE_ROOT, skill.path);
         const destPath = path.join(skillsPath, skill.id);

         if (await fs.pathExists(sourcePath)) {
            await fs.copy(sourcePath, destPath);
            successCount++;
         }
      }

      // Show 100% complete and move to next line
      showProgress(total, total, 'Complete');
      process.stdout.write('\n');
      console.log(chalk.green(`✔ Installed ${successCount} skills\n`));

      // Create config file
      const configPath = path.join(projectRoot, selectedAgent.config);
      await fs.ensureDir(path.dirname(configPath));

      if (selectedAgent.config.endsWith('.json')) {
         await fs.writeJson(configPath, {
            agent: selectedAgent.value,
            skillsPath: selectedAgent.path,
            version: '1.0.0',
            installedBundle: bundleResponse.bundle,
            skillCount: successCount
         }, { spaces: 2 });
      } else if (selectedAgent.config.endsWith('.md')) {
         const rulesContent = `# AgentKit Skills

You have access to ${successCount} skills in ${selectedAgent.path}/

When asked to perform a task, check if a relevant skill exists and read it first.

## Available Skills
${skillsToInstall.slice(0, 20).map(s => `- ${s.id}: ${(s.description || s.name).substring(0, 50)}...`).join('\n')}
${skillsToInstall.length > 20 ? `\n... and ${skillsToInstall.length - 20} more skills` : ''}
`;
         await fs.writeFile(configPath, rulesContent);
      } else {
         // .cursorrules, .windsurfrules
         const rulesContent = `
# AgentKit Skills
You have access to ${successCount} skills in ${selectedAgent.path}/
When asked to perform a task, check if a relevant skill exists and read it first.
`;
         await fs.appendFile(configPath, rulesContent);
      }

      // Create workflows directory and add starter workflows
      const agentRoot = path.dirname(selectedAgent.path);
      const workflowsDir = path.join(projectRoot, agentRoot, 'workflows');
      await fs.ensureDir(workflowsDir);

      // Copy workflow templates from package templates folder
      const templatesDir = path.join(PACKAGE_ROOT, 'templates', 'workflows');
      if (await fs.pathExists(templatesDir)) {
         await fs.copy(templatesDir, workflowsDir);
      }

      // Summary
      console.log(chalk.dim('────────────────────────────────────────'));
      console.log(chalk.white(`📁 Skills installed to: ${chalk.cyan(selectedAgent.path)}`));
      console.log(chalk.white(`📄 Config created: ${chalk.cyan(selectedAgent.config)}`));
      console.log(chalk.white(`📋 Total skills: ${chalk.cyan(successCount)}`));
      console.log(chalk.dim('────────────────────────────────────────'));

      console.log(chalk.yellow('\n💡 Next steps:'));
      console.log(chalk.dim(`   1. Open your project in ${selectedAgent.title.split(' ')[0]}`));
      console.log(chalk.dim('   2. Ask your AI: "Use the concise-planning skill to help me plan a feature"'));
      console.log(chalk.dim('   3. Run "agentkit install <bundle>" to add more skills'));
      console.log(chalk.dim('────────────────────────────────────────\n'));

   } catch (error) {
      console.log(chalk.red('\n✘ Setup failed.'));
      console.error(error);
   }
};
