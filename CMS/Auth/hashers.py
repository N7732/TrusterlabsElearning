import hashlib
from django.contrib.auth.hashers import PBKDF2PasswordHasher, BasePasswordHasher
from django.utils.crypto import constant_time_compare, get_random_string

class PBKDF2SHA512PasswordHasher(PBKDF2PasswordHasher):
    """
    Hardened PBKDF2 password hasher utilizing SHA-512 algorithm and enterprise-grade iterations (720,000)
    to protect against ASIC/GPU cracking and brute-force attacks.
    """
    algorithm = "pbkdf2_sha512"
    digest = hashlib.sha512
    iterations = 720000


class DirectSHA512PasswordHasher(BasePasswordHasher):
    """
    Salted SHA-512 password hasher formatted as sha512$salt$hash for high-speed legacy and service integrations.
    """
    algorithm = "sha512"

    def salt(self):
        return get_random_string(16)

    def encode(self, password, salt):
        assert password is not None
        assert salt and "$" not in salt
        hash = hashlib.sha512((salt + password).encode('utf-8')).hexdigest()
        return f"{self.algorithm}${salt}${hash}"

    def verify(self, password, encoded):
        algorithm, salt, hash = encoded.split('$', 2)
        assert algorithm == self.algorithm
        encoded_2 = self.encode(password, salt)
        return constant_time_compare(encoded, encoded_2)

    def safe_summary(self, encoded):
        algorithm, salt, hash = encoded.split('$', 2)
        return {
            'algorithm': algorithm,
            'salt': salt,
            'hash': hash[:6] + "..." + hash[-6:],
        }
