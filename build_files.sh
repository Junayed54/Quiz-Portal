#!/bin/bash

# Ensure the script exits on any error
set -e

echo "BUILD START"

# Activate your virtual environment if it's not already activated
source ../venv/Scripts/activate # Replace with the actual path to your virtual environment

# Install requirements
pip install -r requirements.txt

# Collect static files
python3.9 manage.py collectstatic --noinput

echo "BUILD END"
