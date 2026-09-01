const { spawn } = require('child_process');

const mode = process.argv[2];
const isWin = process.platform === 'win32';

if (!mode) {
  // Modo Maestro: Abre tres ventanas nuevas
  console.log('\x1b[36m[🚀] INICIANDO CONSOLAS DE MONITOREO SEPARADAS...\x1b[0m\n');
  if (isWin) {
    spawn('cmd.exe', ['/c', 'start', '"MONITOR FRONTEND"', 'cmd.exe', '/k', 'node', 'monitor.js', 'frontend'], { shell: true, stdio: 'ignore' });
    spawn('cmd.exe', ['/c', 'start', '"MONITOR BACKEND"', 'cmd.exe', '/k', 'node', 'monitor.js', 'backend'], { shell: true, stdio: 'ignore' });
    spawn('cmd.exe', ['/c', 'start', '"MONITOR IA & RAG"', 'cmd.exe', '/k', 'node', 'monitor.js', 'ai'], { shell: true, stdio: 'ignore' });
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
    
    const npmCmd = isWin ? 'npm run dev' : 'npm run dev';
    const proc = spawn(npmCmd, { cwd: './frontend', shell: true });
    proc.stdout.on('data', data => formatLog('FRONTEND', colors.frontend, data));
    proc.stderr.on('data', data => formatLog('FRONTEND', colors.error, data));
  } 
  else if (mode === 'backend') {
    console.log(`${colors.backend}${colors.bright}========================================`);
    console.log(`[⚙️] MONITOREO BACKEND (DJANGO API)`);
    console.log(`========================================${colors.reset}\n`);
    
    const pythonCmd = isWin ? '.venv\\Scripts\\python.exe manage.py runserver --noreload' : '.venv/bin/python manage.py runserver --noreload';
    const proc = spawn(pythonCmd, { cwd: './backend', shell: true, env: { ...process.env, PYTHONUNBUFFERED: '1' } });
    proc.stdout.on('data', data => formatLog('BACKEND', colors.backend, data));
    proc.stderr.on('data', data => formatLog('BACKEND', colors.error, data));
  }
  else if (mode === 'ai') {
    const aiColor = '\x1b[38;5;208m'; // Naranja
    console.log(`${aiColor}${colors.bright}========================================`);
    console.log(`[🤖] MONITOREO INTELIGENCIA ARTIFICIAL (OLLAMA / RAG)`);
    console.log(`========================================${colors.reset}\n`);
    
    let ollamaStatusLogged = false;
    const checkOllama = () => {
      fetch('http://127.0.0.1:11434/api/tags')
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            const models = data.models.map(m => m.name).join(', ') || 'Ninguno';
            if (!ollamaStatusLogged) {
                formatLog('MOTOR IA', aiColor, `Servicio activo en el puerto 11434. Modelos locales disponibles: ${models}`);
                ollamaStatusLogged = true;
            }
        })
        .catch(err => {
            formatLog('MOTOR IA', colors.warning, 'No se pudo conectar al API de Ollama (127.0.0.1:11434). ¿Está iniciado el servicio?');
            ollamaStatusLogged = false; // Reset to log again when it comes back
        });
    };

    console.log(`\x1b[36m[i] Iniciando monitor HTTP...\x1b[0m\n`);
    checkOllama();
    setInterval(checkOllama, 30000); // Check less frequently (30s)

    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, 'backend', 'rag_ia.log');
    
    if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '');
    }

    let fileSize = fs.statSync(logPath).size;
    
    fs.watchFile(logPath, { interval: 500 }, (curr, prev) => {
        if (curr.size > fileSize) {
            const stream = fs.createReadStream(logPath, { start: fileSize, end: curr.size });
            stream.on('data', chunk => {
                // Escribir el chunk directamente a la consola sin modificar para mantener formato JSON en vivo
                process.stdout.write(aiColor + chunk.toString() + colors.reset);
            });
            fileSize = curr.size;
        } else if (curr.size < fileSize) {
            // File was truncated
            fileSize = curr.size;
        }
    });
  }
}
