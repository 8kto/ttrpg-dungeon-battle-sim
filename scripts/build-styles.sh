#!/bin/bash

# === CONFIG ===
declare -A styles=(
  ["src/styles/styles.scss"]="src/styles/styles.processed.css"
  ["src/styles/character-sheet.scss"]="src/styles/character-sheet.processed.css"
)

declare -a pids=()

# === LOGGING ===
log_info()  { echo "[INFO] $1"; }
log_error() { echo "[ERROR] $1" >&2; }

# === AUTODETECT TAILWIND CONFIG ===
resolve_tailwind_config() {
  if [[ -n "$TAILWIND_CONFIG" && -f "$TAILWIND_CONFIG" ]]; then
    echo "$TAILWIND_CONFIG"
  elif [[ -f "tailwind.config.js" ]]; then
    echo "tailwind.config.js"
  elif [[ -f "tailwind.config.cjs" ]]; then
    echo "tailwind.config.cjs"
  else
    log_error "No Tailwind config file found!"
    exit 1
  fi
}

# === PROCESS MANAGEMENT ===
start_watcher() {
  local input="$1"
  local output="$2"
  local config_file="$3"

  log_info "Watching: $input -> $output (config: $config_file)"
  npx tailwindcss -i "$input" -o "$output" -c "$config_file" --watch &
  local pid=$!
  pids+=("$pid")
  log_info "Started PID $pid"
}

cleanup() {
  log_info "Stopping ${#pids[@]} Tailwind processes..."
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      log_info "Killed PID $pid"
    fi
  done
  exit 0
}

# === MAIN ===
trap 'cleanup; trap - SIGINT SIGTERM EXIT' SIGINT SIGTERM EXIT

launch_all_watchers() {
  local config
  config=$(resolve_tailwind_config)

  for input in "${!styles[@]}"; do
    start_watcher "$input" "${styles[$input]}" "$config"
  done
}

main() {
  launch_all_watchers

  while true; do
    wait -n
  done
}

main
