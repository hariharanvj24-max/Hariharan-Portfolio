/**
 * SENTINEL-OS // CYBER HACKER PORTFOLIO ENGINE
 * Operator: HARIHARAN A - Cybersecurity Engineer (SOC & Threat Analysis)
 */

(function () {
  'use strict';

  // State Management
  const state = {
    soundEnabled: true,
    crtEnabled: true,
    matrixEnabled: true,
    cmdHistory: [],
    historyIndex: -1,
  };

  // =========================================================================
  // 1. WEB AUDIO SYNTHESIZER (ZERO-DEPENDENCY RETRO AUDIO FX)
  // =========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration = 0.08, type = 'sine', gainVal = 0.05) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not permitted yet
    }
  }

  function playKeyClick() {
    playTone(600 + Math.random() * 200, 0.03, 'triangle', 0.02);
  }

  function playSuccessTone() {
    playTone(523.25, 0.08, 'sine', 0.05); // C5
    setTimeout(() => playTone(659.25, 0.08, 'sine', 0.05), 80); // E5
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.06), 160); // G5
  }

  function playAlertTone() {
    playTone(400, 0.12, 'sawtooth', 0.06);
    setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.06), 120);
  }

  // =========================================================================
  // 2. MATRIX DIGITAL RAIN SIMULATOR
  // =========================================================================
  const canvas = document.getElementById('matrix-canvas');
  let ctx = null;
  let drops = [];
  const matrixChars = '01ABCDEF0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

  function initMatrix() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeMatrix();
    window.addEventListener('resize', resizeMatrix);
  }

  function resizeMatrix() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }
  }

  function renderMatrix() {
    if (!ctx || !state.matrixEnabled) {
      requestAnimationFrame(renderMatrix);
      return;
    }

    ctx.fillStyle = 'rgba(3, 7, 18, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff66';
    ctx.font = '14px "Share Tech Mono", monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * 14;
      const y = drops[i] * 14;

      // Occasional bright leading char
      if (Math.random() > 0.85) {
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = '#00ff66';
      }

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    requestAnimationFrame(renderMatrix);
  }

  // =========================================================================
  // 3. SOC TOP HUD & CLOCK
  // =========================================================================
  function initClock() {
    const clockEl = document.getElementById('socClock');
    function updateClock() {
      if (!clockEl) return;
      const now = new Date();
      const utcStr = now.toISOString().slice(11, 19) + ' UTC';
      clockEl.textContent = utcStr;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  function initHudControls() {
    // Sound Toggle
    const soundBtn = document.getElementById('soundToggle');
    const soundStatus = document.getElementById('soundStatusText');
    const soundIcon = document.getElementById('soundIcon');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        soundStatus.textContent = state.soundEnabled ? 'ON' : 'MUTED';
        soundIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        if (state.soundEnabled) playSuccessTone();
        showToast(`Sound SFX ${state.soundEnabled ? 'Activated' : 'Silenced'}`);
      });
    }

    // CRT Scanlines Toggle
    const crtBtn = document.getElementById('crtToggle');
    const crtStatus = document.getElementById('crtStatusText');
    if (crtBtn) {
      crtBtn.addEventListener('click', () => {
        state.crtEnabled = !state.crtEnabled;
        document.body.classList.toggle('crt-off', !state.crtEnabled);
        crtStatus.textContent = state.crtEnabled ? 'ON' : 'OFF';
        playKeyClick();
        showToast(`CRT Scanline Filter: ${state.crtEnabled ? 'Enabled' : 'Disabled'}`);
      });
    }

    // Matrix Rain Toggle
    const matrixBtn = document.getElementById('matrixToggle');
    const matrixStatus = document.getElementById('matrixStatusText');
    if (matrixBtn) {
      matrixBtn.addEventListener('click', () => {
        state.matrixEnabled = !state.matrixEnabled;
        document.body.classList.toggle('matrix-off', !state.matrixEnabled);
        matrixStatus.textContent = state.matrixEnabled ? 'ON' : 'OFF';
        playKeyClick();
        showToast(`Matrix Rain: ${state.matrixEnabled ? 'Active' : 'Standby'}`);
      });
    }

    // Resume / Dossier Export (Print)
    const downloadResumeBtn = document.getElementById('downloadResumeBtn');
    if (downloadResumeBtn) {
      downloadResumeBtn.addEventListener('click', () => {
        playSuccessTone();
        showToast('Initiating Dossier Print / PDF Export sequence...');
        setTimeout(() => {
          window.print();
        }, 500);
      });
    }
  }

  // =========================================================================
  // 4. INTERACTIVE HACKER TERMINAL (SENTINEL-SOC)
  // =========================================================================
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalInput = document.getElementById('terminalInput');
  const terminalExecBtn = document.getElementById('terminalExecBtn');

  const commandLibrary = {
    help: {
      desc: 'Display available terminal commands',
      exec: () => `
<div class="term-out-info font-bold">SENTINEL-SOC COMMAND DIRECTORY // AVAILABLE ROUTINES:</div>
  <span class="cmd-highlight">whoami</span>       - Display identity, clearance, and security engineer role
  <span class="cmd-highlight">summary</span>      - Display professional summary & SOC profile
  <span class="cmd-highlight">experience</span>   - View SOC operational history (Navat Tech & L&T)
  <span class="cmd-highlight">projects</span>     - Inspect flagship projects & threat detection labs
  <span class="cmd-highlight">skills</span>       - List cyber arsenal, SIEM, EDR, and offensive lab tools
  <span class="cmd-highlight">mitre</span>        - Display MITRE ATT&CK coverage matrix mapping
  <span class="cmd-highlight">cert</span>         - Verify Certified Ethical Hacker (CEH) accreditation
  <span class="cmd-highlight">hunt</span>         - Execute simulated automated threat hunting triage
  <span class="cmd-highlight">splunk</span>       - Execute sample SPL threat detection queries
  <span class="cmd-highlight">contact</span>      - Output secure communication channels (Email, Phone, LinkedIn)
  <span class="cmd-highlight">download</span>     - Trigger Security Dossier PDF export
  <span class="cmd-highlight">matrix</span>       - Toggle background Matrix digital rain
  <span class="cmd-highlight">sound</span>        - Toggle terminal audio sound effects
  <span class="cmd-highlight">clear</span>        - Clear terminal console screen
      `
    },

    whoami: {
      desc: 'Display current operator identity & credentials',
      exec: () => `
<div class="term-out-dossier">
  <div class="font-bold text-accent">OPERATOR DOSSIER // HARIHARAN A</div>
  <div>ROLE:        Cybersecurity Engineer (SOC & Threat Analysis)</div>
  <div>CLEARANCE:   Certified Ethical Hacker (CEH) - EC-Council</div>
  <div>LOCATION:    Chennai, Tamil Nadu, India [13.0827° N, 80.2707° E]</div>
  <div>EXPERIENCE:  1.3+ Years Active SOC Operations (Tier-1)</div>
  <div>STATUS:      AVAILABLE FOR SOC / THREAT ANALYST DEPLOYMENT</div>
</div>
      `
    },

    summary: {
      desc: 'Display professional summary',
      exec: () => `
<div class="term-out-info font-bold">PROFESSIONAL EXECUTIVE SUMMARY:</div>
<div style="margin-top: 0.35rem; color: #cbd5e1;">
Cybersecurity Engineer with <strong>1.3 years of hands-on Security Operations Center (SOC)</strong> experience in alert investigation, incident response, and threat analysis using Splunk SIEM, Microsoft Sentinel, and Microsoft Defender for Endpoint (EDR/XDR). Experienced across endpoint, network, identity, and email domains, with a methodical, evidence-driven approach to triage and escalation. Skilled in malware triage (VirusTotal, YARA), threat hunting, log forensics support, and adversary emulation (Atomic Red Team, Metasploit, Mimikatz). CEH certified.
</div>
      `
    },

    experience: {
      desc: 'List work experience',
      exec: () => `
<div class="term-out-info font-bold">SOC OPERATIONAL TIMELINE:</div>

<div class="term-out-dossier">
  <div class="text-green font-bold">[1] NAVAT TECHNOLOGY &mdash; Cybersecurity Engineer (SOC Level 1)</div>
  <div class="text-dim">Aug 2025 – Present | Chennai, India</div>
  <div style="margin-top: 0.25rem;">
  • Investigate 20–30 security alerts/shift via Splunk SIEM, Microsoft Sentinel, Defender XDR.<br>
  • Perform malware & phishing analysis using VirusTotal and YARA signatures.<br>
  • Multi-domain log correlation: endpoint, network, firewall, server, and identity.<br>
  • EDR/XDR defense across 150+ monitored enterprise endpoints.<br>
  • Monitor Entra ID for anomalous logins & privilege escalations.<br>
  • Maintain false-positive rate below 15%; 95%+ SLA escalation compliance.
  </div>
</div>

<div class="term-out-dossier">
  <div class="text-accent font-bold">[2] L&T TECHNOLOGY SERVICES &mdash; Cybersecurity Analyst Intern</div>
  <div class="text-dim">Oct 2024 – Jan 2025</div>
  <div style="margin-top: 0.25rem;">
  • Supported Senior Security Analyst in daily SOC alert review, log analysis, and incident documentation.<br>
  • Shadowed live incident investigations; mastered triage workflows and escalation playbooks.<br>
  • Reviewed endpoint and network traffic logs for anomaly identification and IOC extraction.
  </div>
</div>
      `
    },

    projects: {
      desc: 'List key projects and lab implementations',
      exec: () => `
<div class="term-out-info font-bold">SECURITY PROJECTS & LAB EMULATION:</div>

<div class="term-out-dossier">
  <div class="text-accent font-bold">Threat Detection & Analysis Using Splunk &mdash; L&T Tech Lab</div>
  <div>• Deployed and tuned Splunk Enterprise SIEM environment integrating multi-platform log sources.</div>
  <div>• Simulated attacks with Atomic Red Team; mapped adversary behaviors to 15+ MITRE ATT&CK techniques.</div>
  <div>• Lab exploitation using Metasploit, Mimikatz, and PowerShell to emulate APT attacks and validate detections.</div>
  <div>• Conducted vulnerability assessments using Tenable Nessus and OpenVAS.</div>
</div>

<div class="term-out-dossier">
  <div class="text-green font-bold">Malware Triage & YARA Classification Engine</div>
  <div>• Automated hash queries against VirusTotal API to obtain threat intelligence scores.</div>
  <div>• Authored customized YARA rules detecting encoded PowerShell downloaders and credential harvesting scripts.</div>
</div>
      `
    },

    skills: {
      desc: 'Display technical skills matrix',
      exec: () => `
<div class="term-out-info font-bold">CYBER ARSENAL MATRIX:</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.4rem;">
  <div>
    <span class="text-accent font-bold">[THREAT ANALYSIS]</span><br>
    • Malware Triage & Reports<br>
    • YARA & VirusTotal API<br>
    • Threat Hunting & Forensics<br>
    • MITRE ATT&CK Mapping
  </div>
  <div>
    <span class="text-green font-bold">[SOC OPERATIONS]</span><br>
    • Splunk SIEM (SPL)<br>
    • Microsoft Sentinel<br>
    • Defender for Endpoint (EDR)<br>
    • Microsoft Entra ID (IAM)
  </div>
  <div>
    <span class="text-amber font-bold">[NETWORK & SECURITY TOOLS]</span><br>
    • Suricata IDS/IPS & Firewalls<br>
    • Wireshark Packet Sniffing<br>
    • TCP/IP, DNS, HTTP Protocols<br>
    • Sysmon Event Auditing
  </div>
  <div>
    <span class="text-red font-bold">[OFFENSIVE LABS & SCRIPTING]</span><br>
    • Metasploit & Mimikatz<br>
    • Atomic Red Team<br>
    • Nessus & OpenVAS<br>
    • Python, PowerShell, Bash
  </div>
</div>
      `
    },

    mitre: {
      desc: 'Display MITRE ATT&CK mappings',
      exec: () => `
<div class="term-out-info font-bold">MITRE ATT&CK TECHNIQUES COVERED (15+ TACTICS):</div>
<div>• <span class="text-green">T1059.001</span>: PowerShell Command & Scripting Interpreter (EDR/Sysmon)</div>
<div>• <span class="text-green">T1003.001</span>: OS Credential Dumping - LSASS Memory (Mimikatz Lab)</div>
<div>• <span class="text-green">T1566</span>: Phishing Email Attachments & Lures (VirusTotal & YARA)</div>
<div>• <span class="text-green">T1078</span>: Valid Accounts & Anomalous Logins (Microsoft Entra ID)</div>
<div>• <span class="text-green">T1053</span>: Scheduled Task/Job Persistence (Windows Security 4698)</div>
<div>• <span class="text-green">T1070</span>: Indicator Removal / Event Log Clearing (EventCode 1102)</div>
<div>• <span class="text-green">T1071</span>: Application Layer Non-Standard Protocol (Suricata IDS)</div>
      `
    },

    cert: {
      desc: 'Verify CEH Certification',
      exec: () => `
<div class="term-out-dossier" style="border-left-color: var(--color-green);">
  <div class="text-green font-bold">CERTIFIED ETHICAL HACKER (CEH) &mdash; EC-COUNCIL</div>
  <div>CREDENTIAL ID: ECC-2024-HARIHARAN-CEH</div>
  <div>STATUS:        ACTIVE // VALID MAR 2024 &mdash; MAR 2027</div>
  <div>ACCREDITATION: ANSI 17024 Accredited Cybersecurity Standard</div>
</div>
      `
    },

    splunk: {
      desc: 'Run simulated Splunk SPL search query',
      exec: () => {
        setTimeout(playAlertTone, 200);
        return `
<div class="term-out-info font-bold">> EXECUTING SPL SEARCH: index=security sourcetype=WinEventLog:Security EventCode=4688 Image="*powershell.exe*" | head 3</div>
<div style="color: #38bdf8; font-size: 0.78rem; font-family: monospace; margin-top: 0.35rem;">
[EVENT 1] 2026-11-03 12:14:02 | Host: WKSTN-042 | Parent: WINWORD.EXE | CommandLine: powershell.exe -enc SQBFAFgA... | User: CORP\\finance_user
[EVENT 2] 2026-11-03 12:14:08 | Host: WKSTN-042 | Action: Outbound Connection TCP/8080 -> 185.220.101.5 | Status: BLOCKED BY SURICATA
[EVENT 3] 2026-11-03 12:14:15 | Host: WKSTN-042 | Defender EDR: Isolation command sent. Host containment active.
</div>
<div class="text-green" style="margin-top: 0.35rem;">[SUCCESS] SPL search yielded 3 correlated IOC events. Case escalated to SOC L2.</div>
        `;
      }
    },

    hunt: {
      desc: 'Run interactive threat hunt sequence',
      exec: () => {
        openThreatHuntModal();
        return `<div class="text-green">Launching Live SOC Threat Hunt Simulation Console...</div>`;
      }
    },

    contact: {
      desc: 'Display contact information',
      exec: () => `
<div class="term-out-dossier">
  <div class="text-accent font-bold">DIRECT SECURE UPLINK CHANNELS:</div>
  <div>EMAIL:    <a href="mailto:hariharanvj24@gmail.com" class="text-green">hariharanvj24@gmail.com</a></div>
  <div>PHONE:    <a href="tel:+919344136854" class="text-green">+91 93441 36854</a></div>
  <div>LINKEDIN: <a href="https://linkedin.com/in/hariharan2415" target="_blank" class="text-cyan">linkedin.com/in/hariharan2415</a></div>
  <div>BASE:     Chennai, Tamil Nadu, India</div>
</div>
      `
    },

    matrix: {
      desc: 'Toggle matrix digital rain',
      exec: () => {
        state.matrixEnabled = !state.matrixEnabled;
        document.body.classList.toggle('matrix-off', !state.matrixEnabled);
        const matrixStatus = document.getElementById('matrixStatusText');
        if (matrixStatus) matrixStatus.textContent = state.matrixEnabled ? 'ON' : 'OFF';
        return `Matrix Digital Rain: ${state.matrixEnabled ? 'ONLINE' : 'OFFLINE'}`;
      }
    },

    sound: {
      desc: 'Toggle terminal sound effects',
      exec: () => {
        state.soundEnabled = !state.soundEnabled;
        const soundStatus = document.getElementById('soundStatusText');
        const soundIcon = document.getElementById('soundIcon');
        if (soundStatus) soundStatus.textContent = state.soundEnabled ? 'ON' : 'MUTED';
        if (soundIcon) soundIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        return `Terminal Audio Sound FX: ${state.soundEnabled ? 'ACTIVATED' : 'MUTED'}`;
      }
    },

    download: {
      desc: 'Download security dossier resume',
      exec: () => {
        setTimeout(() => window.print(), 300);
        return `<div class="text-green">Opening print dialog for Security Dossier export...</div>`;
      }
    },

    clear: {
      desc: 'Clear the terminal output',
      exec: () => {
        terminalOutput.innerHTML = '';
        return null;
      }
    },

    sudo: {
      desc: 'Root authorization test',
      exec: () => {
        playAlertTone();
        return `<div class="text-red font-bold">ALERT: Unauthorized sudo invocation recorded in audit log. SOC L1 security policies strictly enforce least-privilege access!</div>`;
      }
    }
  };

  // Alias commands
  commandLibrary['?'] = commandLibrary.help;
  commandLibrary['id'] = commandLibrary.whoami;
  commandLibrary['history'] = commandLibrary.experience;
  commandLibrary['exp'] = commandLibrary.experience;
  commandLibrary['labs'] = commandLibrary.projects;
  commandLibrary['arsenal'] = commandLibrary.skills;
  commandLibrary['ceh'] = commandLibrary.cert;
  commandLibrary['scan'] = commandLibrary.hunt;
  commandLibrary['resume'] = commandLibrary.download;
  commandLibrary['cls'] = commandLibrary.clear;

  function executeCommand(inputCmd) {
    const rawCmd = inputCmd.trim();
    if (!rawCmd) return;

    state.cmdHistory.push(rawCmd);
    state.historyIndex = state.cmdHistory.length;

    // Echo command in terminal
    const cmdEcho = document.createElement('div');
    cmdEcho.className = 'term-line';
    cmdEcho.innerHTML = `<span class="prompt-user">hariharan</span><span class="prompt-at">@</span><span class="prompt-host">sentinel-soc</span>:<span class="prompt-dir">~</span><span class="prompt-symbol">$</span> <span class="term-out-cmd">${escapeHtml(rawCmd)}</span>`;
    terminalOutput.appendChild(cmdEcho);

    const parts = rawCmd.split(' ');
    const primaryCmd = parts[0].toLowerCase();

    // Check custom commands like 'cat summary.txt'
    if (primaryCmd === 'cat') {
      const target = (parts[1] || '').toLowerCase();
      let outputContent = '';
      if (target === 'summary.txt' || target === 'summary') {
        outputContent = commandLibrary.summary.exec();
      } else if (target === 'skills.txt' || target === 'skills') {
        outputContent = commandLibrary.skills.exec();
      } else if (target === 'contact.txt' || target === 'contact') {
        outputContent = commandLibrary.contact.exec();
      } else {
        outputContent = `<div class="term-out-warn">cat: ${escapeHtml(target || '')}: No such file. Try: <span class="cmd-highlight">cat summary.txt</span></div>`;
      }
      appendTerminalOutput(outputContent);
    } else if (commandLibrary[primaryCmd]) {
      const result = commandLibrary[primaryCmd].exec();
      if (result !== null) {
        appendTerminalOutput(result);
      }
      playSuccessTone();
    } else {
      playAlertTone();
      appendTerminalOutput(`
        <div class="term-out-error">command not found: "${escapeHtml(primaryCmd)}". Type <span class="cmd-highlight">help</span> for authorized commands.</div>
      `);
    }

    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function appendTerminalOutput(html) {
    const outDiv = document.createElement('div');
    outDiv.className = 'term-line';
    outDiv.innerHTML = html;
    terminalOutput.appendChild(outDiv);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function initTerminal() {
    if (!terminalInput) return;

    terminalInput.addEventListener('keydown', (e) => {
      playKeyClick();

      if (e.key === 'Enter') {
        const cmd = terminalInput.value;
        terminalInput.value = '';
        executeCommand(cmd);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.cmdHistory.length > 0 && state.historyIndex > 0) {
          state.historyIndex--;
          terminalInput.value = state.cmdHistory[state.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex < state.cmdHistory.length - 1) {
          state.historyIndex++;
          terminalInput.value = state.cmdHistory[state.historyIndex];
        } else {
          state.historyIndex = state.cmdHistory.length;
          terminalInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentVal = terminalInput.value.toLowerCase().trim();
        if (currentVal) {
          const match = Object.keys(commandLibrary).find(k => k.startsWith(currentVal));
          if (match) {
            terminalInput.value = match;
          }
        }
      }
    });

    if (terminalExecBtn) {
      terminalExecBtn.addEventListener('click', () => {
        const cmd = terminalInput.value;
        terminalInput.value = '';
        executeCommand(cmd);
      });
    }

    // Quick run buttons
    document.querySelectorAll('.term-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          executeCommand(cmd);
          terminalInput.focus();
        }
      });
    });
  }

  // =========================================================================
  // 5. MITRE ATT&CK INTERACTIVE DETAILS
  // =========================================================================
  const mitreTechniques = {
    'T1566': {
      title: 'T1566: Phishing (Attachments & Links)',
      tactic: 'Initial Access',
      socProcedure: 'Tier-1 playbook: Extract email headers, inspect SPF/DKIM/DMARC alignment, submit attached document or suspicious payload hash to VirusTotal API, verify hash with custom YARA detection rules, and block malicious sender domain.',
      labValidation: 'Tested sample phishing lures containing encoded macros in isolated Windows lab sandbox.'
    },
    'T1190': {
      title: 'T1190: Exploit Public-Facing Application',
      tactic: 'Initial Access',
      socProcedure: 'Suricata IDS detection: Inspect HTTP payloads for anomalous URI parameters, SQLi/RCE patterns, and CVE-specific exploits; correlate with firewall drop logs.',
      labValidation: 'Vulnerability assessment performed using Tenable Nessus and OpenVAS on test Apache/IIS servers.'
    },
    'T1059.001': {
      title: 'T1059.001: PowerShell Command & Scripting',
      tactic: 'Execution',
      socProcedure: 'Defender for Endpoint / Sysmon EventCode 1: Detect PowerShell executed with flags like -enc, -nop, -w hidden, or calling Net.WebClient download strings. Host isolation playbook triggered if unsigned DLL is loaded.',
      labValidation: 'Atomic Red Team test: Invoke-AtomicTest T1059.001 executed in lab to calibrate detection alerts.'
    },
    'T1059.003': {
      title: 'T1059.003: Windows Command Shell',
      tactic: 'Execution',
      socProcedure: 'Splunk alert: cmd.exe spawned as child process of Microsoft Office (winword.exe, excel.exe) or web server processes (w3wp.exe).',
      labValidation: 'Simulated APT execution flow using Metasploit payload delivery.'
    },
    'T1047': {
      title: 'T1047: Windows Management Instrumentation (WMI)',
      tactic: 'Execution',
      socProcedure: 'Monitored wmiprvse.exe activity and Microsoft-Windows-WMI-Activity operational logs to detect remote process spawning.',
      labValidation: 'Emulated via Atomic Red Team WMI persistence and execution tests.'
    },
    'T1053': {
      title: 'T1053: Scheduled Task / Job',
      tactic: 'Persistence',
      socProcedure: 'Splunk SIEM query: index=windows EventCode=4698 (A scheduled task was created) where TaskName or Action path resides in AppData or Temp directories.',
      labValidation: 'Created automated backdoor tasks with PowerShell in lab target host to trigger telemetry.'
    },
    'T1078': {
      title: 'T1078: Valid Accounts (Microsoft Entra ID)',
      tactic: 'Defense Evasion & Initial Access',
      socProcedure: 'Microsoft Sentinel & Entra ID: Investigate anomalous logins (risky user score > 70), impossible travel, and privilege escalation attempts from untrusted geolocation IPs.',
      labValidation: 'Assisted in validating identity risk policies and multi-factor authentication (MFA) enforcement.'
    },
    'T1547': {
      title: 'T1547: Boot or Logon Autostart Execution',
      tactic: 'Persistence',
      socProcedure: 'Sysmon EventCode 13 (Registry value set): Monitored HKCU/HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run keys for unauthorized binaries.',
      labValidation: 'Tested persistence artifacts in VM lab; captured forensic memory image for verification.'
    },
    'T1003.001': {
      title: 'T1003.001: OS Credential Dumping - LSASS Memory',
      tactic: 'Credential Access',
      socProcedure: 'High Severity Alert: Sysmon EventCode 10 (ProcessAccess) targeting lsass.exe with GrantedAccess mask 0x1010 or 0x1fffff. Immediate host network isolation via Defender for Endpoint.',
      labValidation: 'Executed Mimikatz sekurlsa::logonpasswords in lab; refined SPL detection query to filter legitimate Antivirus LSASS queries, reducing false positives.'
    },
    'T1110': {
      title: 'T1110: Brute Force & Password Spraying',
      tactic: 'Credential Access',
      socProcedure: 'Splunk SIEM correlation: EventCode 4625 (Failed logon) > 20 occurrences within 2 minutes targeting unique usernames from a single external IP.',
      labValidation: 'Executed Hydra password spray against lab AD domain controller to verify SIEM threshold alerting.'
    },
    'T1070': {
      title: 'T1070: Indicator Removal on Host (Log Clearing)',
      tactic: 'Defense Evasion',
      socProcedure: 'Critical SIEM Alert: EventCode 1102 (The audit log was cleared) or EventCode 104 (System log cleared). Triggers immediate escalation to L2/L3 security analysts.',
      labValidation: 'Simulated wevtutil cl Security in lab to test SIEM alert latency and notification pipeline.'
    },
    'T1071': {
      title: 'T1071: Application Layer Protocol (C2 Beacons)',
      tactic: 'Command & Control',
      socProcedure: 'Suricata IDS & Firewall: Inspect periodic HTTP/HTTPS POST requests with fixed sleep intervals, abnormal User-Agent strings, or dynamic DNS resolution.',
      labValidation: 'Emulated Cobalt Strike / Metasploit HTTP reverse beaconing in closed virtual network.'
    }
  };

  function initMitreMatrix() {
    const cells = document.querySelectorAll('.mitre-cell');
    const detailsContainer = document.getElementById('techniqueDetails');

    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        cells.forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        playKeyClick();

        const techId = cell.getAttribute('data-technique');
        const data = mitreTechniques[techId];

        if (data && detailsContainer) {
          detailsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
              <div class="font-bold text-accent" style="font-size: 0.95rem;">${data.title}</div>
              <span class="tech-badge">TACTIC: ${data.tactic.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 0.4rem; color: #e2e8f0;">
              <strong class="text-green"><i class="fa-solid fa-shield-virus"></i> SOC L1 Triage Playbook:</strong> ${data.socProcedure}
            </div>
            <div style="color: #cbd5e1;">
              <strong class="text-amber"><i class="fa-solid fa-flask"></i> Lab Emulation / Validation:</strong> ${data.labValidation}
            </div>
          `;
        }
      });
    });
  }

  // =========================================================================
  // 6. SIMULATED THREAT HUNT MODAL
  // =========================================================================
  const threatHuntModal = document.getElementById('threatHuntModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const dismissModalBtn = document.getElementById('dismissModalBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const triggerSimHuntBtn = document.getElementById('triggerSimHuntBtn');
  const startHuntSeqBtn = document.getElementById('startHuntSeqBtn');
  const huntLogBox = document.getElementById('huntLogBox');

  function openThreatHuntModal() {
    if (!threatHuntModal) return;
    threatHuntModal.classList.add('modal-active');
    playTone(550, 0.08);
  }

  function closeThreatHuntModal() {
    if (!threatHuntModal) return;
    threatHuntModal.classList.remove('modal-active');
  }

  function initThreatHuntModal() {
    if (triggerSimHuntBtn) {
      triggerSimHuntBtn.addEventListener('click', openThreatHuntModal);
    }
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeThreatHuntModal);
    }
    if (dismissModalBtn) {
      dismissModalBtn.addEventListener('click', closeThreatHuntModal);
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeThreatHuntModal);
    }

    if (startHuntSeqBtn) {
      startHuntSeqBtn.addEventListener('click', runThreatHuntSequence);
    }
  }

  function runThreatHuntSequence() {
    if (!startHuntSeqBtn) return;
    startHuntSeqBtn.disabled = true;
    startHuntSeqBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> HUNTING IN PROGRESS...';
    huntLogBox.innerHTML = '';

    const steps = [
      { id: 'step1', log: '[12:15:01] [SIEM ALERT] Microsoft Defender XDR detected suspicious process tree: WINWORD.EXE -> powershell.exe -enc... (Host: WKSTN-FIN-042)' },
      { id: 'step2', log: '[12:15:08] [TRIAGE] Extracted file hash 8f4a7c2e... querying VirusTotal API. Result: 54/71 engines flag AgentTesla infostealer. YARA rule match.' },
      { id: 'step3', log: '[12:15:15] [CORRELATION] Splunk query across firewall logs reveals active TCP/8080 C2 beacon. Entra ID query shows user MFA challenge pending.' },
      { id: 'step4', log: '[12:15:22] [CONTAINMENT] Defender EDR host isolation applied. Credentials revoked. Incident dossier escalated to L2 team in JIRA (Ticket SOC-8821). SLA: Met.' }
    ];

    let current = 0;

    function processStep() {
      if (current < steps.length) {
        // Highlight stepper
        for (let i = 1; i <= 4; i++) {
          const stepEl = document.getElementById(`step${i}`);
          if (stepEl) {
            if (i < current + 1) {
              stepEl.className = 'hunt-step step-completed';
            } else if (i === current + 1) {
              stepEl.className = 'hunt-step step-active';
            } else {
              stepEl.className = 'hunt-step';
            }
          }
        }

        // Add log
        const logLine = document.createElement('div');
        logLine.className = 'hunt-log-line text-cyan';
        logLine.textContent = steps[current].log;
        huntLogBox.appendChild(logLine);
        huntLogBox.scrollTop = huntLogBox.scrollHeight;
        playTone(600 + current * 100, 0.08);

        current++;
        setTimeout(processStep, 1500);
      } else {
        const finalLine = document.createElement('div');
        finalLine.className = 'hunt-log-line text-green font-bold';
        finalLine.textContent = '>> THREAT NEUTRALIZED // COMPLETE FORENSIC TIMELINE GENERATED.';
        huntLogBox.appendChild(finalLine);
        playSuccessTone();

        startHuntSeqBtn.disabled = false;
        startHuntSeqBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> RE-RUN SIMULATION';
        showToast('Threat Hunt Sequence Completed Successfully!');
      }
    }

    processStep();
  }

  // =========================================================================
  // 7. COPY UTILITIES & TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message) {
    const toast = document.getElementById('cyberToast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('toast-visible');

    setTimeout(() => {
      toast.classList.remove('toast-visible');
    }, 3200);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        playSuccessTone();
        showToast(successMsg);
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      playSuccessTone();
      showToast(successMsg);
    } catch (e) {
      showToast('Copy failed. Please copy manually.');
    }
    document.body.removeChild(ta);
  }

  function initCopyButtons() {
    const copySplBtn = document.getElementById('copySplBtn');
    if (copySplBtn) {
      copySplBtn.addEventListener('click', () => {
        const spl = `index=wineventlog EventCode=10 TargetImage="*\\lsass.exe*" \nGrantedAccess IN ("0x1010", "0x1438", "0x1fffff")\n| eval Technique="T1003.001 - LSASS Memory Dumping"\n| stats count min(_time) as first_seen max(_time) as last_seen by SourceImage, TargetImage, Computer, User\n| where count > 0`;
        copyToClipboard(spl, 'Splunk SPL query copied to clipboard!');
      });
    }

    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        copyToClipboard('hariharanvj24@gmail.com', 'Email copied: hariharanvj24@gmail.com');
      });
    }

    const copyPhoneBtn = document.getElementById('copyPhoneBtn');
    if (copyPhoneBtn) {
      copyPhoneBtn.addEventListener('click', () => {
        copyToClipboard('+919344136854', 'Phone number copied: +91 93441 36854');
      });
    }

    const copyAllDetailsBtn = document.getElementById('copyAllDetailsBtn');
    if (copyAllDetailsBtn) {
      copyAllDetailsBtn.addEventListener('click', () => {
        const vcard = `NAME: Hariharan A\nROLE: Cybersecurity Engineer (SOC & Threat Analysis)\nCERTIFICATION: Certified Ethical Hacker (CEH)\nPHONE: +91 93441 36854\nEMAIL: hariharanvj24@gmail.com\nLINKEDIN: https://linkedin.com/in/hariharan2415\nLOCATION: Chennai, India`;
        copyToClipboard(vcard, 'Full Contact Dossier copied to clipboard!');
      });
    }
  }

  // =========================================================================
  // 8. CONTACT FORM ENCRYPTED TRANSMIT
  // =========================================================================
  function initContactForm() {
    const contactForm = document.getElementById('cyberContactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('senderName').value;
      const senderEmail = document.getElementById('senderEmail').value;
      const subject = document.getElementById('messageSubject').value;
      const body = document.getElementById('messageBody').value;

      playSuccessTone();

      const mailtoUrl = `mailto:hariharanvj24@gmail.com?subject=${encodeURIComponent(`[SOC Uplink] ${subject} - From: ${senderName}`)}&body=${encodeURIComponent(`Operator Hariharan A,\n\nSender: ${senderName} (${senderEmail})\nSubject: ${subject}\n\nPayload:\n${body}\n\n[Transmitted via Sentinel-SOC Portal]`)}`;

      showToast('Opening secure transmission channel via email client...');
      window.location.href = mailtoUrl;
    });
  }

  // =========================================================================
  // 9. DYNAMIC TELEMETRY TICKER STREAM
  // =========================================================================
  function initDynamicTicker() {
    const tickerFeed = document.getElementById('liveTickerFeed');
    if (!tickerFeed) return;

    const dynamicAlerts = [
      '<span class="ticker-item"><span class="ticker-tag alert-blue">[DEFENDER-EDR]</span> Endpoint host WKSTN-DEV-19 quarantined after anomalous DLL injection alert</span>',
      '<span class="ticker-item"><span class="ticker-tag alert-amber">[SPLUNK-SIEM]</span> Threat Hunting rule triggered: EventCode 4698 (Scheduled task created in AppData)</span>',
      '<span class="ticker-item"><span class="ticker-tag alert-green">[YARA-CLASSIFY]</span> Signature Trojan.Downloader.AgentTesla verified with 54 vendor detections</span>',
      '<span class="ticker-item"><span class="ticker-tag alert-red">[SENTINEL]</span> High-priority identity alert: Brute force spike mitigated on Microsoft Entra ID</span>'
    ];

    let alertIndex = 0;
    setInterval(() => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = dynamicAlerts[alertIndex % dynamicAlerts.length];
      const newItem = tempDiv.firstChild;
      if (newItem && tickerFeed.children.length > 8) {
        tickerFeed.removeChild(tickerFeed.children[0]);
      }
      if (newItem) tickerFeed.appendChild(newItem);
      alertIndex++;
    }, 12000);
  }

  // =========================================================================
  // 10. ACTIVE NAVIGATION DECK SYNC
  // =========================================================================
  function initNavDeck() {
    const sections = document.querySelectorAll('.cyber-section');
    const navTabs = document.querySelectorAll('.nav-tab');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 200;

      sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      if (currentSectionId) {
        navTabs.forEach(tab => {
          tab.classList.toggle('active', tab.getAttribute('href') === `#${currentSectionId}`);
        });
      }
    });

    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        playKeyClick();
      });
    });
  }

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    renderMatrix();
    initClock();
    initHudControls();
    initTerminal();
    initMitreMatrix();
    initThreatHuntModal();
    initCopyButtons();
    initContactForm();
    initDynamicTicker();
    initNavDeck();

    // Welcome terminal hint sound
    document.body.addEventListener('click', () => {
      initAudio();
    }, { once: true });
  });

})();
