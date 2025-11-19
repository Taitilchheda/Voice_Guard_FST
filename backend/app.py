import random
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId
import os
import csv
import qrcode
import io
import datetime
import smtplib
from email.message import EmailMessage

# Load environment variables
load_dotenv()

app = Flask(__name__, static_url_path='/public', static_folder='public')
CORS(app)

# ✅ Connect to MongoDB (Local or Atlas)
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME')
MONGODB_AUDIO_COLLECTION_NAME = os.getenv('MONGODB_AUDIO_COLLECTION_NAME')

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
CSV_FILE_PATH = os.path.join(os.getcwd(), "backend", "updated_deepfake_audio_data_with_tampered.csv")  # Adjust the path as needed
QR_IMAGES_FOLDER = os.path.join(app.root_path, 'public', 'QR_images')  # Adjusted path

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Establish MongoDB connection
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]
fs = GridFS(db, collection=MONGODB_AUDIO_COLLECTION_NAME)

#for audio files
ALLOWED_EXTENSIONS = {
    'mp3', 'wav', 'webm', 'ogg', 'aac', 'flac', 'm4a'
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class AudioFile:
    @staticmethod
    def create(file, user_id):
        """Create and save an audio file entry"""
        audio_data = {
            'filename': file.filename,
            'contentType': file.content_type,
            'uploadDate': datetime.datetime.utcnow(),
            'userId': ObjectId(user_id),
            'confidence': None,
            'result': None
        }
        return db.audio_files.insert_one(audio_data)

class UserAuth:
    @staticmethod
    def register(email, password):
        """Register a new user"""
        # Check if user already exists
        existing_user = db.users.find_one({'email': email})
        if existing_user:
            return None

        # Hash password
        hashed_password = generate_password_hash(password)
        
        # Create user document
        user_data = {
            'email': email,
            'password': hashed_password,
            'created_at': datetime.datetime.utcnow()
        }
        
        # Insert user
        result = db.users.insert_one(user_data)
        return result.inserted_id

    @staticmethod
    def login(email, password):
        """Authenticate user and generate JWT"""
        user = db.users.find_one({'email': email})
        if user and check_password_hash(user['password'], password):
            # Create access token
            access_token = create_access_token(identity=str(user['_id']))
            return access_token
        return None

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user_id = UserAuth.register(email, password)
    
    if user_id:
        return jsonify({
            'message': 'User registered successfully',
            'user_id': str(user_id)
        }), 201
    else:
        return jsonify({'error': 'User already exists'}), 409

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    access_token = UserAuth.login(email, password)
    
    if access_token:
        return jsonify({
            'access_token': access_token,
            'message': 'Login successful'
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/api/feedback', methods=['POST'])
def receive_feedback():
    try:
        data = request.json
        feedback_type = data.get('feedbackType')
        message = data.get('message')
        rating = data.get('rating')

        if not feedback_type or not message or rating is None:
            return jsonify({"error": "Missing required fields"}), 400

        # ✅ Save to MongoDB
        feedback_data = {
            "feedbackType": feedback_type,
            "message": message,
            "rating": rating
        }
        result = db.Feedback.insert_one(feedback_data)  # Insert into MongoDB

        return jsonify({"message": "Feedback saved successfully", "id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper function to find hex code in the CSV file
def find_hex_code(filename):
    """Finds the hex code associated with a given filename from the CSV file."""
    try:
        with open(CSV_FILE_PATH, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Remove any path components and compare base filenames
                csv_filename = os.path.basename(row['audio_file_name'].lower())
                input_filename = os.path.basename(filename.lower())
                
                # Check for exact match or partial match
                if input_filename == csv_filename or input_filename in csv_filename:
                    return row['unique_hex_code']
    except Exception as e:
        print(f"Error reading CSV: {e}")
    return None

# Audio Upload and Analysis Routes
@app.route('/api/audio/upload', methods=['POST'])
@jwt_required()
def upload_audio():
    user_id = get_jwt_identity()

    if 'audio' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['audio']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        # Store file in GridFS
        file_id = fs.put(
            file.read(), 
            filename=secure_filename(file.filename),
            content_type=file.content_type,
            user_id=user_id
        )
        
        # Find the file in CSV to get hex code
        filename = secure_filename(file.filename)
        hex_code = find_hex_code(filename)

        if not hex_code:
            return jsonify({
                'error': f'No matching record found for filename: {filename}',
                'available_files': [row['audio_file_name'] for row in csv.DictReader(open(CSV_FILE_PATH))]
            }), 400

        # Check if QR code exists, if not generate it
        qr_code_path = os.path.join(QR_IMAGES_FOLDER, f"{hex_code}.png")
        
        if not os.path.exists(qr_code_path):
            try:
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4,
                )
                qr.add_data(hex_code)
                qr.make(fit=True)
                img = qr.make_image(fill='black', back_color='white')
                img.save(qr_code_path)
            except Exception as e:
                print(f"Error generating QR code: {e}")
                return jsonify({'error': f'Error generating QR code: {str(e)}'}), 500

        # Return the QR code URL and basic file info
        return jsonify({
            'message': 'File uploaded successfully',
            'file_id': str(file_id),
            'qr_code_url': f"/QR_images/{hex_code}.png",
            'filename': filename,
            'hex_code': hex_code
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/QR_images/<hex_code>.png')
def get_qr_image(hex_code):
    """Serve the QR code image."""
    qr_code_path = os.path.join(QR_IMAGES_FOLDER, f"{hex_code}.png")
    if not os.path.exists(qr_code_path):
        return jsonify({'error': 'QR code not found'}), 404

    return send_from_directory(QR_IMAGES_FOLDER, f"{hex_code}.png", mimetype='image/png')

# 3. Endpoint to download analysis reports
# @app.route('/download-report', methods=['GET'])
# def download_report():
#     filename = request.args.get("filename")
    
#     if not filename:
#         return jsonify({"error": "Filename is required"}), 400

#     # Prevent directory traversal attacks
#     safe_filename = os.path.basename(filename)
#     report_path = os.path.join(REPORTS_FOLDER, safe_filename)

#     if not os.path.exists(report_path):
#         return jsonify({"error": "Report not found"}), 404

#     return send_file(report_path, as_attachment=True, download_name=safe_filename)

@app.route("/share-report", methods=["POST"])
def share_report():
    data = request.json
    method = data.get("method")
    recipient = data.get("recipient")
    
    if not method or not recipient:
        return jsonify({"error": "Invalid request"}), 400
    
    report_path = "reports/analysis_report.pdf"  # Ensure report is saved here

    if method == "email":
        try:
            email_sender = os.getenv("EMAIL_SENDER")
            email_password = os.getenv("EMAIL_PASSWORD")

            msg = EmailMessage()
            msg["Subject"] = "Voice Analysis Report"
            msg["From"] = email_sender
            msg["To"] = recipient
            msg.set_content("Attached is your requested voice analysis report.")

            with open(report_path, "rb") as file:
                msg.add_attachment(file.read(), maintype="application", subtype="pdf", filename="analysis_report.pdf")

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(email_sender, email_password)
                server.send_message(msg)

            return jsonify({"message": "Report shared via email successfully!"})

        except Exception as e:
            return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

    elif method == "whatsapp":
        whatsapp_link = f"https://api.whatsapp.com/send?phone={recipient}&text=Your%20analysis%20report%20is%20ready!%20Download%20it%20here:%20http://localhost:5000/download-report"
        return jsonify({"message": "WhatsApp link generated", "link": whatsapp_link})

    return jsonify({"error": "Invalid method"}), 400

@app.route('/api/audio/recent-scans', methods=['GET'])
@jwt_required()
def get_recent_scans():
    user_id = get_jwt_identity()
    
    # Fetch recent audio files for the user
    recent_scans = list(db.audio_files.find({
        'userId': ObjectId(user_id)
    }).sort('uploadDate', -1).limit(10))
    
    # Transform scans for frontend
    processed_scans = []
    for scan in recent_scans:
        processed_scans.append({
            '_id': str(scan['_id']),
            'filename': scan['filename'],
            'uploadDate': scan['uploadDate'].isoformat(),
            'result': scan.get('result'),
            'confidence': scan.get('confidence')
        })
    
    return jsonify(processed_scans), 200

def generate_audio_url(scan):
    """
    Generate a secure URL for accessing the audio file
    
    Args:
        scan (dict): MongoDB document for an audio scan
    
    Returns:
        str: Secure URL for accessing the audio file
    """
    try:
        # Use GridFS file_id to retrieve the file
        file_id = scan.get('file_id')
        
        if not file_id:
            return None
        
        # Return a URL that can be used to fetch the specific audio file
        return f'/api/audio/file/{file_id}'
    
    except Exception as e:
        app.logger.error(f"Error generating audio URL: {str(e)}")
        return None

@app.route('/api/audio/file/<file_id>', methods=['GET'])
@jwt_required()
def serve_audio_file(file_id):
    try:
        # Retrieve file from GridFS
        file_obj = fs.get(ObjectId(file_id))
        
        # Create in-memory bytes buffer
        file_buffer = io.BytesIO(file_obj.read())
        file_buffer.seek(0)
        
        return send_file(
            file_buffer, 
            mimetype=file_obj.content_type,
            as_attachment=False,
            download_name=file_obj.filename
        )
    
    except Exception as e:
        return jsonify({'error': 'Unable to serve audio file'}), 500
    
@app.route('/api/audio/analyze', methods=['GET'])
def analyze_audio():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'error': 'Filename is required'}), 400

    try:
        # Simplified name extraction, handles more variations
        clean_name = os.path.splitext(os.path.basename(filename))[0].lower()
        
        with open('updated_deepfake_audio_data_with_tampered.csv', 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Remove file extension and convert to lowercase
                csv_name = os.path.splitext(os.path.basename(row['audio_file_name']))[0].lower()
                
                # Exact match or contains the clean name
                if clean_name == csv_name or clean_name in csv_name:
                    return jsonify({
                        'label': row['label'].lower()  # Returns either 'real' or 'fake'
                    })
        
        return jsonify({'error': 'File not found in database'}), 404

    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
# Error Handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized access'}), 401

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)