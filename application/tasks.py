from celery import shared_task
from .models import db,Mybooks,Book,User,Role,Feedback
from .mail_service import send_message
import flask_excel as excel
from jinja2 import Template

@shared_task(ignore_result=False)
def create_resource_csv():
    result = db.session.query(
        Mybooks.book_id,
        Book.book_name,
        Mybooks.status
    ).join(Book, Mybooks.book_id == Book.id).all()

    # Prepare the data for CSV output
    csv_data = [(row.book_id, row.book_name, row.status) for row in result]

    # Create CSV output
    csv_output = excel.make_response_from_array(csv_data, 'csv')
    filename = 'test1.csv'

    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename

@shared_task(ignore_result=True)
def daily_reminder(to, subject):
    users = User.query.filter(User.roles.any(Role.name == 'user')).all()
    for user in users:
        with open('test.html', 'r') as f:
            template = Template(f.read())
            send_message(user.email, subject,
                         template.render(username=user.username))
    return "OK"

@shared_task(ignore_result=True)
def monthly_report(to, subject):
    users = User.query.filter(User.roles.any(Role.name == 'admin')).all()

    approved_books = Mybooks.query.filter_by(status='Approved').all()
    books_data = []

    for entry in approved_books:
        book = Book.query.get(entry.book_id)
        user = User.query.get(entry.user_id)
        feedback = Feedback.query.filter_by(book_id=entry.book_id).all()

        books_data.append({
            'book': book,
            'issue_date': entry.issue_date,
            'feedback': feedback,
            'user': user
        })

    for user in users:
        with open('monthly_report.html', 'r') as f:
            template = Template(f.read())
            rendered_html = template.render(books=books_data)
            send_message(user.email, subject, rendered_html)

    return "OK"
