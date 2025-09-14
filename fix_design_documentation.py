#!/usr/bin/env python3
"""
Script to fix documentation options in Design.tsx
"""

import re

# Read the file
with open('src/pages/Design.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of formData.documentationOptions with documentationOptions
content = re.sub(
    r'formData\.documentationOptions\.(\w+)',
    r'documentationOptions?.\\1 || false',
    content
)

# Replace all setFormData calls for documentationOptions
content = re.sub(
    r'onCheckedChange=\{\(checked\) => setFormData\(prev => \(\{ \s*\.\.\.prev, \s*documentationOptions: \{ \s*\.\.\.prev\.documentationOptions, \s*(\w+): checked as boolean \s*\} \s*\}\)\)\}',
    r'onCheckedChange={(checked) => setDocumentationOptions(prev => ({ \n                      ...prev, \n                      \\1: checked as boolean \n                    }))}',
    content,
    flags=re.MULTILINE | re.DOTALL
)

# Write the file back
with open('src/pages/Design.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed documentation options in Design.tsx")
