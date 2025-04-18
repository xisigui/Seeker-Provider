#!/bin/bash

# Initialize the database before accepting requests
python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Start the Flask application
flask run --host=0.0.0.0 