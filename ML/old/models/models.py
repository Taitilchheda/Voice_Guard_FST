from pymongo import MongoClient
from bson import ObjectId
import datetime

class AudioFile:
    def __init__(self, filename, file_id, user_id, original_format):
        self.filename = filename
        self.file_id = file_id
        self.user_id = user_id
        self.original_format = original_format
        self.created_at = datetime.datetime.utcnow().isoformat()
        self.is_deepfake = False
        self.confidence = 0.0

    def save(self):
        # Assuming you're using the same MongoDB connection from app.py
        from flask import app
        
        audio_file_data = {
            "filename": self.filename,
            "file_id": self.file_id,
            "user_id": self.user_id,
            "original_format": self.original_format,
            "created_at": self.created_at,
            "is_deepfake": self.is_deepfake,
            "confidence": self.confidence
        }
        
        result = db.Audio_File_Uploads.insert_one(audio_file_data)
        return result