import hashlib
import hmac
import json
from django.conf import settings

def compute_file_sha256(file_field):
    """
    Computes the SHA-256 cryptographic checksum of an uploaded file stream in 64KB chunks
    to verify file integrity and prevent silent tampering without consuming massive RAM.
    
    Returns:
        str: 64-character lowercase hexadecimal SHA-256 hash string, or None if no file exists.
    """
    if not file_field:
        return None

    sha256 = hashlib.sha256()
    try:
        # Preserve file pointer if file is already open
        original_pos = None
        if hasattr(file_field, 'file') and file_field.file:
            try:
                original_pos = file_field.seek(0, 0)
            except (AttributeError, ValueError, IOError):
                original_pos = None

        # Read in 64KB chunks
        try:
            for chunk in file_field.chunks(chunk_size=65536):
                sha256.update(chunk)
        except (AttributeError, ValueError, IOError):
            # Fallback for underlying storage object without chunks()
            with file_field.open('rb') as f:
                while True:
                    chunk = f.read(65536)
                    if not chunk:
                        break
                    sha256.update(chunk)

        if original_pos is not None:
            try:
                file_field.seek(original_pos, 0)
            except (AttributeError, ValueError, IOError):
                pass

        return sha256.hexdigest()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Failed to calculate SHA-256 for file {getattr(file_field, 'name', 'unknown')}: {e}")
        return None


def generate_digital_signature(payload):
    """
    Generates a tamper-proof SHA-256 HMAC digital signature for any record dictionary or string payload
    using Django's SECRET_KEY as the secret signing root.
    
    Returns:
        str: 64-character hexadecimal HMAC-SHA256 digital signature.
    """
    if isinstance(payload, dict):
        # Sort keys to ensure deterministic representation
        serialized = json.dumps(payload, sort_keys=True, default=str).encode('utf-8')
    elif isinstance(payload, str):
        serialized = payload.encode('utf-8')
    else:
        serialized = str(payload).encode('utf-8')

    secret = getattr(settings, 'SECRET_KEY', 'truster-default-hmac-secret').encode('utf-8')
    signature = hmac.new(secret, serialized, hashlib.sha256).hexdigest()
    return signature
