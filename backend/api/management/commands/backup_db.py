"""
Django management command for database backup operations.
"""
import os
import subprocess
import tempfile
from datetime import datetime
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

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        compress = options['compress']
        s3_upload = options['s3_upload']
        backup_dir = options['backup_dir']

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
        try:
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
                # Use gzip compression
                with open(backup_file, 'wb') as f:
                    process1 = subprocess.Popen(cmd, stdout=subprocess.PIPE, env=env)
                    process2 = subprocess.Popen(['gzip'], stdin=process1.stdout, stdout=f)
                    process1.stdout.close()
                    process2.wait()
                    process1.wait()
            else:
                with open(backup_file, 'wb') as f:
                    subprocess.run(cmd, stdout=f, env=env, check=True)

            # Verify backup file
            if os.path.exists(backup_file) and os.path.getsize(backup_file) > 0:
                size = os.path.getsize(backup_file)
                self.stdout.write(
                    self.style.SUCCESS(f"Backup created successfully. Size: {size} bytes")
                )
            else:
                raise CommandError("Backup file is empty or doesn't exist")

        except subprocess.CalledProcessError as e:
            raise CommandError(f"Backup failed: {e}")
        except FileNotFoundError:
            raise CommandError("pg_dump command not found. Please install PostgreSQL client tools.")

        # Upload to S3 if requested
        if s3_upload:
            self.upload_to_s3(backup_file)

        # Clean up old backups
        self.cleanup_old_backups(backup_dir)

    def upload_to_s3(self, backup_file):
        """Upload backup file to S3."""
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            bucket_name = settings.S3_BACKUP_BUCKET
            s3_key = f"postgresql/{os.path.basename(backup_file)}"
            
            self.stdout.write(f"Uploading to S3: s3://{bucket_name}/{s3_key}")
            
            s3_client.upload_file(backup_file, bucket_name, s3_key)
            
            self.stdout.write(
                self.style.SUCCESS(f"Backup uploaded to S3: s3://{bucket_name}/{s3_key}")
            )
            
        except ClientError as e:
            raise CommandError(f"S3 upload failed: {e}")
        except AttributeError:
            raise CommandError("S3 configuration missing. Please set AWS credentials and S3_BACKUP_BUCKET.")

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
