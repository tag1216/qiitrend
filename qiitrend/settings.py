import os

import dj_database_url
from datetime import date

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'gz!k*@!n8h$yny1)zp!e5#w8!s4%*wqnur5$qnr@$*xx_o+aij'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'webpack_loader',
    'admin_honeypot',
    'rest_framework',
    'social_django',
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'qiitrend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'qiitrend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'ja'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Update database configuration with $DATABASE_URL.
db_from_env = dj_database_url.config(conn_max_age=500)
DATABASES['default'].update(db_from_env)

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Allow all host headers
ALLOWED_HOSTS = ['*']


########################################
# cache

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get("REDIS_URL", "redis://localhost:6379") + "/0",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"


########################################
# Log設定

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '[%(levelname)s] [%(asctime)s] [%(threadName)s] [%(name)s] %(message)s'
        }
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
    },
    'loggers': {
        # 'django.db.backends': {
        #     'handlers': ['console'],
        #     'level': 'DEBUG',
        # },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    }
}


########################################
# staticファイル

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_ROOT = os.path.join(PROJECT_ROOT, 'staticfiles')
STATIC_URL = '/static/'

# Extra places for collectstatic to find static files.
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'assets'),
)

# Simplified static file serving.
# https://warehouse.python.org/project/whitenoise/
STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'dist/',
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats-prod.json')
    }
}


########################################
# 認証設定

AUTHENTICATION_BACKENDS = (
    'social_core.backends.qiita.QiitaOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)
SOCIAL_AUTH_QIITA_KEY = os.environ.get('SOCIAL_AUTH_QIITA_KEY')
SOCIAL_AUTH_QIITA_SECRET = os.environ.get('SOCIAL_AUTH_QIITA_SECRET')
SOCIAL_AUTH_QIITA_SCOPE = ['read_qiita']

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': (
        # 'rest_framework.throttling.AnonRateThrottle',
        # 'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'accounts': '20/min',
        'anon': '30/hour',
        'user': '500/hour',
    }
}

########################################
# Redis

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
REDIS_DB_ITEM_COUNT = 0
REDIS_DB_REQUEST_QUEUE = 0

########################################
# Qiitaトレンド

QIITA_MIN_DATE = date(2011, 9, 15)

COUNT_CACHE_EXPIRE_DEFAULT = os.environ.get("COUNT_CACHE_EXPIRE_DEFAULT", "1day")
COUNT_CACHE_EXPIRE_STOCKS = os.environ.get("COUNT_CACHE_EXPIRE_STOCKS", "1day")
COUNT_CACHE_EXPIRE_LAST = os.environ.get("COUNT_CACHE_EXPIRE_LAST", "1hour")

QIITA_REQUEST_THREADS = int(os.environ.get("QIITA_REQUEST_THREADS", "10"))
QIITA_REQUEST_PER_SECOND = float(os.environ.get("QIITA_REQUEST_PER_SECOND", "1.0"))
QIITA_REQUEST_QUEUE_SIZE = int(os.environ.get("QIITA_REQUEST_QUEUE_SIZE", 600))

########################################
# Admin

ADMIN_URL = os.environ.get('ADMIN_URL', 'adminsite/')

########################################
# Google Analytics

GA_TRACKING_ID = os.environ.get("GA_TRACKING_ID", "UA-xxxxxx")
