from django.db import migrations


ICON_FIELD_KEY = "icon"


def set_icon_field_kind(apps, kind):
    ProductSpecTemplate = apps.get_model("design_order", "ProductSpecTemplate")
    for template in ProductSpecTemplate.objects.all().iterator():
        fields = [dict(field) for field in (template.fields or [])]
        changed = False
        for field in fields:
            if field.get("key") != ICON_FIELD_KEY:
                continue
            field["kind"] = kind
            changed = True
        if changed:
            template.fields = fields
            template.save(update_fields=["fields"])


def make_icon_longtext(apps, schema_editor):
    set_icon_field_kind(apps, "longtext")


def restore_icon_text(apps, schema_editor):
    set_icon_field_kind(apps, "text")


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0014_trim_main_image_snapshot_rows"),
    ]

    operations = [
        migrations.RunPython(make_icon_longtext, restore_icon_text),
    ]
