import re
content = open('Overview_Dashboard.html', 'r', encoding='utf-8').read()

# Remove the hardcoded language blocks
content = re.sub(
    r'<div class="flex flex-wrap gap-4">.*?</div>\s*</div>\s*</section>',
    r'<div id="dash-languages" class="flex flex-wrap gap-4"></div>\n</div>\n</section>',
    content, flags=re.DOTALL
)

# Fix the IDs for metrics
content = re.sub(r'<div class="font-display text-display text-on-surface mt-auto">14\.2k</div>', r'<div id="dash-stars" class="font-display text-display text-on-surface mt-auto">--</div>', content)
content = re.sub(r'<div class="font-display text-display text-on-surface mt-auto">2\.8k</div>', r'<div id="dash-forks" class="font-display text-display text-on-surface mt-auto">--</div>', content)
content = re.sub(r'<div class="font-display text-display text-on-surface mt-auto"><span id="dash-stars">1,204</span></div>', r'<div id="dash-files" class="font-display text-display text-on-surface mt-auto">--</div>', content)

# Clear Quick Insights
content = re.sub(
    r'<div class="col-span-1 flex flex-col gap-6">\s*<h2 class="font-headline-md text-headline-md uppercase text-on-surface border-b-border-weight border-on-surface pb-2 w-max">Quick Insights</h2>.*?</div>\s*<div class="col-span-1 lg:col-span-2 flex flex-col gap-6">',
    r'<div class="col-span-1 flex flex-col gap-6">\n<h2 class="font-headline-md text-headline-md uppercase text-on-surface border-b-border-weight border-on-surface pb-2 w-max">Quick Insights</h2>\n<div id="dash-insights" class="flex flex-col gap-4"></div>\n</div>\n<div class="col-span-1 lg:col-span-2 flex flex-col gap-6">',
    content, flags=re.DOTALL
)

# Clear Activity Log
content = re.sub(
    r'<div class="flex-1 mt-8 overflow-y-auto space-y-2 text-surface-variant pt-2">.*?</div>\s*</div>\s*</div>',
    r'<div class="flex-1 mt-8 overflow-y-auto space-y-2 text-surface-variant pt-2" id="dash-activity">\n<div class="flex items-center text-surface mt-4"><span class="text-tertiary-fixed mr-2">system@analysis:~</span> $ <span class="w-2 h-4 bg-surface ml-2 animate-pulse block"></span></div>\n</div>\n</div>\n</div>',
    content, flags=re.DOTALL
)

# Set defaults to blank to avoid flashing mock data
content = content.replace('acme-corp / quantum-core', '')
content = content.replace('The primary execution engine for distributed quantum annealing simulations. This repository contains the core Rust implementation, C++ bindings, and the experimental Python SDK.', '')
content = content.replace('<p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-8">', '<p id="dash-desc" class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-8">')

open('Overview_Dashboard.html', 'w', encoding='utf-8').write(content)
print('Dashboard Cleaned')
