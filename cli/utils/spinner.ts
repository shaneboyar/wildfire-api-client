import chalk from 'chalk';

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export class Spinner {
  private message: string;
  private frame: number;
  private interval?: NodeJS.Timeout;

  constructor(message: string) {
    this.message = message;
    this.frame = 0;
  }

  start() {
    this.interval = setInterval(() => {
      process.stdout.write(
        '\r' + spinnerFrames[this.frame] + ' ' + this.message,
      );
      this.frame = ++this.frame % spinnerFrames.length;
    }, 80);
    return this;
  }

  succeed(text: string) {
    this.stop();
    console.log('\r' + chalk.green('✓') + ' ' + text);
  }

  fail(text: string) {
    this.stop();
    console.log('\r' + chalk.red('✗') + ' ' + text);
  }

  private stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
