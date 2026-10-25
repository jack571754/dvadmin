"""Local-only test server settings; always use a separate disposable database."""
from pathlib import Path
import os

# Some legacy SSE/WebSocket modules import application.settings directly.
# Set the isolated key before loading that module so every auth path agrees.
os.environ["DJANGO_SECRET_KEY"] = "dvadmin-isolated-e2e-signing-key-never-use-in-another-environment"
from .settings import *  # noqa: F403

E2E_ROOT = Path(__file__).resolve().parent.parent / ".e2e"
E2E_ROOT.mkdir(exist_ok=True)
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": E2E_ROOT / "db.sqlite3"}}
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost", "testserver"]
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
DISPATCH_DB_TYPE = "memory"
MEDIA_ROOT = E2E_ROOT / "media"
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
CELERY_TASK_ALWAYS_EAGER = True
API_LOG_ENABLE = False
LOGGING = {**LOGGING, "loggers": {**LOGGING.get("loggers", {}),  # noqa: F405
    "uvicorn.access": {"handlers": [], "propagate": False, "level": "CRITICAL"},
}}
LOGGING["handlers"] = {
    name: {**handler, **({"filename": str(E2E_ROOT / (name + ".log"))} if "filename" in handler else {})}
    for name, handler in LOGGING["handlers"].items()
}
