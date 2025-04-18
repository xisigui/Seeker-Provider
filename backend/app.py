from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import jwt
import bcrypt
from functools import wraps

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["*" ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'data', 'app.db')
os.makedirs(os.path.dirname(db_path), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production!
app.config['JWT_EXPIRATION_DELTA'] = 24 * 60 * 60  # 24 hours in seconds

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'seeker' or 'provider'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Additional fields based on role
    location = db.Column(db.String(100))
    industry_preference = db.Column(db.String(100))  # for seekers
    service_focus = db.Column(db.String(100))       # for providers
    
    # Relationship with Provider
    provider = db.relationship('Provider', backref='user', uselist=False)

class Provider(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    skills = db.Column(db.String(200), nullable=False)
    rating = db.Column(db.Float, default=0.0)
    location = db.Column(db.String(100))
    service_focus = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Authentication helper functions
def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(seconds=app.config['JWT_EXPIRATION_DELTA'])
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
            current_role = data['role']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user_id, current_role, *args, **kwargs)
    return decorated

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Hash password
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    # Create new user
    new_user = User(
        email=data['email'],
        password_hash=hashed_password,
        location=data['location'],
        industry_preference=data['industry_preference'],
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()
    
    # If user is a provider, create provider profile
    if data['role'] == 'provider':
        new_provider = Provider(
            user_id=new_user.id,
            name=data.get('name', ''),
            skills=','.join(data.get('skills', [])),
            location=data.get('location', ''),
            service_focus=data.get('service_focus', '')
        )
        db.session.add(new_provider)
        db.session.commit()
    
    # Generate token
    token = generate_token(new_user.id, new_user.role)
    
    return jsonify({
        'token': token,
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    token = generate_token(user.id, user.role)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role
        }
    })

@app.route('/api/auth/validate', methods=['GET'])
@token_required
def validate_token(current_user_id, current_role):
    try:
        # If we get here, the token is valid (token_required decorator passed)
        return jsonify({
            'valid': True,
            'user_id': current_user_id,
            'role': current_role
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401

# Protected routes
@app.route('/api/providers', methods=['GET'])
@token_required
def get_providers(current_user_id, current_role):
    providers = Provider.query.all()
    return jsonify([{
        'id': p.id,
        'user_id': p.user_id,
        'name': p.name,
        'skills': p.skills.split(','),
        'rating': p.rating,
        'location': p.location,
        'service_focus': p.service_focus,
        'created_at': p.created_at.isoformat()
    } for p in providers])

@app.route('/api/providers', methods=['POST'])
@token_required
def create_provider(current_user_id, current_role):
    if current_role != 'provider':
        return jsonify({'error': 'Only providers can create provider profiles'}), 403
    
    data = request.get_json()
    new_provider = Provider(
        user_id=current_user_id,
        name=data['name'],
        skills=','.join(data['skills']),
        rating=data.get('rating', 0.0),
        location=data.get('location', ''),
        service_focus=data.get('service_focus', '')
    )
    db.session.add(new_provider)
    db.session.commit()
    
    return jsonify({
        'id': new_provider.id,
        'name': new_provider.name,
        'skills': new_provider.skills.split(','),
        'rating': new_provider.rating,
        'location': new_provider.location,
        'service_focus': new_provider.service_focus,
        'created_at': new_provider.created_at.isoformat()
    }), 201

@app.route('/api/providers/<int:provider_id>', methods=['PUT'])
@token_required
def update_provider(current_user_id, current_role, provider_id):
    if current_role != 'provider':
        return jsonify({'error': 'Only providers can update their profile'}), 403

    provider = Provider.query.get_or_404(provider_id)
    if provider.user_id != current_user_id:
        return jsonify({'error': 'You can only update your own profile'}), 403

    data = request.get_json()
    
    # Update provider fields
    provider.name = data.get('name', provider.name)
    provider.skills = ','.join(data.get('skills', []))
    provider.location = data.get('location', provider.location)
    provider.service_focus = data.get('service_focus', provider.service_focus)
    
    try:
        db.session.commit()
        return jsonify({
            'id': provider.id,
            'name': provider.name,
            'skills': provider.skills.split(','),
            'rating': provider.rating,
            'location': provider.location,
            'service_focus': provider.service_focus,
            'created_at': provider.created_at.isoformat()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def calculate_match_score(provider, seeker):
    score = 0
    
    # Exact match for industry/service focus (50 points)
    if provider.service_focus == seeker.industry_preference:
        score += 50
    
    # Partial match for industry/service focus
    elif provider.service_focus and seeker.industry_preference:
        provider_categories = set(provider.service_focus.lower().split(' & '))
        seeker_categories = set(seeker.industry_preference.lower().split(' & '))
        if provider_categories.intersection(seeker_categories):
            score += 25
    
    # Rating factor (30 points max)
    score += min(provider.rating * 6, 30)  # 6 points per rating star, max 30
    
    # Location match (20 points)
    if provider.location and seeker.location and provider.location.lower() == seeker.location.lower():
        score += 20
    
    return score

@app.route('/api/match/providers', methods=['GET'])
@token_required
def get_matched_providers(current_user_id, current_role):
    if current_role != 'seeker':
        return jsonify({'message': 'Only seekers can use the matching service'}), 403
    
    # Get the current seeker
    seeker = User.query.get(current_user_id)
    if not seeker:
        return jsonify({'message': 'Seeker not found'}), 404
    
    # Get all providers
    providers = Provider.query.join(User).filter(User.role == 'provider').all()
    
    # Calculate match scores for all providers
    matches = []
    for provider in providers:
        score = calculate_match_score(provider, seeker)
        matches.append({
            'id': provider.id,
            'user_id': provider.user_id,
            'name': provider.name,
            'skills': provider.skills.split(','),
            'rating': provider.rating,
            'location': provider.location,
            'service_focus': provider.service_focus,
            'match_score': score,
            'created_at': provider.created_at.isoformat()
        })
    
    # Sort by match score (highest first)
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify(matches)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    with app.app_context():
        # db.drop_all()  # Drop all tables
        db.create_all()  # Create all tables with new schema
    app.run(debug=True) 