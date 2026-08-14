const { spawn } = require('child_process');

const mode = process.argv[2];
const isWin = process.platform === 'win32';

if (!mode) {
  // Modo Maestro: Abre dos ventanas nuevas
  console.log('\x1b[36m[🚀] INICIANDO CONSOLAS DE MONITOREO SEPARADAS...\x1b[0m\n');
  if (isWin) {
    spawn('cmd.exe', ['/c', 'start', '"MONITOR FRONTEND"', 'cmd.exe', '/k', 'node', 'monitor.js', 'frontend'], { shell: true, stdio: 'ignore' });
    spawn('cmd.exe', ['/c', 'start', '"MONITOR BACKEND"', 'cmd.exe', '/k', 'node', 'monitor.js', 'backend'], { shell: true, stdio: 'ignore' });
  } else {
    console.log('Esta funcionalidad de ventanas separadas está optimizada para Windows.');
  }
  setTimeout(() => process.exit(0), 1000);
} else {
  // --- Configuración de colores ANSI ---
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    frontend: '\x1b[36m', // Cyan
    backend: '\x1b[35m',  // Magenta
    success: '\x1b[32m', // Verde
    warning: '\x1b[33m', // Amarillo
    error: '\x1b[31m',   // Rojo
  };

  function formatLog(prefix, color, data) {
    const lines = data.toString().split('\n').filter(line => line.trim() !== '');
    lines.forEach(line => {
      let outputLine = line;
      let icon = prefix === 'FRONTEND' ? '🖥️' : '⚙️';
      
      if (prefix === 'BACKEND' && (outputLine.includes('"GET ') || outputLine.includes('"POST ') || outputLine.includes('"PATCH ') || outputLine.includes('"DELETE '))) {
        if (outputLine.includes('" 20')) {
          outputLine = `${colors.success}[🟢 200 OK]${colors.reset} ${outputLine.substring(outputLine.indexOf('"'))}`;
        } else if (outputLine.includes('" 40') || outputLine.includes('" 50')) {
          outputLine = `${colors.error}[🔴 ERROR]${colors.reset} ${outputLine.substring(outputLine.indexOf('"'))}`;
        } else if (outputLine.includes('" 30')) {
          outputLine = `${colors.warning}[🟡 REDIRECT]${colors.reset} ${outputLine.substring(outputLine.indexOf('"'))}`;
        }
      }

      if (outputLine.toLowerCase().includes('error') || outputLine.toLowerCase().includes('traceback')) {
         outputLine = `${colors.error}${outputLine}${colors.reset}`;
      }

      console.log(`${color}${colors.bright}[${icon} ${prefix}]${colors.reset} ${outputLine}`);
    });
  }

  if (mode === 'frontend') {
    console.log(`${colors.frontend}${colors.bright}========================================`);
    console.log(`[🖥️] MONITOREO FRONTEND (REACT / VITE)`);
    console.log(`========================================${colors.reset}\n`);
    
    const npmCmd = isWin ? 'npm.cmd' : 'npm';
    const proc = spawn(npmCmd, ['run', 'dev'], { cwd: './frontend', shell: true });
    proc.stdout.on('data', data => formatLog('FRONTEND', colors.frontend, data));
    proc.stderr.on('data', data => formatLog('FRONTEND', colors.error, data));
  } 
  else if (mode === 'backend') {
    console.log(`${colors.backend}${colors.bright}========================================`);
    console.log(`[⚙️] MONITOREO BACKEND (DJANGO API)`);
    console.log(`========================================${colors.reset}\n`);
    
    const pythonCmd = isWin ? '.venv\\Scripts\\python.exe' : '.venv/bin/python';
    const proc = spawn(pythonCmd, ['manage.py', 'runserver'], { cwd: './backend', shell: false });
    proc.stdout.on('data', data => formatLog('BACKEND', colors.backend, data));
    proc.stderr.on('data', data => formatLog('BACKEND', colors.backend, data));
  }
}
