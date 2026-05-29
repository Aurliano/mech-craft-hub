"""
Django management command for database backup operations.
"""
import gzip
import os
import shutil
import subprocess
from datetime import datetime
from io import StringIO

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import boto3
from botocore.exceptions import ClientError


class Command(BaseCommand):
    help = 'Backup PostgreSQL database with optional S3 upload'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually doing it',
        )
        parser.add_argument(
            '--compress',
            action='store_true',
            help='Compress the backup file',
        )
        parser.add_argument(
            '--s3-upload',
            action='store_true',
            help='Upload backup to S3',
        )
        parser.add_argument(
            '--backup-dir',
            type=str,
            default='/app/backups',
            help='Directory to store backup files',
        )
        parser.add_argument(
            '--output',
            type=str,
            default='',
            help='Exact output path (e.g. /app/backups/emergency.dump)',
        )

    def _ensure_pg_dump(self):
        """Try to locate pg_dump; on Debian slim images install postgresql-client."""
        if shutil.which('pg_dump'):
            return True

        self.stdout.write(self.style.WARNING('pg_dump not found; attempting to install postgresql-client...'))
        if os.name != 'posix' or os.geteuid() != 0:
            return False

        try:
            subprocess.run(
                ['apt-get', 'update'],
                check=True,
                capture_output=True,
                timeout=120,
            )
            subprocess.run(
                [
                    'apt-get', 'install', '-y', '--no-install-recommends',
                    'postgresql-client',
                ],
                check=True,
                capture_output=True,
                timeout=300,
            )
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as exc:
            self.stdout.write(self.style.WARNING(f'Could not install postgresql-client: {exc}'))
            return False

        return bool(shutil.which('pg_dump'))

    def _dumpdata_fallback(self, backup_file, compress):
        """JSON dump via Django when pg_dump is unavailable (restore with loaddata)."""
        self.stdout.write(self.style.WARNING(
            'Using dumpdata fallback — restore with: python manage.py loaddata <file>'
        ))
        out = StringIO()
        call_command(
            'dumpdata',
            natural_foreign=True,
            natural_primary=True,
            indent=2,
            stdout=out,
        )
        payload = out.getvalue().encode('utf-8')
        if compress or backup_file.endswith('.gz'):
            if not backup_file.endswith('.gz'):
                backup_file = f'{backup_file}.gz'
            with gzip.open(backup_file, 'wb') as f:
                f.write(payload)
        else:
            if backup_file.endswith('.gz'):
                backup_file = backup_file[:-3]
            with open(backup_file, 'wb') as f:
                f.write(payload)
        return backup_file

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        compress = options.get('compress', False)
        s3_upload = options.get('s3_upload', False)
        backup_dir = options.get('backup_dir', '/app/backups')
        output_path = (options.get('output') or '').strip()

        # Get database configuration
        db_config = settings.DATABASES['default']
        
        if db_config['ENGINE'] != 'django.db.backends.postgresql':
            raise CommandError('This command only works with PostgreSQL databases')

        # Set environment variables for pg_dump
        env = os.environ.copy()
        if 'PASSWORD' in db_config:
            env['PGPASSWORD'] = db_config['PASSWORD']

        # Create backup directory
        if not dry_run:
            os.makedirs(backup_dir, exist_ok=True)

        # Generate backup filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        db_name = db_config['NAME']
        if output_path:
            backup_file = output_path
            if compress and not backup_file.endswith('.gz'):
                backup_file = f'{backup_file}.gz'
        else:
            backup_file = os.path.join(backup_dir, f"{db_name}_backup_{timestamp}.sql")
            if compress:
                backup_file += '.gz'

        self.stdout.write(f"Backing up database: {db_name}")
        self.stdout.write(f"Backup file: {backup_file}")
        self.stdout.write(f"Dry run: {dry_run}")

        if dry_run:
            self.stdout.write("DRY RUN: Would execute the following commands:")
            cmd = [
                'pg_dump',
                '-h', db_config['HOST'],
                '-p', str(db_config['PORT']),
                '-U', db_config['USER'],
                '-d', db_config['NAME'],
                '--verbose',
                '--no-password',
                '--format=custom'
            ]
            
            if compress:
                self.stdout.write(f"{' '.join(cmd)} | gzip > {backup_file}")
            else:
                self.stdout.write(f"{' '.join(cmd)} > {backup_file}")
            
            if s3_upload:
                self.stdout.write(f"aws s3 cp {backup_file} s3://{settings.S3_BACKUP_BUCKET}/")
            
            return

        # Perform the backup
        used_dumpdata = False
        try:
            if not self._ensure_pg_dump():
                backup_file = self._dumpdata_fallback(backup_file, compress)
                used_dumpdata = True
            else:
                cmd = [
                    'pg_dump',
                    '-h', db_config['HOST'],
                    '-p', str(db_config['PORT']),
                    '-U', db_config['USER'],
                    '-d', db_config['NAME'],
                    '--verbose',
                    '--no-password',
                    '--format=custom',
                ]

                if compress:
                    with open(backup_file, 'wb') as f:
                        process1 = subprocess.Popen(cmd, stdout=subprocess.PIPE, env=env)
                        process2 = subprocess.Popen(['gzip'], stdin=process1.stdout, stdout=f)
                        process1.stdout.close()
                        process2.wait()
                        if process1.wait() != 0:
                            raise subprocess.CalledProcessError(process1.returncode, cmd)
                        if process2.returncode != 0:
                            raise subprocess.CalledProcessError(process2.returncode, ['gzip'])
                else:
                    with open(backup_file, 'wb') as f:
                        subprocess.run(cmd, stdout=f, env=env, check=True)

            if os.path.exists(backup_file) and os.path.getsize(backup_file) > 0:
                size = os.path.getsize(backup_file)
                self.stdout.write(
                    self.style.SUCCESS(f"Backup created successfully. Size: {size} bytes")
                )
                if used_dumpdata:
                    symlink = os.path.join(backup_dir, 'emergency.json.gz')
                    try:
                        if os.path.lexists(symlink):
                            os.remove(symlink)
                        os.symlink(os.path.abspath(backup_file), symlink)
                        self.stdout.write(f'Also linked as: {symlink}')
                    except OSError:
                        pass
            else:
                raise CommandError("Backup file is empty or doesn't exist")

        except subprocess.CalledProcessError as e:
            raise CommandError(f"Backup failed: {e}")
        except FileNotFoundError:
            backup_file = self._dumpdata_fallback(backup_file, compress)
            if not os.path.exists(backup_file) or os.path.getsize(backup_file) == 0:
                raise CommandError(
                    "pg_dump not found and dumpdata fallback failed. "
                    "Run: apt-get update && apt-get install -y postgresql-client"
                )

        # Upload to S3 if requested
        if s3_upload:
            self.upload_to_s3(backup_file)

        # Clean up old backups
        self.cleanup_old_backups(backup_dir)

    def upload_to_s3(self, backup_file):
        """Upload backup file to S3."""
        try:
            # Try Liara S3 settings first
            access_key = getattr(settings, 'LIARA_ACCESS_KEY_ID', None) or getattr(settings, 'LIARA_ACCESS_KEY', None)
            secret_key = getattr(settings, 'LIARA_SECRET_ACCESS_KEY', None) or getattr(settings, 'LIARA_SECRET_KEY', None)
            endpoint_url = getattr(settings, 'LIARA_ENDPOINT_URL', None) or getattr(settings, 'S3_ENDPOINT_URL', None)
            bucket_name = getattr(settings, 'FILE_BUCKET_NAME', None) or getattr(settings, 'S3_BACKUP_BUCKET', None)
            
            # Fallback to AWS settings
            if not access_key:
                access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
            if not secret_key:
                secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
            if not bucket_name:
                bucket_name = getattr(settings, 'S3_BACKUP_BUCKET', None)
            
            if not access_key or not secret_key or not bucket_name:
                raise CommandError("S3 configuration missing. Please set LIARA_ACCESS_KEY_ID, LIARA_SECRET_ACCESS_KEY, and FILE_BUCKET_NAME (or AWS equivalents).")
            
            # Create S3 client
            s3_config = {
                'aws_access_key_id': access_key,
                'aws_secret_access_key': secret_key,
            }
            if endpoint_url:
                s3_config['endpoint_url'] = endpoint_url
                s3_config['region_name'] = getattr(settings, 'FILE_REGION', 'iran')
            
            s3_client = boto3.client('s3', **s3_config)
            
            s3_key = f"postgresql/{os.path.basename(backup_file)}"
            
            self.stdout.write(f"Uploading to S3: s3://{bucket_name}/{s3_key}")
            
            s3_client.upload_file(backup_file, bucket_name, s3_key)
            
            self.stdout.write(
                self.style.SUCCESS(f"Backup uploaded to S3: s3://{bucket_name}/{s3_key}")
            )
            
        except ClientError as e:
            raise CommandError(f"S3 upload failed: {e}")
        except Exception as e:
            raise CommandError(f"S3 upload failed: {str(e)}")

    def cleanup_old_backups(self, backup_dir, retention_days=30):
        """Remove backup files older than retention_days."""
        import glob
        from datetime import timedelta
        
        pattern = os.path.join(backup_dir, "*_backup_*.sql*")
        backup_files = glob.glob(pattern)
        
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        removed_count = 0
        
        for backup_file in backup_files:
            file_time = datetime.fromtimestamp(os.path.getmtime(backup_file))
            if file_time < cutoff_date:
                os.remove(backup_file)
                removed_count += 1
        
        if removed_count > 0:
            self.stdout.write(f"Removed {removed_count} old backup files")
