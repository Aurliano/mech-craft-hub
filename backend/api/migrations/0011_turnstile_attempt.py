# Generated migration for Turnstile support

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def create_turnstile_table_if_not_exists(apps, schema_editor):
    """Create turnstile_attempts table only if it doesn't exist"""
    db_alias = schema_editor.connection.alias
    
    # Check if table already exists
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'turnstile_attempts'
            );
        """)
        table_exists = cursor.fetchone()[0]
    
    if not table_exists:
        # Create the table
        schema_editor.execute("""
            CREATE TABLE turnstile_attempts (
                id BIGSERIAL PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                ip INET,
                endpoint VARCHAR(255) NOT NULL,
                success BOOLEAN NOT NULL,
                response_raw JSONB,
                token_hash VARCHAR(64) NOT NULL,
                error_message TEXT,
                user_agent TEXT,
                user_id BIGINT REFERENCES auth_user(id) ON DELETE SET NULL
            );
        """)
        
        # Create indexes
        schema_editor.execute("CREATE INDEX turnstile_at_created_idx ON turnstile_attempts (created_at);")
        schema_editor.execute("CREATE INDEX turnstile_at_ip_idx ON turnstile_attempts (ip);")
        schema_editor.execute("CREATE INDEX turnstile_at_success_idx ON turnstile_attempts (success);")
        schema_editor.execute("CREATE INDEX turnstile_at_endpoint_idx ON turnstile_attempts (endpoint);")
        schema_editor.execute("CREATE INDEX turnstile_attempts_token_hash_idx ON turnstile_attempts (token_hash);")


def reverse_create_turnstile_table(apps, schema_editor):
    """Drop turnstile_attempts table"""
    schema_editor.execute("DROP TABLE IF EXISTS turnstile_attempts CASCADE;")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_service_has_tabs'),
    ]

    operations = [
        migrations.RunPython(
            create_turnstile_table_if_not_exists,
            reverse_create_turnstile_table,
        ),
    ]