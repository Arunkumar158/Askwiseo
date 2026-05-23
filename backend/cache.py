import time
from typing import Any, Tuple
from cachetools import TTLCache

# Global cache instances
# Cache for embed operations (input_str -> embedding list)
_embed_cache = TTLCache(maxsize=1024, ttl=300)  # 5 minutes

# Cache for retrieve_chunks results (key -> list of chunks)
# Key is a tuple of (query, user_id, document_id or None, n_results)
_retrieve_cache = TTLCache(maxsize=2048, ttl=300)

def cache_key(*args: Any) -> Tuple:
    """Create a hashable cache key from arguments.
    Handles None values and ensures consistent ordering.
    """
    return tuple(args)

def get_from_cache(cache: TTLCache, key: Tuple) -> Any:
    return cache.get(key)

def set_in_cache(cache: TTLCache, key: Tuple, value: Any) -> None:
    cache[key] = value
