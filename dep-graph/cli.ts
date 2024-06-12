import { Command } from 'commander';
import { exec } from 'child_process';
import path from 'path';

const program = new Command();
program
  .command('start')
  .description('Start both server and client')
  .action(() => {
    const serverPath = path.resolve(__dirname, './dep-graph-server');
    const clientPath = path.resolve(__dirname, './dep-graph-web');
    console.log('serverPath', serverPath);
    console.log('clientPath', clientPath);
    const serverProcess = exec(`npm run dev`, { cwd: serverPath });
    serverProcess.stdout?.pipe(process.stdout);
    serverProcess.stderr?.pipe(process.stderr);
    setTimeout(() => {
      const clientProcess = exec('npm run dev', { cwd: clientPath });
      clientProcess.stdout?.pipe(process.stdout);
      clientProcess.stderr?.pipe(process.stderr);
    }, 1000);
  });

program.parse(process.argv);
