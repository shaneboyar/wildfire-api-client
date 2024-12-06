import inquirer from 'inquirer';
import chalk from 'chalk';

export async function promptUser(questions: inquirer.QuestionCollection) {
  try {
    return await inquirer.prompt(questions);
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}
