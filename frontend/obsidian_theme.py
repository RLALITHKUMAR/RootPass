import os

def replace_theme(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace old dark blues with Obsidian
                new_content = content.replace('#0a0f1c', '#050505')
                new_content = new_content.replace('#020617', '#050505')
                
                # Replace any remaining #10b981 with Electric Indigo just in case
                new_content = new_content.replace('#10b981', '#6366f1')
                
                # Make the animations use Indigo instead of Emerald
                # rgba(16, 185, 129 -> rgba(99, 102, 241
                new_content = new_content.replace('16, 185, 129', '99, 102, 241')
                new_content = new_content.replace('16,185,129', '99,102,241')

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")

replace_theme('src')
