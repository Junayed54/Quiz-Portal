# Generated by Django 5.1.1 on 2024-09-15 15:01

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0018_remove_questionstatus_reviewed_by_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='questionstatus',
            name='question',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='quiz.question'),
        ),
    ]