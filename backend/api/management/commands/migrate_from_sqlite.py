"""
Management command to migrate seed data from an existing SQLite file
into the current default database (PostgreSQL on Liara).

This focuses on read-only reference data required by the app UI:
- scopes
- services
- service_tabs
- service_fields
- ticket_categories
- ticket_file_types

Usage:
  python manage.py migrate_from_sqlite --sqlite /app/backend/db.sqlite3

Notes:
- The command is idempotent. Existing rows are updated/kept; missing rows are created.
- If a table does not exist in the SQLite file, it will be skipped gracefully.
"""

import os
import sqlite3
from typing import Any, Dict

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import (
    Scope, Service, ServiceTab, ServiceField,
    TicketCategory, TicketFileType,
)


class Command(BaseCommand):
    help = "Migrate seed data from an existing SQLite database file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--sqlite",
            type=str,
            default=os.environ.get("SQLITE_PATH", "/app/backend/db.sqlite3"),
            help="Path to SQLite file to read from (default: /app/backend/db.sqlite3)",
        )

    def handle(self, *args, **options):
        sqlite_path = options["sqlite"]

        if not os.path.exists(sqlite_path):
            self.stdout.write(self.style.ERROR(f"SQLite file not found: {sqlite_path}"))
            return

        self.stdout.write(self.style.NOTICE(f"Reading from SQLite: {sqlite_path}"))

        conn = sqlite3.connect(sqlite_path)
        conn.row_factory = sqlite3.Row
        try:
            with transaction.atomic():
                self._migrate_scopes(conn)
                self._migrate_services(conn)
                self._migrate_service_tabs(conn)
                self._migrate_service_fields(conn)
                self._migrate_ticket_categories(conn)
                self._migrate_ticket_file_types(conn)
        finally:
            conn.close()

        self.stdout.write(self.style.SUCCESS("Seed data migration from SQLite completed."))

    # --- Helpers ---

    def _table_exists(self, conn: sqlite3.Connection, table: str) -> bool:
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        return cur.fetchone() is not None

    def _fetch_all(self, conn: sqlite3.Connection, table: str) -> list[Dict[str, Any]]:
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    def _migrate_scopes(self, conn: sqlite3.Connection):
        table = "scopes"
        if not self._table_exists(conn, table):
            self.stdout.write(self.style.WARNING(f"Skipping: table '{table}' not found"))
            return
        rows = self._fetch_all(conn, table)
        created, updated = 0, 0
        for r in rows:
            obj, was_created = Scope.objects.update_or_create(
                id=r.get("id"),
                defaults={
                    "name": r.get("name"),
                    "display_name": r.get("display_name") or r.get("name"),
                    "description": r.get("description") or "",
                    "icon": r.get("icon"),
                    "is_active": bool(r.get("is_active", True)),
                },
            )
            created += int(was_created)
            updated += int(not was_created)
        self.stdout.write(f"Scopes -> created: {created}, updated: {updated}")

    def _migrate_services(self, conn: sqlite3.Connection):
        table = "services"
        if not self._table_exists(conn, table):
            self.stdout.write(self.style.WARNING(f"Skipping: table '{table}' not found"))
            return
        rows = self._fetch_all(conn, table)
        created, updated = 0, 0
        for r in rows:
            scope_id = r.get("scope_id") or r.get("scope_id_id") or r.get("scope")
            scope = Scope.objects.filter(id=scope_id).first()
            if not scope:
                # try by name fallback
                scope = Scope.objects.filter(name=r.get("scope")).first()
            obj, was_created = Service.objects.update_or_create(
                id=r.get("id"),
                defaults={
                    "scope": scope,
                    "name": r.get("name"),
                    "type": r.get("type") or "design",
                    "description": r.get("description") or "",
                    "base_price": r.get("base_price"),
                    "estimated_delivery_days": r.get("estimated_delivery_days"),
                    "supports_documentation": bool(r.get("supports_documentation", False)),
                    "has_tabs": bool(r.get("has_tabs", False)),
                    "is_active": bool(r.get("is_active", True)),
                },
            )
            created += int(was_created)
            updated += int(not was_created)
        self.stdout.write(f"Services -> created: {created}, updated: {updated}")

    def _migrate_service_tabs(self, conn: sqlite3.Connection):
        table = "service_tabs"
        if not self._table_exists(conn, table):
            self.stdout.write(self.style.WARNING(f"Skipping: table '{table}' not found"))
            return
        rows = self._fetch_all(conn, table)
        created, updated = 0, 0
        for r in rows:
            service_id = r.get("service_id") or r.get("service_id_id") or r.get("service")
            service = Service.objects.filter(id=service_id).first()
            obj, was_created = ServiceTab.objects.update_or_create(
                id=r.get("id"),
                defaults={
                    "service": service,
                    "name": r.get("name"),
                    "display_name": r.get("display_name") or r.get("name"),
                    "description": r.get("description") or "",
                    "order": r.get("order", 0),
                    "is_active": bool(r.get("is_active", True)),
                },
            )
            created += int(was_created)
            updated += int(not was_created)
        self.stdout.write(f"Service tabs -> created: {created}, updated: {updated}")

    def _migrate_service_fields(self, conn: sqlite3.Connection):
        table = "service_fields"
        if not self._table_exists(conn, table):
            self.stdout.write(self.style.WARNING(f"Skipping: table '{table}' not found"))
            return
        rows = self._fetch_all(conn, table)
        created, updated = 0, 0
        for r in rows:
            service_id = r.get("service_id") or r.get("service_id_id") or r.get("service")
            tab_id = r.get("tab_id") or r.get("tab_id_id") or r.get("tab")
            service = Service.objects.filter(id=service_id).first()
            tab = ServiceTab.objects.filter(id=tab_id).first() if tab_id else None
            obj, was_created = ServiceField.objects.update_or_create(
                id=r.get("id"),
                defaults={
                    "service": service,
                    "tab": tab,
                    "name": r.get("name"),
                    "field_key": r.get("field_key"),
                    "type": r.get("type") or "text",
                    "options": r.get("options"),
                    "is_required": bool(r.get("is_required", False)),
                    "order": r.get("order", 0),
                    "help_text": r.get("help_text") or "",
                    "validation_rules": r.get("validation_rules"),
                },
            )
            created += int(was_created)
            updated += int(not was_created)
        self.stdout.write(f"Service fields -> created: {created}, updated: {updated}")

    def _migrate_ticket_categories(self, conn: sqlite3.Connection):
        table = "ticket_categories"
        if not self._table_exists(conn, table):
            self.stdout.write(self.style.WARNING(f"Skipping: table '{table}' not found"))
            return
        rows = self._fetch_all(conn, table)
        created, updated = 0, 0
        for r in rows:
            obj, was_created = TicketCategory.objects.update_or_create(
                id=r.get("id"),
                defaults={
                    "name": r.get("name"),
                    "display_name": r.get("display_name") or r.get("name"),
                    "requires_order": bool(r.get("requires_order", False)),
                    "description": r.get("description") or "",
                },
            )
            created += int(was_created)
            updated += int(not was_created)
        self.stdout.write(f"Ticket categories -> created: {created}, updated: {updated}")

    def _migrate_ticket_file_types(self, conn: sqlite3.Connection):
        table = "ticket_file_types"
        if not self._table_exists(conn, table):
            self.stdout.write(self.style.WARNING(f"Skipping: table '{table}' not found"))
            return
        rows = self._fetch_all(conn, table)
        created, updated = 0, 0
        for r in rows:
            obj, was_created = TicketFileType.objects.update_or_create(
                id=r.get("id"),
                defaults={
                    "name": r.get("name"),
                    "display_name": r.get("display_name") or r.get("name"),
                    "category": r.get("category") or "other",
                    "extensions": r.get("extensions") or [],
                    "mime_types": r.get("mime_types") or [],
                    "max_size_mb": r.get("max_size_mb", 100),
                    "is_active": bool(r.get("is_active", True)),
                },
            )
            created += int(was_created)
            updated += int(not was_created)
        self.stdout.write(f"Ticket file types -> created: {created}, updated: {updated}")


