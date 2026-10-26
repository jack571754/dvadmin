import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

class DesignOrderRestorationTests(unittest.TestCase):
    def test_six_menu_components_exist(self):
        for component in ('design_workorder_archive', 'icon_library', 'product_archive', 'product_spec_submission', 'spec_template', 'product_spec'):
            with self.subTest(component=component):
                self.assertTrue((ROOT / 'web/src/views/design_order' / component / 'index.vue').is_file(), component)

    def test_backend_module_exists(self):
        self.assertTrue((ROOT / 'backend/dvadmin/design_order/urls.py').is_file())

if __name__ == '__main__':
    unittest.main()
