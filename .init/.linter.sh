#!/bin/bash
cd /home/kavia/workspace/code-generation/ai_blog_generator_web_app-184424-184463/UserManagement
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

