"""File managers for handling different storage backends"""

from .scientific_file_manager import ScientificFileManager
from .user_file_manager import UserFileManager

# Singleton instances
scientific_file_manager = ScientificFileManager()
user_file_manager = UserFileManager()

__all__ = [
    'ScientificFileManager',
    'UserFileManager', 
    'scientific_file_manager',
    'user_file_manager'
]
