#!/bin/bash

# Ensure the script exits on any error
set -e

echo "BUILD START"

# Install requirements
python3.9 -m pip install -r requirements.txt

# Create the staticfiles_build directory if it doesn't exist
mkdir -p staticfiles_build

# Collect static files to the staticfiles_build directory
python3.9 manage.py collectstatic --noinput --clear --directory staticfiles_build

echo "BUILD END"
