const chalk = require('chalk');
const { getSkillsIndex } = require('../utils');

module.exports = async function search(query) {
    const skills = await getSkillsIndex();
    const term = query.toLowerCase();

    const results = skills.filter(s =>
        s.id.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.name && s.name.toLowerCase().includes(term))
    );

    console.log(chalk.bold.cyan(`\n🔍 Search results for "${query}":\n`));

    if (results.length === 0) {
        console.log(chalk.yellow('  No skills found matching that query.'));
    } else {
        results.forEach(s => {
            console.log(`  ${chalk.green.bold(s.id)}`);
            if (s.description) {
                console.log(`    ${chalk.dim(s.description.slice(0, 100))}`);
            }
            console.log(`    ${chalk.dim('ID:')} ${s.id}`);
            console.log('');
        });
    }
    console.log('');
};
