import os
import re

def replace_theme(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace emerald with indigo
                new_content = content.replace('emerald', 'indigo')
                # Replace #10b981 (emerald-500) with #6366f1 (indigo-500)
                new_content = new_content.replace('#10b981', '#6366f1')
                # Replace #059669 (emerald-600) with #4f46e5 (indigo-600)
                new_content = new_content.replace('#059669', '#4f46e5')
                # Replace #34d399 (emerald-400) with #818cf8 (indigo-400)
                new_content = new_content.replace('#34d399', '#818cf8')

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")

replace_theme('src')
