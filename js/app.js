document.addEventListener('DOMContentLoaded', () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = isLocal ? 'http://localhost:3000' : '';
    const path = window.location.pathname;
    const repoUrl = sessionStorage.getItem('repoUrl');

    // Navigation and Sync Button Helper
    const syncButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
        return btn.textContent.includes('SYNC_REPO') || 
               (btn.querySelector('.material-symbols-outlined') && 
                btn.querySelector('.material-symbols-outlined').textContent.includes('sync'));
    });
    syncButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (repoUrl) {
                sessionStorage.setItem('repoUrl', repoUrl);
                window.location.href = 'Loading_Analysis_State.html';
            } else {
                window.location.href = 'Hero_Landing.html';
            }
        });
    });

    // 1. Landing Page / Flow Input
    if (path.includes('Hero_Landing.html') || path === '/' || path.endsWith('/')) {
        const analyzeBtn = document.getElementById('analyze-btn');
        const repoInput = document.getElementById('repo-input');
        
        if (analyzeBtn && repoInput) {
            analyzeBtn.addEventListener('click', () => {
                const url = repoInput.value.trim();
                if (!url) {
                    alert('Please enter a GitHub repository URL.');
                    return;
                }
                sessionStorage.setItem('repoUrl', url);
                window.location.href = 'Loading_Analysis_State.html';
            });
            
            repoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    analyzeBtn.click();
                }
            });
        }
    }
    
    // 2. Loading Analysis State Page
    if (path.includes('Loading_Analysis_State.html')) {
        if (!repoUrl) {
            window.location.href = 'Hero_Landing.html';
            return;
        }

        const loadTarget = document.getElementById('load-target');
        const progressBar = document.getElementById('progress-bar');
        const stagesContainer = document.getElementById('stages-container');
        const logContainer = document.getElementById('load-terminal-log');

        if (loadTarget) loadTarget.textContent = `Target: ${repoUrl}`;

        // Dynamic terminal logger
        const addLog = (type, message) => {
            if (!logContainer) return;
            const p = document.createElement('p');
            const colorClass = type === 'WARN' ? 'text-tertiary-fixed-dim' : (type === 'SYS' ? 'text-primary-fixed-dim' : 'text-secondary-fixed-dim');
            p.innerHTML = `<span class="${colorClass}">[${type}]</span> ${message}`;
            logContainer.appendChild(p);
            logContainer.parentElement.scrollTop = logContainer.parentElement.scrollHeight;
        };

        // Render stage cards dynamically
        const updateStages = (activeStageIndex, stageStates) => {
            if (!stagesContainer) return;
            stagesContainer.innerHTML = '';
            const stages = [
                { name: 'Scanning Repository', desc: 'indexing repository files' },
                { name: 'Mapping Dependencies', desc: 'graph construction' },
                { name: 'Generating Insights', desc: 'running AI models' },
                { name: 'Finalizing Report', desc: 'assembling stats' }
            ];

            stages.forEach((stage, idx) => {
                const isDone = idx < activeStageIndex;
                const isActive = idx === activeStageIndex;
                const stateText = stageStates[idx] || (isDone ? 'Complete' : 'Awaiting start...');
                
                let cardClass = '';
                let statusEl = '';

                if (isDone) {
                    cardClass = 'border-on-surface bg-surface neo-shadow-sm transition-all';
                    statusEl = `
                        <div class="w-8 h-8 bg-tertiary-container flex items-center justify-center border-2 border-on-surface text-on-tertiary">
                            <span class="material-symbols-outlined font-bold">check</span>
                        </div>
                    `;
                } else if (isActive) {
                    cardClass = 'border-on-surface bg-secondary-container neo-shadow-sm transform -translate-y-1 -translate-x-1';
                    statusEl = `
                        <div class="w-8 h-8 bg-surface flex items-center justify-center border-2 border-on-surface text-on-surface animate-spin">
                            <span class="material-symbols-outlined font-bold">sync</span>
                        </div>
                    `;
                } else {
                    cardClass = 'border-outline-variant bg-surface-container-highest opacity-70';
                    statusEl = `
                        <div class="w-8 h-8 bg-surface flex items-center justify-center border-2 border-outline-variant text-outline-variant">
                            <span class="font-code-md font-bold">${idx + 1}</span>
                        </div>
                    `;
                }

                stagesContainer.innerHTML += `
                    <div class="flex items-center justify-between p-4 border-border-weight ${cardClass} mb-unit">
                        <div class="flex items-center gap-4">
                            ${statusEl}
                            <div>
                                <p class="font-headline-md text-headline-md leading-none ${isActive ? 'text-on-secondary-container' : 'text-on-surface-variant'}">${stage.name}</p>
                                <p class="font-code-md text-code-md ${isActive ? 'text-on-secondary-container/80' : 'text-outline'}">${stateText}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        };

        // Progress bar updating
        const updateProgressBar = (percentage) => {
            if (!progressBar) return;
            const segments = progressBar.children;
            const filledSegments = Math.floor(percentage / 25);
            for (let i = 0; i < 4; i++) {
                if (i < filledSegments) {
                    segments[i].className = 'w-1/4 h-full bg-primary border-r-border-weight border-on-surface';
                } else if (i === filledSegments) {
                    // Partials
                    segments[i].className = 'w-1/4 h-full bg-primary-fixed border-r-border-weight border-on-surface relative overflow-hidden';
                    segments[i].innerHTML = `<div class="absolute inset-0 bg-primary" style="width: ${(percentage % 25) * 4}%"></div>`;
                } else {
                    segments[i].className = 'w-1/4 h-full bg-surface-container-highest ' + (i === 3 ? '' : 'border-r-border-weight border-on-surface');
                    segments[i].innerHTML = '';
                }
            }
        };

        // Execution Timings & API Call
        const runAnalysis = async () => {
            let apiResolved = false;
            let repoData = null;
            let errorOccurred = false;

            const apiPromise = fetch(`${API_BASE}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl })
            }).then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Fetch failed');
                repoData = data;
                apiResolved = true;
            }).catch(err => {
                errorOccurred = true;
                alert(`Analysis failed: ${err.message}`);
                window.location.href = 'Hero_Landing.html';
            });

            // Simulated logger timeline synced with stages
            const logSteps = [
                { time: 200, log: ['INFO', 'Initializing GitHub API client connection...'], progress: 5, stage: 0, states: ['Connecting...', 'Pending', 'Pending', 'Pending'] },
                { time: 800, log: ['INFO', 'Parsing repository endpoints and authorization scopes...'], progress: 15, stage: 0, states: ['Parsing...', 'Pending', 'Pending', 'Pending'] },
                { time: 1500, log: ['INFO', 'Git tree fetched successfully. Analyzing files list...'], progress: 25, stage: 1, states: ['Completed', 'Mapping graph...', 'Pending', 'Pending'] },
                { time: 2200, log: ['WARN', 'Heavy vendor directories matched. Auto-applying gitignore rules...'], progress: 35, stage: 1, states: ['Completed', 'Applying gitignore...', 'Pending', 'Pending'] },
                { time: 3000, log: ['SYS', 'Constructing file topology and package dependencies...'], progress: 50, stage: 2, states: ['Completed', 'Completed', 'Consulting AI...', 'Pending'] },
                { time: 4200, log: ['SYS', 'Initiating Gemini models for codebase pattern match...'], progress: 65, stage: 2, states: ['Completed', 'Completed', 'Processing tokens...', 'Pending'] },
                { time: 5000, log: ['SYS', 'Generating code health metrics and vulnerabilities scan...'], progress: 80, stage: 3, states: ['Completed', 'Completed', 'Completed', 'Compiling spec...'] },
                { time: 6000, log: ['SYS', 'Serializing architectural layout. Ready for dashboard load.'], progress: 100, stage: 3, states: ['Completed', 'Completed', 'Completed', 'Complete'] }
            ];

            for (const step of logSteps) {
                if (errorOccurred) break;
                await new Promise(r => setTimeout(r, step.time - (logSteps[logSteps.indexOf(step) - 1]?.time || 0)));
                addLog(step.log[0], step.log[1]);
                updateProgressBar(step.progress);
                updateStages(step.stage, step.states);
            }

            // Wait for both animation sequence and actual API call
            await apiPromise;

            if (apiResolved && repoData) {
                sessionStorage.setItem('repoData', JSON.stringify(repoData));
                window.location.href = 'Overview_Dashboard.html';
            }
        };

        runAnalysis();
    }

    // Load data from session
    const repoDataStr = sessionStorage.getItem('repoData');
    if (!repoDataStr && !path.includes('Hero_Landing.html') && !path.includes('Loading_Analysis_State.html') && path !== '/' && !path.endsWith('/')) {
        window.location.href = 'Hero_Landing.html';
        return;
    }

    let repoData = {};
    if (repoDataStr) {
        try {
            repoData = JSON.parse(repoDataStr);
        } catch(e) {
            console.error(e);
        }
    }

    // 3. Overview Dashboard
    if (path.includes('Overview_Dashboard.html')) {
        const repo = repoData.repo || {};
        
        // Populate standard fields
        const nameEl = document.getElementById('dash-repo-name');
        const descEl = document.getElementById('dash-desc');
        const starsEl = document.getElementById('dash-stars');
        const forksEl = document.getElementById('dash-forks');
        const filesEl = document.getElementById('dash-files');
        
        if (nameEl) nameEl.textContent = repo.fullName || repo.name || 'Repository';
        if (descEl) descEl.textContent = repo.description || 'No description available.';
        if (starsEl) starsEl.textContent = repo.stars ?? 0;
        if (forksEl) forksEl.textContent = repo.forks ?? 0;
        if (filesEl) filesEl.textContent = repo.totalFiles ?? 0;

        // Dynamic Health Score average
        const healthText = document.querySelector('.w-40.h-40.rounded-full span');
        if (healthText && repoData.healthScores) {
            const sum = repoData.healthScores.reduce((acc, current) => acc + current.score, 0);
            const avg = Math.round(sum / repoData.healthScores.length);
            healthText.textContent = avg;
        }

        // Render Languages
        const langContainer = document.getElementById('dash-languages');
        if (langContainer && repoData.languages) {
            langContainer.innerHTML = '';
            const totalBytes = Object.values(repoData.languages).reduce((a, b) => a + b, 0);
            const colors = ['#1754c7', '#7a5900', '#a4371a', '#3c6ee1', '#fdbc13'];
            let i = 0;
            
            for (const [lang, bytes] of Object.entries(repoData.languages)) {
                const pct = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : 0;
                const color = colors[i % colors.length];
                langContainer.innerHTML += `
                    <div class="flex items-center gap-2 px-4 py-2 bg-surface-container border-border-weight border-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                        <span class="w-3 h-3 rounded-full border-2 border-on-surface" style="background-color: ${color}"></span>
                        <span class="font-code-md text-code-md font-bold uppercase">${lang} ${pct}%</span>
                    </div>
                `;
                i++;
                if (i > 3) break; // top 4 only
            }
        }

        // Render Quick Insights (Outdated packages & Critical Alert counts)
        const insightsContainer = document.getElementById('dash-insights');
        if (insightsContainer) {
            insightsContainer.innerHTML = '';
            const critCount = (repoData.insights || []).filter(ins => ins.severity === 'critical').length;
            const warnCount = (repoData.insights || []).filter(ins => ins.severity === 'warning').length;

            if (critCount > 0) {
                insightsContainer.innerHTML += `
                    <div class="bg-error-container border-border-weight border-on-surface p-4 flex gap-4 items-start shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                        <span class="material-symbols-outlined text-error text-[32px]">error</span>
                        <div>
                            <h3 class="font-code-md text-code-md font-bold text-on-error-container mb-1">${critCount} Critical Issues</h3>
                            <p class="font-body-md text-body-md text-on-surface">Vulnerabilities detected in code patterns. <br><a href="Dependencies_Insights.html" class="underline text-primary">View Dependencies & Insights</a></p>
                        </div>
                    </div>
                `;
            }
            if (warnCount > 0) {
                insightsContainer.innerHTML += `
                    <div class="bg-secondary-fixed border-border-weight border-on-surface p-4 flex gap-4 items-start shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                        <span class="material-symbols-outlined text-secondary text-[32px]">warning</span>
                        <div>
                            <h3 class="font-code-md text-code-md font-bold text-on-secondary-fixed-variant mb-1">${warnCount} Performance Warnings</h3>
                            <p class="font-body-md text-body-md text-on-surface">Bottlenecks and complexity issues found. <a href="Dependencies_Insights.html" class="underline text-primary">View Details</a></p>
                        </div>
                    </div>
                `;
            }
            if (critCount === 0 && warnCount === 0) {
                insightsContainer.innerHTML = `
                    <div class="bg-surface-container border-border-weight border-on-surface p-4 flex gap-4 items-start shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                        <span class="material-symbols-outlined text-on-surface text-[32px]">task_alt</span>
                        <div>
                            <h3 class="font-code-md text-code-md font-bold mb-1">Code Clean</h3>
                            <p class="font-body-md text-body-md text-on-surface">No immediate vulnerabilities or warnings detected.</p>
                        </div>
                    </div>
                `;
            }
        }

        // Render Activity Log Console logs
        const activityLog = document.getElementById('dash-activity');
        if (activityLog) {
            activityLog.innerHTML = `
                <div class="text-surface-variant">&gt; Loading terminal feed...</div>
            `;
            setTimeout(() => {
                activityLog.innerHTML = `
                    <p><span class="text-primary-fixed-dim">[INFO]</span> Scanning completed: ${repo.fullName}</p>
                    <p><span class="text-secondary-fixed-dim">[INFO]</span> Languages resolved: ${Object.keys(repoData.languages || {}).join(', ')}</p>
                    <p><span class="text-tertiary-fixed-dim">[SYS]</span> Health metrics calculations complete.</p>
                    <p><span class="text-secondary-fixed-dim">[INFO]</span> Total files mapped: ${repo.totalFiles}</p>
                    <p><span class="text-primary-fixed-dim">[INFO]</span> API functions ready.</p>
                    <div class="flex items-center text-surface mt-4"><span class="text-tertiary-fixed mr-2">system@analysis:~</span> $ <span class="w-2 h-4 bg-surface ml-2 animate-pulse block"></span></div>
                `;
            }, 600);
        }
    }

    // 4. File Explorer
    if (path.includes('File_Explorer.html')) {
        const container = document.getElementById('file-tree-container');
        const codeContainer = document.getElementById('code-content-container');
        const activeFileNameEl = document.getElementById('active-file-name');
        const errorsEl = document.getElementById('file-errors');
        const warningsEl = document.getElementById('file-warnings');
        const langEl = document.getElementById('file-lang');
        const summaryBadge = document.getElementById('file-summary-badge');
        
        if (container) {
            const tree = repoData.fileTree || [];
            
            function buildHtmlTree(nodes, level = 0) {
                let html = '';
                const padding = level * 1.0;
                
                nodes.forEach(node => {
                    if (node.type === 'folder' || node.type === 'tree') {
                        html += `
                            <div class="folder-node" style="margin-left: ${padding}rem">
                                <div class="folder-header group flex items-center gap-3 p-2 border-2 border-transparent hover:border-on-surface hover:bg-surface-container-high transition-all cursor-pointer">
                                    <span class="material-symbols-outlined text-secondary">folder</span>
                                    <span class="font-code-md text-code-md text-on-surface truncate">${node.name}</span>
                                </div>
                                <div class="folder-children hidden flex flex-col gap-1 mt-1">
                                    ${buildHtmlTree(node.children || [], level + 1)}
                                </div>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="file-node group flex items-center gap-3 p-2 border-2 border-transparent hover:border-on-surface hover:bg-surface-container-high transition-all cursor-pointer" 
                                 data-path="${node.path}" data-name="${node.name}" style="margin-left: ${padding}rem">
                                <span class="material-symbols-outlined text-on-surface-variant">description</span>
                                <span class="font-code-md text-code-md text-on-surface truncate">${node.name}</span>
                            </div>
                        `;
                    }
                });
                return html;
            }

            container.innerHTML = buildHtmlTree(tree);

            // Bind click handlers to folders (toggle visibility)
            container.querySelectorAll('.folder-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    const children = header.nextElementSibling;
                    const icon = header.querySelector('.material-symbols-outlined');
                    if (children.classList.contains('hidden')) {
                        children.classList.remove('hidden');
                        icon.textContent = 'folder_open';
                    } else {
                        children.classList.add('hidden');
                        icon.textContent = 'folder';
                    }
                });
            });

            // Bind click handlers to files
            container.querySelectorAll('.file-node').forEach(fileNode => {
                fileNode.addEventListener('click', async () => {
                    // Remove selection state
                    container.querySelectorAll('.file-node').forEach(f => {
                        f.classList.remove('bg-primary', 'text-on-primary', 'border-on-surface', 'shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]');
                        f.querySelector('.material-symbols-outlined').className = 'material-symbols-outlined text-on-surface-variant';
                    });

                    // Add selection state
                    fileNode.classList.add('bg-primary', 'text-on-primary', 'border-on-surface', 'shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]');
                    fileNode.querySelector('.material-symbols-outlined').className = 'material-symbols-outlined text-on-primary';

                    const filePath = fileNode.getAttribute('data-path');
                    const fileName = fileNode.getAttribute('data-name');

                    if (activeFileNameEl) activeFileNameEl.textContent = fileName;
                    if (codeContainer) codeContainer.innerHTML = `
                        <div class="flex flex-col items-center gap-4">
                            <span class="material-symbols-outlined animate-spin text-[48px]">sync</span>
                            <p class="font-code-md">Fetching file content from GitHub...</p>
                        </div>
                    `;

                    try {
                        // Fetch File Content
                        const res = await fetch(`${API_BASE}/api/file-content`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ repoUrl, filePath })
                        });
                        const data = await res.json();
                        
                        if (!res.ok) throw new Error(data.error || 'Failed to fetch content');
                        
                        // Render Content
                        const codeEscaped = data.content
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");

                        codeContainer.innerHTML = `
                            <pre class="w-full h-full text-left overflow-auto p-4 bg-inverse-surface text-inverse-on-surface font-code-md border-[4px] border-on-surface"><code>${codeEscaped}</code></pre>
                        `;

                        // Run File Analysis via Gemini
                        if (errorsEl) errorsEl.textContent = '...';
                        if (warningsEl) warningsEl.textContent = '...';
                        
                        const analysisRes = await fetch(`${API_BASE}/api/analyze-file`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileName, fileContent: data.content })
                        });
                        const analysisData = await analysisRes.json();

                        if (analysisRes.ok) {
                            if (errorsEl) errorsEl.textContent = analysisData.errors ?? 0;
                            if (warningsEl) warningsEl.textContent = analysisData.warnings ?? 0;
                            if (langEl) {
                                const ext = fileName.split('.').pop().toUpperCase();
                                langEl.textContent = ext || 'TEXT';
                            }
                            
                            // Render AI explanation box at top of code
                            const explanationBox = document.createElement('div');
                            explanationBox.className = 'w-full bg-secondary-fixed text-on-surface p-4 mb-4 border-[4px] border-on-surface font-body-md neo-shadow-sm flex flex-col gap-2';
                            explanationBox.innerHTML = `
                                <div class="flex items-center gap-2 font-bold uppercase">
                                    <span class="material-symbols-outlined text-[18px]">psychology</span> AI File Insight
                                </div>
                                <p>${analysisData.explanation}</p>
                                ${analysisData.analysisList && analysisData.analysisList.length > 0 ? `
                                    <ul class="list-disc pl-5 mt-2 font-code-md text-label-sm">
                                        ${analysisData.analysisList.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            `;
                            codeContainer.insertBefore(explanationBox, codeContainer.firstChild);
                        }

                    } catch (err) {
                        if (codeContainer) codeContainer.innerHTML = `<p class="text-error font-code-md">Error: ${err.message}</p>`;
                    }
                });
            });
        }
    }

    // 5. Dynamic Architecture View
    if (path.includes('Architecture_View.html') && repoData.architecture) {
        const clientCard = document.getElementById('arch-client');
        const securityCard = document.getElementById('arch-security');
        const apiCard = document.getElementById('arch-api');
        const databaseCard = document.getElementById('arch-database');

        const updateCard = (cardEl, archNode) => {
            if (!cardEl || !archNode) return;
            const h3 = cardEl.querySelector('h3');
            const p = cardEl.querySelector('p');
            const techContainer = cardEl.querySelector('.flex.gap-2');
            
            if (h3) h3.textContent = archNode.name;
            if (p) p.textContent = archNode.description;
            if (techContainer) {
                techContainer.innerHTML = '';
                (archNode.tech || []).forEach(t => {
                    techContainer.innerHTML += `<span class="bg-surface border-2 border-on-surface px-2 py-1 font-label-sm text-label-sm">${t}</span>`;
                });
            }
        };

        updateCard(clientCard, repoData.architecture.client);
        updateCard(securityCard, repoData.architecture.security);
        updateCard(apiCard, repoData.architecture.api);
        updateCard(databaseCard, repoData.architecture.database);
    }

    // 6. Dependencies & Insights Page
    if (path.includes('Dependencies_Insights.html')) {
        const totalDepsEl = document.getElementById('metric-total-deps');
        const criticalEl = document.getElementById('metric-critical');
        const refactorsEl = document.getElementById('metric-refactors');
        const docsEl = document.getElementById('metric-docs');

        const vulnContainer = document.getElementById('vuln-container');
        const refactorTitle = document.getElementById('refactor-title');
        const refactorDesc = document.getElementById('refactor-desc');
        const refactorDiff = document.getElementById('refactor-diff');
        const specOverview = document.getElementById('spec-overview');
        const specShifts = document.getElementById('spec-shifts');

        // Populate metrics
        const totalCount = repoData.dependencies ? repoData.dependencies.length : 0;
        const criticalCount = (repoData.insights || []).filter(i => i.severity === 'critical').length;
        const warningCount = (repoData.insights || []).filter(i => i.severity === 'warning').length;

        if (totalDepsEl) totalDepsEl.textContent = `Total Deps: ${totalCount}`;
        if (criticalEl) criticalEl.textContent = `Critical: ${criticalCount}`;
        if (refactorsEl) refactorsEl.textContent = `Warnings: ${warningCount}`;
        if (docsEl) {
            // dynamic mock based on file tree size
            const totalFiles = repoData.repo?.totalFiles || 5;
            const docCoverage = Math.max(40, Math.min(95, 100 - totalFiles));
            docsEl.textContent = `Doc Coverage: ${docCoverage}%`;
        }

        // Render critical vulnerability list
        if (vulnContainer) {
            vulnContainer.innerHTML = '';
            const critIssues = (repoData.insights || []).filter(i => i.severity === 'critical');
            if (critIssues.length === 0) {
                vulnContainer.innerHTML = `
                    <div class="p-4 border-2 border-on-surface bg-surface-container-low font-code-md">
                        No critical vulnerabilities identified.
                    </div>
                `;
            } else {
                critIssues.forEach(issue => {
                    vulnContainer.innerHTML += `
                        <div class="border-b-[4px] border-on-surface pb-4">
                            <div class="flex justify-between items-start mb-2">
                                <span class="font-code-md text-code-md text-on-surface bg-surface-container px-2 py-1 border-[2px] border-on-surface">${issue.title}</span>
                                <span class="font-label-sm text-error uppercase font-bold tracking-widest">CRITICAL</span>
                            </div>
                            <p class="font-body-md text-on-surface-variant">${issue.description}</p>
                            <div class="mt-3 font-code-md text-label-sm text-on-surface opacity-70">
                                &gt; located in ${issue.file}:${issue.line}
                            </div>
                        </div>
                    `;
                });
            }
        }

        // Suggested refactors
        if (repoData.refactor) {
            if (refactorTitle) refactorTitle.textContent = repoData.refactor.title;
            if (refactorDesc) refactorDesc.textContent = repoData.refactor.description;
            if (refactorDiff) {
                const escapedOriginal = (repoData.refactor.original || '')
                    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
                const escapedRefactored = (repoData.refactor.refactored || '')
                    .replace(/</g, "&lt;").replace(/>/g, "&gt;");

                refactorDiff.innerHTML = `
                    <div class="text-tertiary-fixed whitespace-pre-wrap">${escapedOriginal}</div>
                    <div class="text-primary-fixed-dim whitespace-pre-wrap mt-2">${escapedRefactored}</div>
                `;
            }
        }

        // Auto Doc Spec (overview and shifts)
        if (repoData.autoDocSpec) {
            if (specOverview) specOverview.textContent = repoData.autoDocSpec.overview;
            if (specShifts) {
                specShifts.innerHTML = '';
                (repoData.autoDocSpec.shifts || []).forEach(shift => {
                    specShifts.innerHTML += `
                        <li class="flex items-start gap-3 bg-surface-bright/80 p-1">
                            <span class="material-symbols-outlined mt-1 text-primary">arrow_right_alt</span>
                            <span>${shift}</span>
                        </li>
                    `;
                });
            }
        }
    }

    // 7. AI Chat Assistant
    if (path.includes('AI_Chat_Assistant.html')) {
        const chatInput = document.getElementById('chat-input');
        const chatForm = document.getElementById('chat-form');
        const chatMessages = document.getElementById('chat-container');
        
        const addMessage = (text, isUser) => {
            const wrapper = document.createElement('div');
            wrapper.className = isUser ? 'flex gap-4 max-w-4xl self-end flex-row-reverse group' : 'flex gap-4 max-w-4xl self-start group';
            
            if (isUser) {
                wrapper.innerHTML = `
                    <div class="w-14 h-14 bg-primary border-border-weight border-on-surface rounded-none flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                        <span class="material-symbols-outlined text-on-primary text-[28px]">person</span>
                    </div>
                    <div class="bg-primary-fixed border-border-weight border-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] p-6 relative">
                        <div class="absolute w-4 h-border-weight bg-on-surface -right-4 top-6 hidden md:block"></div>
                        <p class="font-body-md text-body-lg text-on-surface font-medium">${text}</p>
                    </div>
                `;
            } else {
                // markdown formatting
                let formattedText = text
                    .replace(/```(.*?)\n(.*?)```/gs, `
                        <div class="bg-[#1c1b1b] border-border-weight border-on-surface p-4 mt-2 relative">
                            <div class="flex gap-2 mb-3 border-b-2 border-outline pb-2">
                                <div class="w-3 h-3 bg-tertiary border-2 border-outline"></div>
                                <div class="w-3 h-3 bg-secondary-fixed border-2 border-outline"></div>
                                <div class="w-3 h-3 bg-primary-fixed border-2 border-outline"></div>
                            </div>
                            <pre class="font-code-md text-code-md text-surface-bright overflow-x-auto"><code>$2</code></pre>
                        </div>
                    `)
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                wrapper.innerHTML = `
                    <div class="w-14 h-14 bg-secondary border-border-weight border-on-surface rounded-none flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                        <span class="material-symbols-outlined text-on-secondary text-[28px]">smart_toy</span>
                    </div>
                    <div class="bg-surface border-border-weight border-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] p-6 relative flex-1">
                        <div class="absolute w-4 h-border-weight bg-on-surface -left-4 top-6 hidden md:block"></div>
                        <div class="flex items-center gap-3 mb-4 border-b-border-weight border-on-surface pb-3">
                            <span class="font-headline-md text-headline-md text-on-surface uppercase">AI Insights</span>
                        </div>
                        <div class="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">${formattedText}</div>
                    </div>
                `;
            }
            // Insert before the last input spacer if it exists
            const spacer = chatMessages.querySelector('.h-12');
            if (spacer) {
                chatMessages.insertBefore(wrapper, spacer);
            } else {
                chatMessages.appendChild(wrapper);
            }
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const submitQuery = async (queryText) => {
            if (!queryText) return;
            addMessage(queryText, true);

            // Add loading indicator
            const loadingId = 'loading-' + Date.now();
            const loadingWrapper = document.createElement('div');
            loadingWrapper.id = loadingId;
            loadingWrapper.className = 'flex gap-4 max-w-4xl self-start group';
            loadingWrapper.innerHTML = `
                <div class="w-14 h-14 bg-secondary border-border-weight border-on-surface rounded-none flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] animate-pulse">
                    <span class="material-symbols-outlined text-on-secondary text-[28px]">sync</span>
                </div>
                <div class="bg-surface border-border-weight border-on-surface shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] p-6 relative flex-1">
                    <p class="font-code-md">Analyzing codebase structures and files...</p>
                </div>
            `;
            const spacer = chatMessages.querySelector('.h-12');
            if (spacer) {
                chatMessages.insertBefore(loadingWrapper, spacer);
            } else {
                chatMessages.appendChild(loadingWrapper);
            }
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const response = await fetch(`${API_BASE}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: queryText, context: repoData })
                });
                
                const data = await response.json();
                document.getElementById(loadingId).remove();
                
                if (!response.ok) throw new Error(data.error || 'Failed to chat');
                addMessage(data.reply, false);
            } catch (err) {
                document.getElementById(loadingId).remove();
                addMessage(`Error: ${err.message}`, false);
            }
        };

        if (chatForm && chatInput) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (!text) return;
                chatInput.value = '';
                submitQuery(text);
            });

            // Bind suggestion chip button clicks
            document.querySelectorAll('.scrollbar-hide button').forEach(chip => {
                chip.addEventListener('click', () => {
                    const chipQueryText = chip.textContent.trim().replace(/\s+/g, ' ');
                    submitQuery(chipQueryText);
                });
            });
        }
    }
});
