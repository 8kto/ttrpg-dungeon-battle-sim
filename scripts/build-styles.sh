#!/bin/bash

declare -A styles=(
  ["src/styles/styles.scss"]="src/styles/styles.processed.css"
  ["src/styles/character-sheet.scss"]="src/styles/character-sheet.processed.css"
)

for input in "${!styles[@]}"; do
  output="${styles[$input]}"

  if [[ ! -f "$output" || "$input" -nt "$output" ]]; then
    echo "Building $input -> $output"
    npx tailwindcss -i "$input" -o "$output"
  else
    echo "Skipping $input (no changes)"
  fi
done
