#!/bin/bash

# Ensure the script exits on any error
set -e

echo "BUILD START"



# Install requirements
pip install -r requirements.txt

# Collect static files
python3.9 manage.py collectstatic --noinput

echo "BUILD END"
