import re

# File_Explorer.html
content = open('File_Explorer.html', 'r', encoding='utf-8').read()
content = re.sub(
    r'<div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-surface">.*?</section>',
    '<div id="file-tree-container" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-surface"></div>\n</section>',
    content, flags=re.DOTALL
)
open('File_Explorer.html', 'w', encoding='utf-8').write(content)

# Dependencies_Insights.html
content = open('Dependencies_Insights.html', 'r', encoding='utf-8').read()
content = re.sub(
    r'<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">.*?</main>',
    '<div id="deps-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter"></div>\n</main>',
    content, flags=re.DOTALL
)
open('Dependencies_Insights.html', 'w', encoding='utf-8').write(content)

# Architecture_View.html
content = open('Architecture_View.html', 'r', encoding='utf-8').read()
content = re.sub(
    r'<div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-surface">.*?</section>',
    '<div id="arch-container" class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-surface"></div>\n</section>',
    content, flags=re.DOTALL
)
open('Architecture_View.html', 'w', encoding='utf-8').write(content)

print('Cleaned mock data and added IDs!')
