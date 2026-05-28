document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Analyzer Flow
    if (path.includes('Codebase_Analyzer_Flow.html') || path.includes('Hero_Landing.html') || path === '/' || path.endsWith('/')) {
        const analyzeBtn = document.getElementById('analyze-btn');
        const repoInput = document.getElementById('repo-input');
        
        if (analyzeBtn && repoInput) {
            analyzeBtn.addEventListener('click', async () => {
                const url = repoInput.value.trim();
                if (!url) {
                    alert('Please enter a GitHub repository URL.');
                    return;
                }
                
                analyzeBtn.innerHTML = 'Analyzing... <span class="material-symbols-outlined animate-spin">sync</span>';
                analyzeBtn.disabled = true;
                
                try {
                    const response = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ repoUrl: url })
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to analyze repository');
                    }
                    
                    sessionStorage.setItem('repoData', JSON.stringify(data));
                    window.location.href = 'Loading_Analysis_State.html';
                } catch (err) {
                    alert(err.message);
                    analyzeBtn.innerHTML = 'Analyze Now <span class="material-symbols-outlined">arrow_forward</span>';
                    analyzeBtn.disabled = false;
                }
            });
        }
    }
    
    // Overview Dashboard
    if (path.includes('Overview_Dashboard.html')) {
        const repoDataStr = sessionStorage.getItem('repoData');
        if (repoDataStr) {
            try {
                const data = JSON.parse(repoDataStr);
                const repo = data.repo || data;
                
                const nameEl = document.getElementById('dash-repo-name');
                const descEl = document.getElementById('dash-desc');
                const starsEl = document.getElementById('dash-stars');
                const forksEl = document.getElementById('dash-forks');
                const filesEl = document.getElementById('dash-files');
                
                if (nameEl) nameEl.textContent = repo.fullName || repo.name;
                if (descEl) descEl.textContent = repo.description || 'No description available.';
                if (starsEl) starsEl.textContent = repo.stars;
                if (forksEl) forksEl.textContent = repo.forks || 0;
                if (filesEl) filesEl.textContent = repo.totalFiles || repo.totalLines || 0;

                // Render Languages
                const langContainer = document.getElementById('dash-languages');
                if (langContainer && data.languages) {
                    langContainer.innerHTML = '';
                    const totalBytes = Object.values(data.languages).reduce((a, b) => a + b, 0);
                    const colors = ['#dea584', '#f34b7d', '#3572A5', '#f1e05a'];
                    let i = 0;
                    for (const [lang, bytes] of Object.entries(data.languages)) {
                        const pct = ((bytes / totalBytes) * 100).toFixed(1);
                        const color = colors[i % colors.length];
                        langContainer.innerHTML += `
                            <div class="flex items-center gap-2 px-4 py-2 bg-surface-container border-border-weight border-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                                <span class="w-3 h-3 rounded-full border-2 border-on-surface" style="background-color: ${color}"></span>
                                <span class="font-code-md text-code-md font-bold uppercase">${lang} ${pct}%</span>
                            </div>
                        `;
                        i++;
                        if (i > 3) break; // limit to top 4
                    }
                }

                // Render Insights
                const insightsContainer = document.getElementById('dash-insights');
                if (insightsContainer && data.dependencies) {
                    const outdatedCount = data.dependencies.filter(d => d.status === 'outdated').length;
                    insightsContainer.innerHTML = `
                        <div class="bg-error-container border-border-weight border-on-surface p-4 flex gap-4 items-start shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                            <span class="material-symbols-outlined filled text-error text-[32px]">warning</span>
                            <div>
                                <h3 class="font-code-md text-code-md font-bold text-on-error-container mb-1">${outdatedCount} Outdated Packages</h3>
                                <p class="font-body-md text-body-md text-on-surface">Found in outdated npm dependencies. Action required. <br><a href="Dependencies_Insights.html" style="color: blue; text-decoration: underline;">View Dependencies Insights</a></p>
                            </div>
                        </div>
                    `;
                }
                
            } catch (e) {
                console.error('Error parsing repo data', e);
            }
        }
    }

    // File Explorer
    if (path.includes('File_Explorer.html')) {
        const repoDataStr = sessionStorage.getItem('repoData');
        const container = document.getElementById('file-tree-container');
        if (repoDataStr && container) {
            try {
                const data = JSON.parse(repoDataStr);
                const tree = data.fileTree || data.tree; // support new and old formats
                
                function renderFileTree(nodes, parentEl, level = 0) {
                    if (!nodes) return;
                    nodes.forEach(node => {
                        const div = document.createElement('div');
                        const padding = level * 1.5;
                        
                        if (node.type === 'folder' || node.type === 'tree') {
                            div.innerHTML = `
                                <div class="group flex items-center gap-3 p-3 border-border-weight border-on-surface bg-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer" style="margin-left: ${padding}rem">
                                    <span class="material-symbols-outlined text-secondary" data-weight="fill">folder</span>
                                    <span class="font-code-md text-code-md text-on-surface truncate">${node.name || node.path}</span>
                                </div>
                            `;
                            parentEl.appendChild(div);
                            if (node.children && node.children.length > 0) {
                                const childContainer = document.createElement('div');
                                childContainer.className = "flex flex-col gap-2";
                                parentEl.appendChild(childContainer);
                                renderFileTree(node.children, childContainer, level + 1);
                            }
                        } else {
                            div.innerHTML = `
                                <div class="group flex items-center gap-3 p-2 border-2 border-transparent hover:border-on-surface hover:bg-surface-container-high transition-all cursor-pointer" style="margin-left: ${padding}rem">
                                    <span class="material-symbols-outlined text-on-surface-variant">description</span>
                                    <span class="font-code-md text-code-md text-on-surface truncate">${node.name || node.path}</span>
                                </div>
                            `;
                            parentEl.appendChild(div);
                        }
                    });
                }
                renderFileTree(tree, container);
            } catch (e) {
                console.error(e);
            }
        }
    }

    // Dependencies
    if (path.includes('Dependencies_Insights.html')) {
        const repoDataStr = sessionStorage.getItem('repoData');
        const container = document.getElementById('deps-container');
        if (repoDataStr && container) {
            try {
                const data = JSON.parse(repoDataStr);
                const deps = data.dependencies || [];
                
                if (deps.length === 0) {
                    container.innerHTML = '<p class="font-code-md col-span-3">No package.json found or no dependencies listed.</p>';
                } else {
                    deps.forEach(dep => {
                        const div = document.createElement('div');
                        div.className = "bg-surface border-border-weight border-on-surface p-6 shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] transition-all flex flex-col gap-4";
                        div.innerHTML = `
                            <div class="flex justify-between items-start">
                                <h3 class="font-display text-headline-md uppercase text-on-surface">${dep.name}</h3>
                                <span class="px-2 py-1 bg-${dep.status === 'outdated' ? 'error-container' : 'surface-container-high'} border-2 border-on-surface font-code-md text-label-sm uppercase">${dep.version}</span>
                            </div>
                            <p class="font-code-md text-code-md text-on-surface-variant">Type: ${dep.type}</p>
                        `;
                        container.appendChild(div);
                    });
                }
            } catch(e) {}
        }
    }

    // AI Chat Assistant
    if (path.includes('AI_Chat_Assistant.html')) {
        const chatInput = document.getElementById('chat-input');
        const chatSubmit = document.getElementById('chat-submit');
        const chatMessages = document.getElementById('chat-messages');
        
        const addMessage = (text, isUser) => {
            const wrapper = document.createElement('div');
            wrapper.className = isUser ? 'flex justify-end' : 'flex gap-4 max-w-4xl';
            
            if (isUser) {
                wrapper.innerHTML = `
                    <div class="bg-primary text-on-primary p-4 border-border-weight border-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] max-w-2xl">
                        <p class="font-code-md text-code-md">${text}</p>
                    </div>
                `;
            } else {
                // simple markdown processing for code blocks
                let formattedText = text.replace(/```(.*?)```/gs, '<pre class="bg-inverse-surface text-inverse-on-surface p-4 mt-2 overflow-x-auto"><code>$1</code></pre>');
                formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                wrapper.innerHTML = `
                    <div class="w-12 h-12 bg-primary flex items-center justify-center border-border-weight border-on-surface shrink-0 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] mt-1">
                        <span class="material-symbols-outlined text-on-primary filled">memory</span>
                    </div>
                    <div class="bg-surface-bright border-border-weight border-on-surface p-6 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] w-full">
                        <div class="flex items-center gap-2 mb-4">
                            <span class="font-code-md text-code-md uppercase font-bold text-on-surface">Analysis_Bot</span>
                            <span class="font-code-md text-label-sm text-on-surface-variant">just now</span>
                        </div>
                        <div class="font-body-lg text-body-lg text-on-surface space-y-4">
                            ${formattedText}
                        </div>
                    </div>
                `;
            }
            chatMessages.appendChild(wrapper);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        if (chatSubmit && chatInput) {
            chatSubmit.addEventListener('click', async () => {
                const message = chatInput.value.trim();
                if (!message) return;
                
                addMessage(message, true);
                chatInput.value = '';
                
                // Add loading indicator
                const loadingId = 'loading-' + Date.now();
                const loadingWrapper = document.createElement('div');
                loadingWrapper.id = loadingId;
                loadingWrapper.className = 'flex gap-4 max-w-4xl';
                loadingWrapper.innerHTML = `
                    <div class="w-12 h-12 bg-primary flex items-center justify-center border-border-weight border-on-surface shrink-0 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] mt-1">
                        <span class="material-symbols-outlined text-on-primary filled animate-spin">sync</span>
                    </div>
                    <div class="bg-surface-bright border-border-weight border-on-surface p-6 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] w-full flex items-center">
                        <p class="font-code-md">Analyzing...</p>
                    </div>
                `;
                chatMessages.appendChild(loadingWrapper);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                let context = {};
                try {
                    context = JSON.parse(sessionStorage.getItem('repoData')) || {};
                } catch(e) {}
                
                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, context })
                    });
                    
                    const data = await response.json();
                    document.getElementById(loadingId).remove();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to chat');
                    }
                    
                    addMessage(data.reply, false);
                } catch (err) {
                    document.getElementById(loadingId).remove();
                    addMessage('Error: ' + err.message, false);
                }
            });
            
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    chatSubmit.click();
                }
            });
        }
    }
});
