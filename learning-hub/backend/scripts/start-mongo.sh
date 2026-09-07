#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$DIR/.data/db"
LOG_FILE="$DIR/.data/mongod.log"

mkdir -p "$DATA_DIR"

if nc -z 127.0.0.1 27017 2>/dev/null; then
  echo "MongoDB is already running on port 27017."
  exit 0
fi

echo "Starting local MongoDB on 127.0.0.1:27017..."
mongod --bind_ip 127.0.0.1 --port 27017 --nounixsocket --dbpath "$DATA_DIR" --logpath "$LOG_FILE" --fork

echo "MongoDB started successfully. Logs at: $LOG_FILE"
