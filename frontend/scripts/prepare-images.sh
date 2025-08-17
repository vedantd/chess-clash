#!/bin/bash

# Script to help prepare player images for Chess Clash
# This script will create the necessary files and provide instructions

echo "🎯 Chess Clash - Player Images Setup"
echo "====================================="
echo ""

# Create the images directory if it doesn't exist
mkdir -p public/images/players

echo "📁 Created directory: public/images/players/"
echo ""

echo "📋 Image Requirements:"
echo "- Format: JPG"
echo "- Size: 256x256 pixels (square)"
echo "- File size: Under 100KB"
echo ""

echo "📝 Naming Convention:"
echo "1.jpg - Magnus Carlsen"
echo "2.jpg - Gukesh D"
echo "3.jpg - Hikaru Nakamura"
echo "4.jpg - Ding Liren"
echo "5.jpg - Fabiano Caruana"
echo "6.jpg - R Praggnanandhaa"
echo "7.jpg - Alireza Firouzja"
echo "8.jpg - Ian Nepomniachtchi"
echo "placeholder.jpg - Fallback image"
echo ""

echo "🔧 Steps to add images:"
echo "1. Download player photos from official sources"
echo "2. Resize them to 256x256 pixels using any image editor"
echo "3. Save as JPG format"
echo "4. Name them 1.jpg, 2.jpg, etc. according to the list above"
echo "5. Place them in the public/images/players/ folder"
echo ""

echo "✅ Setup complete! Add your images and restart the development server."
echo "🌐 Images will be available at: http://localhost:3000/images/players/[filename]"
