# Generated by Django 5.1.1 on 2024-09-17 01:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0024_alter_question_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='created_at',
            field=models.DateField(auto_now_add=True, null=True),
        ),
        migrations.AlterField(
            model_name='question',
            name='updated_at',
            field=models.DateField(auto_now=True, null=True),
        ),
    ]
