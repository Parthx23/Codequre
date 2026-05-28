import re
content = open('File_Explorer.html', 'r', encoding='utf-8').read()
content = re.sub(
    r'<!-- Code Content Area -->.*?</div>\s*<!-- Bottom Status Bar for Editor -->',
    '<!-- Code Content Area -->\n<div id="code-content-container" class="flex-1 overflow-y-auto bg-surface p-6 font-code-md text-code-md leading-relaxed relative flex items-center justify-center text-on-surface-variant">\nSelect a file from the explorer to view its contents.\n</div>\n<!-- Bottom Status Bar for Editor -->',
    content, flags=re.DOTALL
)
content = re.sub(
    r'<span class="px-3 py-1 border-border-weight border-on-surface bg-primary-container text-on-primary-container font-code-md text-label-sm uppercase font-bold shadow-\[2px_2px_0px_0px_rgba\(28,27,27,1\)\]">NeoBrutalistCard\.tsx</span>',
    '<span id="active-file-name" class="px-3 py-1 border-border-weight border-on-surface bg-primary-container text-on-primary-container font-code-md text-label-sm uppercase font-bold shadow-[2px_2px_0px_0px_rgba(28,27,27,1)]">Select a File</span>',
    content
)
open('File_Explorer.html', 'w', encoding='utf-8').write(content)
print('Done File_Explorer')
