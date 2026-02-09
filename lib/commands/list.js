const chalk = require('chalk');
const { getBundles, getSkillsIndex } = require('../utils');

module.exports = async function list(options) {
    const bundlesObj = await getBundles();
    const skillsIndex = await getSkillsIndex();

    // Convert bundles object to array
    const bundles = Object.entries(bundlesObj).map(([id, data]) => ({
        id,
        ...data
    }));

    if (options && options.skills) {
        // List all individual skills
        console.log(chalk.cyan('\n📚 All Available Skills:\n'));
        console.log(chalk.dim('────────────────────────────────────────'));

        skillsIndex.forEach(skill => {
            console.log(`${chalk.white(skill.id.padEnd(35))} ${chalk.dim(skill.category)}`);
        });

        console.log(chalk.dim('────────────────────────────────────────'));
        console.log(chalk.white(`\n   Total: ${chalk.cyan(skillsIndex.length)} skills\n`));
    } else {
        // List bundles
        console.log(chalk.cyan('\n📦 Available Skill Bundles:\n'));
        console.log(chalk.dim('────────────────────────────────────────'));

        bundles.forEach(bundle => {
            const categorySkills = skillsIndex.filter(s => s.category === bundle.id);
            const emoji = bundle.title ? bundle.title.split(' ')[0] : '📦';
            const name = bundle.title ? bundle.title.split(' ').slice(1).join(' ') : bundle.id;
            console.log(
                `${emoji} ${chalk.white(bundle.id.padEnd(20))} ` +
                `${chalk.cyan(String(categorySkills.length).padStart(3))} skills   ` +
                `${chalk.dim(name)}`
            );
        });

        console.log(chalk.dim('────────────────────────────────────────'));
        console.log(chalk.white(`   Total: ${chalk.cyan(skillsIndex.length + '+')} skills across ${bundles.length} bundles\n`));
        console.log(chalk.dim('Run "agentkit list --skills" to see all individual skills'));
        console.log(chalk.dim('Run "agentkit install <bundle>" to install\n'));
    }
};
