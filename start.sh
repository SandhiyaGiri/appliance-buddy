#!/bin/bash

echo "Installing dependencies..."
npm run install:all

echo "Building application..."
npm run build

echo "Starting application..."
npm start
