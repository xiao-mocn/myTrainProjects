import { Command } from 'commander';
import { exec } from 'child_process';
import path from 'path';

const program = new Command();
program
  // 定义一个选项`--dep`，可简写为`-d`，并设置其描述
  .option('-d, --dep <number>', 'Set dependency level', '4')
  .option('-p, --path <string>', 'Set dependency file path', process.cwd())
  .action((option) => {
    const serverPath = path.resolve(__dirname, './dep-graph-server');
    const clientPath = path.resolve(__dirname, './dep-graph-web');
    const serverProcess = exec(`npm run dev`, {
      cwd: serverPath,
      env: { ...process.env, DEP_VALUE: option.dep, PATH_VALUE: option.path }
    });
    serverProcess.stdout?.pipe(process.stdout);
    serverProcess.stderr?.pipe(process.stderr);
    setTimeout(() => {
      const clientProcess = exec('npm run dev', {
        cwd: clientPath
      });
      clientProcess.stdout?.pipe(process.stdout);
      clientProcess.stderr?.pipe(process.stderr);
    }, 1000);
  });

program.parse(process.argv);
