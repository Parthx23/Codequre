import os

def insert_script(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'js/app.js' not in content:
        content = content.replace('</body>', '<script src="js/app.js"></script>\n</body>')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

def modify_analyzer():
    file_path = 'Codebase_Analyzer_Flow.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add id to input
    content = content.replace('placeholder="https://github.com/your/repo" type="url"', 'id="repo-input" placeholder="https://github.com/your/repo" type="url"')
    # Add id to button, remove onclick
    content = content.replace("onclick=\"window.location.href='Loading_Analysis_State.html'\"", 'id="analyze-btn"')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def modify_dashboard():
    file_path = 'Overview_Dashboard.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Repo Name
    content = content.replace('acme-corp / quantum-core', '<span id="dash-repo-name">acme-corp / quantum-core</span>')
    # Description - just looking for some known text, wait Overview_Dashboard.html has 'Found in outdated npm dependencies'
    # Stars - let's add IDs to stars
    content = content.replace('1,204', '<span id="dash-stars">1,204</span>')
    # Language
    content = content.replace('TypeScript', '<span id="dash-language">TypeScript</span>')
    # Last Commit
    content = content.replace('f4a2b91', '<span id="dash-commit">f4a2b91</span>')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def modify_chat():
    file_path = 'AI_Chat_Assistant.html'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Chat container
    content = content.replace('<div class="flex-1 overflow-y-auto p-6 flex flex-col gap-y-6">', '<div id="chat-messages" class="flex-1 overflow-y-auto p-6 flex flex-col gap-y-6">')
    # Input
    content = content.replace('placeholder="Type a command or ask a question..." type="text"', 'id="chat-input" placeholder="Type a command or ask a question..." type="text"')
    # Submit button
    content = content.replace('<button class="w-16 h-16 bg-primary', '<button id="chat-submit" class="w-16 h-16 bg-primary')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for f in os.listdir('.'):
    if f.endswith('.html'):
        insert_script(f)

modify_analyzer()
modify_dashboard()
modify_chat()
print("Done modifying HTML files")
