"""
Initialize book borrowing related button permissions

Usage:
    python manage.py init_book_permissions
"""

import sys
from django.core.management.base import BaseCommand
from dvadmin.system.models import MenuButton, Menu


class Command(BaseCommand):
    help = 'Initialize book borrowing button permissions'

    def handle(self, *args, **options):
        self.stdout.write('Initializing book borrowing button permissions...')

        # Find book list menu - use component name instead of Chinese name
        try:
            book_menu = Menu.objects.get(
                component='book/book/index'
            )
            print('Found book menu: ID=%d' % book_menu.id)
        except Menu.DoesNotExist:
            self.stdout.write(self.style.ERROR('Book list menu not found, please create it first'))
            return
        except Menu.MultipleObjectsReturned:
            # If multiple matches, get the first one
            book_menu = Menu.objects.filter(
                component='book/book/index'
            ).first()
            print('Found book menu: ID=%d' % book_menu.id)

        # Define button permissions to create
        buttons = [
            {
                'name': 'Borrow',
                'value': 'book:book:Borrow',
                'description': 'Borrow book button',
            },
            {
                'name': 'Return',
                'value': 'book:book:Return',
                'description': 'Return book button',
            }
        ]

        # Create or update button permissions
        created_count = 0
        updated_count = 0

        for button_data in buttons:
            value = button_data.pop('value')

            # Check if already exists
            existing = MenuButton.objects.filter(
                menu=book_menu,
                value=value
            ).first()

            if existing:
                # Update existing button
                for key, val in button_data.items():
                    setattr(existing, key, val)
                existing.save()
                updated_count += 1
                print('[UPDATE] %s (%s)' % (button_data['name'], value))
            else:
                # Create new button
                MenuButton.objects.create(
                    menu=book_menu,
                    value=value,
                    **button_data
                )
                created_count += 1
                print('[CREATE] %s (%s)' % (button_data['name'], value))

        print('')
        print('Initialization complete!')
        print('  - Created: %d' % created_count)
        print('  - Updated: %d' % updated_count)
        print('')
        print('Please refresh frontend page to see changes')
