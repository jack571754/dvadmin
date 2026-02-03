# -*- coding: utf-8 -*-
"""
Quick Init Script - Initialize DVAdmin Project

Usage:
    python init_project.py
"""
import os
import sys


def run_command(cmd, description):
    """Run command and show progress"""
    print(f'{description}...')
    result = os.system(cmd)
    if result == 0:
        print(f'  OK')
        return True
    else:
        print(f'  FAILED')
        return False


def main():
    print('=' * 50)
    print('DVAdmin Quick Init')
    print('=' * 50)

    # 1. Database migration
    if not run_command('python manage.py makemigrations', '[1/4] Makemigrations'):
        return
    if not run_command('python manage.py migrate', '[2/4] Migrate'):
        return

    # 2. System init
    if not run_command('python manage.py init', '[3/4] Init System'):
        return

    # 3. Create test data
    if not run_command('python create_minimal_fixtures.py', '[4/4] Create Test Data'):
        return

    print('=' * 50)
    print('Initialization Complete!')
    print('=' * 50)
    print('Test Account: test / test123456')
    print('Start Server: python manage.py runserver 9000')
    print('=' * 50)


if __name__ == '__main__':
    main()
