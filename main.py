from flask import Flask
from flask_security import SQLAlchemyUserDatastore, Security
from application.models import db, User, Role
from config import DevelopmentConfig
from application.resources import api
from application.sec import datastore
import os
from celery.schedules import crontab
from application.tasks import daily_reminder, monthly_report
from application.worker import celery_init_app
import flask_excel as excel
from application.instances import cache
from celery.schedules import timedelta

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    app.security = Security(app,datastore)
    cache.init_app(app)
    with app.app_context():
        import application.views

    return app

app = create_app()
celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    # daily reminder
    sender.add_periodic_task(
        #crontab(hour=0, minute=1),
        crontab(minute='*/2'),
        daily_reminder.s('21f2000730@ds.study.iitm.ac.in', 'Daily Reminder'),
    )

    # monthly report
    sender.add_periodic_task(
        #crontab(day_of_month=1, hour=0, minute=1),
        crontab(minute='*/2'),
        monthly_report.s('21f2000730@ds.study.iitm.ac.in', 'Monthly Report'),
    )


if not os.path.exists('uploads'):
    os.makedirs('uploads')

if __name__ == '__main__':
    app.run(debug=True)

