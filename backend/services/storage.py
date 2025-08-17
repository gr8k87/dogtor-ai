import os
import logging
from typing import Optional
from PIL import Image
import uuid
from io import BytesIO
from config import settings

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.storage_backend = settings.storage_backend
        self.max_image_mb = settings.max_image_mb
        
        if self.storage_backend == "supabase":
            try:
                from supabase import create_client
                self.supabase = create_client(
                    settings.supabase_url,
                    settings.supabase_service_role_key
                )
                self.bucket_name = "dogtor-images"
            except ImportError:
                logger.error("Supabase client not available")
                self.supabase = None

    async def upload_image(self, image_data: bytes, filename: str) -> str:
        """
        Upload image and return URL
        Handles resizing if image is too large
        """
        try:
            # Resize image if too large
            processed_data = self._resize_image_if_needed(image_data)
            
            if self.storage_backend == "local":
                return await self._upload_local(processed_data, filename)
            elif self.storage_backend == "supabase":
                return await self._upload_supabase(processed_data, filename)
            else:
                raise ValueError(f"Unknown storage backend: {self.storage_backend}")
                
        except Exception as e:
            logger.error(f"Image upload failed: {e}")
            raise

    def _resize_image_if_needed(self, image_data: bytes) -> bytes:
        """Resize image if larger than max_image_mb"""
        try:
            # Check file size
            size_mb = len(image_data) / (1024 * 1024)
            
            if size_mb <= self.max_image_mb:
                return image_data
            
            # Open and resize image
            image = Image.open(BytesIO(image_data))
            
            # Calculate new dimensions to target ~3MB
            reduction_factor = (self.max_image_mb / size_mb) ** 0.5
            new_width = int(image.width * reduction_factor)
            new_height = int(image.height * reduction_factor)
            
            # Resize image
            resized_image = image.resize((new_width, new_height), Image.LANCZOS if hasattr(Image, 'LANCZOS') else Image.ANTIALIAS)
            
            # Convert back to bytes
            output = BytesIO()
            format = image.format if image.format else "JPEG"
            resized_image.save(output, format=format, quality=85, optimize=True)
            
            logger.info(f"Resized image from {size_mb:.2f}MB to {len(output.getvalue()) / (1024*1024):.2f}MB")
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Image resize failed: {e}")
            return image_data

    async def _upload_local(self, image_data: bytes, filename: str) -> str:
        """Upload to local filesystem"""
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            extension = filename.split('.')[-1] if '.' in filename else 'jpg'
            local_filename = f"{file_id}.{extension}"
            local_path = f"uploads/{local_filename}"
            
            # Write file
            with open(local_path, 'wb') as f:
                f.write(image_data)
            
            # Return URL (assumes server serves /uploads as static files)
            base_url = settings.backend_base_url or "http://localhost:8000"
            return f"{base_url}/uploads/{local_filename}"
            
        except Exception as e:
            logger.error(f"Local upload failed: {e}")
            raise

    async def _upload_supabase(self, image_data: bytes, filename: str) -> str:
        """Upload to Supabase Storage"""
        try:
            if not self.supabase:
                raise ValueError("Supabase client not initialized")
            
            # Generate unique filename
            file_id = str(uuid.uuid4())
            extension = filename.split('.')[-1] if '.' in filename else 'jpg'
            storage_path = f"cases/{file_id}.{extension}"
            
            # Upload to Supabase
            response = self.supabase.storage.from_(self.bucket_name).upload(
                storage_path, image_data
            )
            
            if response.get('error'):
                raise Exception(f"Supabase upload error: {response['error']}")
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(storage_path)
            
            logger.info(f"Uploaded to Supabase: {storage_path}")
            return public_url
            
        except Exception as e:
            logger.error(f"Supabase upload failed: {e}")
            raise

# Create singleton instance
storage_service = StorageService()
