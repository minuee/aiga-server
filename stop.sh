#!/bin/bash
echo "Stopping existing application..."
sudo pgrep -f "node.*dist/main" | sudo xargs kill || true