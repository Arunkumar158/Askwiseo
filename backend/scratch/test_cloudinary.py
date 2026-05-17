
import cloudinary
import cloudinary.uploader
from config import settings

print(f"Cloud Name: {settings.CLOUDINARY_CLOUD_NAME}")

if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    try:
        response = cloudinary.uploader.upload(
            b"Dummy PDF content",
            resource_type="raw",
            public_id="test_doc.pdf",
            folder="askwiseo/uploads/test_user"
        )
        print("Success!")
        print("URL:", response.get("secure_url"))
    except Exception as e:
        print("Upload failed:", e)
else:
    print("No credentials configured")
