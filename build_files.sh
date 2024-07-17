#!/bin/bash

# Ensure the script exits on any error
set -e

echo "BUILD START"

# Use the default python command within the virtual environment
pip3 install -r requirements.txt
python3 manage.py collectstatic --noinput

echo "BUILD END"
