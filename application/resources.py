from flask_restful import Resource, Api, reqparse, marshal_with, fields, marshal
from flask_security import auth_required,roles_required,current_user
from .models import db, User, Book,Section, Role, Feedback, Mybooks, RolesUsers
from datetime import datetime
from flask import jsonify, send_file, request, send_from_directory
from werkzeug.datastructures import FileStorage
from io import BytesIO
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from sqlalchemy import func
import os
from werkzeug.utils import secure_filename
from .instances import cache

api = Api(prefix='/api')

parser = reqparse.RequestParser()
parser.add_argument('section_name',type=str,help='section name should be a string',required=True)
parser.add_argument('description',type=str,help='description should be a string',required=True)

section_fields = {
    'id':fields.Integer,
    'section_name':fields.String,
    'date_created':fields.DateTime(dt_format='iso8601'),
    'description':fields.String
}

book_fields = {
    'id':fields.Integer,
    'book_name':fields.String,
    'section_id':fields.Integer,
    'content':fields.String,
    'author':fields.String,
    'is_approved':fields.Boolean,
    'pdf_path':fields.String
}

my_book_fields = {
    'id': fields.Integer,
    'username': fields.String(attribute=lambda x: User.query.get(x.user_id).username),
    'book_name': fields.String(attribute=lambda x: Book.query.get(x.book_id).book_name),
    'issue_date': fields.String,
    'return_date': fields.String,
    'status': fields.String,
}

my_book_field = {
    'id':fields.Integer,
    'user_id':fields.Integer,
    'book_name': fields.String(attribute=lambda x: Book.query.get(x.book_id).book_name),
    'book_id':fields.Integer,
    'pdf_path':fields.String(attribute=lambda x: Book.query.get(x.book_id).pdf_path),
    'issue_date': fields.String,
    'return_date': fields.String,
    'status':fields.String
}

feedback_fields = {
    'id':fields.Integer,
    'user_id':fields.Integer,
    'book_id':fields.Integer,
    'feedback':fields.String
}

class Sections(Resource):
    @auth_required("token")
    #@cache.cached(timeout=50)
    def get(self):
        all_section_fields = Section.query.all()
        if len(all_section_fields)==0:
            return {"message":"no resource found"}, 404
        return marshal(all_section_fields,section_fields)
    
    @auth_required("token")
    @roles_required("admin")
    def post(self):
        args = parser.parse_args()
        section = Section(section_name = args.get("section_name"),date_created = datetime.today(),description = args.get("description"))
        db.session.add(section)
        db.session.commit()
        return {"message":"Section created sucessfully"}
        pass

class Section_CRUD(Resource):
    @auth_required("token")
    #@cache.cached(timeout=50)
    def get(self, section_id):
        return marshal(Section.query.get(section_id), section_fields)

    @auth_required("token")
    @roles_required("admin")
    def put(self, section_id):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('section_name', help="Section name", required=True)
            parser.add_argument('description', help="Section Description", required=True)
            args = parser.parse_args()
            if args.get('section_name') == "":
                return {"message": "Section Name is required"}, 401
            edit_section = Section.query.get(section_id)
            edit_section.section_name = args.get('section_name')
            edit_section.description = args.get('description')
        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Updating"}, 500
        else:
            db.session.commit()
            return {"message": "Updated successfully"}, 200

    @auth_required("token")
    @roles_required("admin")
    def delete(self, section_id):
        try:
            delete_section = Section.query.get(section_id)
            db.session.delete(delete_section)
            db.session.commit()
            return {"message": "Deleted successfully"}, 200
        except Exception as e:
            return {"message": "Please remove the books present in the section!"}, 500

class BookResource(Resource):
    @auth_required('token')
    #@cache.cached(timeout=50)
    def get(self):
        all_book_fields = Book.query.all()
        if not all_book_fields:
            return {"message": "no resource found"}, 404
        return marshal(all_book_fields, book_fields)
    
    @auth_required("token")
    @roles_required("admin")
    def post(self):
        print(request.files)  # Add this line

        if 'pdf_path' not in request.files:
            return {"message": "PDF file is required"}, 401

        pdf_file = request.files['pdf_path']
        
        if pdf_file.filename == '':
            return {"message": "No selected file"}, 401

        if pdf_file:
            filename = secure_filename(pdf_file.filename)
            filepath = os.path.join('uploads', filename)
            pdf_file.save(filepath)
        else:
            return {"message": "PDF file is required"}, 401

        parser = reqparse.RequestParser()
        parser.add_argument('book_name', help="Book Name", required=True, location="form")
        parser.add_argument('section_id', help="Section", required=True, location="form")
        parser.add_argument('content', help="Book content", required=True, location="form")
        parser.add_argument('author', location="form", help="Author name", required=True)
        args = parser.parse_args()

        if args.get('book_name') == "":
            return {"message": "Book Name is required"}, 401
        if args.get('section_id') == "":
            return {"message": "Section is required"}, 401
        if args.get('content') == "":
            return {"message": "content is required"}, 401
        if args.get('author') == "":
            return {"message": "author is required"}, 401

        book = Book(
            book_name=args.get("book_name"),
            section_id=args.get("section_id"),
            content=args.get("content"),
            author=args.get("author"),
            pdf_path=filepath
        )
        db.session.add(book)
        db.session.commit()
        return {"message": "Book created successfully"}, 201

class ServePDFResource(Resource):
    @auth_required('token')
    def get(self, filename):
        try:
            return send_from_directory('uploads', filename)
        except FileNotFoundError:
            return {"message": "File not found"}, 404

class BookList(Resource):
    @auth_required('token')
    @marshal_with(book_fields)
   # @cache.cached(timeout=50)
    def get(self):
        books = Book.query.all()
        return books, 200

class BookCreate(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('book_name', type=str, required=True, help="Book Name is required")
        parser.add_argument('section_id', type=int, required=True, help="Section ID is required")
        parser.add_argument('content', type=str, required=True, help="Content is required")
        parser.add_argument('author', type=str, required=True, help="Author is required")
        parser.add_argument('pdf_path', type=str, required=True, help="PDF Path is required")
        args = parser.parse_args()

        new_book = Book(
            book_name=args['book_name'],
            section_id=args['section_id'],
            content=args['content'],
            author=args['author'],
            pdf_path=args['pdf_path']
        )
        db.session.add(new_book)
        db.session.commit()
        return marshal(new_book, book_fields), 201

class BookUpdate(Resource):
    @auth_required('token')
    @roles_required('admin')
    def put(self, book_id):
        parser = reqparse.RequestParser()
        parser.add_argument('book_name', type=str, required=True, help="Book Name is required")
        parser.add_argument('section_id', type=int, required=True, help="Section ID is required")
        parser.add_argument('content', type=str, required=True, help="Content is required")
        parser.add_argument('author', type=str, required=True, help="Author is required")
        args = parser.parse_args()

        book = Book.query.get(book_id)
        if not book:
            return {"message": "Book not found"}, 404

        book.book_name = args['book_name']
        book.section_id = args['section_id']
        book.content = args['content']
        book.author = args['author']

        db.session.commit()
        return marshal(book, book_fields), 200

class BookDelete(Resource):
    @auth_required('token')
    @roles_required('admin')
    def delete(self, book_id):
        book = Book.query.get(book_id)
        if not book:
            return {"message": "Book not found"}, 404
        try:
            db.session.delete(book)
            db.session.commit()
            return {"message": "Book deleted successfully"}, 200
        except Exception as e:
            return {"message": "cannot delete this book!"}, 500
        

class MyBooks(Resource):
    @auth_required('token')
    @marshal_with(my_book_field)
    #@cache.cached(timeout=50)
    def get(self):
        user_id = current_user.id
        mybooks = Mybooks.query.filter_by(user_id=user_id,status='Pending').all()
        return mybooks

    @roles_required('user')
    @auth_required('token')
    def post(self):
        user_id = current_user.id
        parser = reqparse.RequestParser()
        parser.add_argument('book_id', required=True, location="json")
        parser.add_argument('return_date', required=True, location="json")
        args = parser.parse_args()

        if Mybooks.query.filter(Mybooks.user_id == user_id,Mybooks.book_id == args['book_id'],Mybooks.status.in_(['Approved', 'Pending'])).first():
            return {"message": "Cannot add this book, this book is already added!"}, 201

        new_mybook = Mybooks(
            user_id=user_id,
            book_id=args['book_id'],
            issue_date=datetime.utcnow(),
            return_date=datetime.strptime(args['return_date'], '%Y-%m-%d'),
            status='Pending'
        )
        db.session.add(new_mybook)
        db.session.commit()
        return {"message": "Book request created successfully"}, 201

    @auth_required('token')
    def put(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument('status', type=str, required=True, location="json")
        args = parser.parse_args()

        mybook = Mybooks.query.get(id)
        if not mybook:
            return {"message": "Book request not found"}, 404
        
        mybook.status = args['status']
        db.session.commit()
        return {"message": "Book request updated successfully"}, 200
    
    @auth_required('token')
    def delete(self, id):
        mybook = Mybooks.query.get(id)
        if not mybook:
            return {"message": "request not found"}, 404

        db.session.delete(mybook)
        db.session.commit()
        return {"message": "Request of Book cancled successfully"}, 200
    
class MyBooks_admin(Resource):
    @auth_required('token')
    @marshal_with(my_book_fields)
    #@cache.cached(timeout=50)
    def get(self):
        mybooks = Mybooks.query.filter_by(status='Pending').all()
        return mybooks

    @auth_required('token')
    def put(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument('status', type=str, required=True, location="json")
        args = parser.parse_args()

        mybook = Mybooks.query.get(id)
        if not mybook:
            return {"message": "Book request not found"}, 404
        
        mybook.status = args['status']
        db.session.commit()
        return {"message": "Book request updated successfully"}, 200
    
class MyBooks_admin_issue_book(Resource):
    @auth_required('token')
    @roles_required('admin')
    @marshal_with(my_book_fields)
    #@cache.cached(timeout=50)
    def get(self):
        mybooks = Mybooks.query.filter_by(status='Approved').all()
        return mybooks
    
class MyBooks_user(Resource):
    @auth_required('token')
    @roles_required('user')
    @marshal_with(my_book_field)
    #@cache.cached(timeout=50)
    def get(self):
        user_id = current_user.id
        mybooks = Mybooks.query.filter_by(user_id=user_id,status='Approved').all()
        return mybooks

class BookCount(Resource):
    @auth_required('token')
    #@cache.cached(timeout=50)
    @roles_required('user')
    def get(self):
        user_id = current_user.id
        book_count = Mybooks.query.filter(Mybooks.user_id == user_id, Mybooks.status.in_(['Approved', 'Pending'])).count()
        return book_count
    
class FeedBack(Resource):
    @marshal_with(feedback_fields)
    @auth_required('token')
    @cache.cached(timeout=50)
    @roles_required('user')
    def get(self,id):
        feedback = Feedback.query.filter_by(book_id=id).all()
        return feedback
    
    @auth_required('token')
    @roles_required('user')
    #@marshal_with(feedback_fields)
    def post(self,id):
        user_id = current_user.id
        parser = reqparse.RequestParser()
        parser.add_argument('book_id', help="Book", required=True)
        parser.add_argument('feedback', help="Feedback", required=True)

        args = parser.parse_args()

        if Feedback.query.filter_by(user_id=user_id, book_id=id).count() >= 1:
            return {"message":"Feedback already given!"} ,201

        feedback = Feedback(
            user_id=user_id,
            book_id=id,
            feedback=args['feedback']
        )
        db.session.add(feedback)
        db.session.commit()
        return {"message": "Feedback submitted"} ,200
    
class StatusPieChart(Resource):
    def get(self):
        labels = 'Approved', 'Rejected'
        approved_count = db.session.query(func.count(Mybooks.id)).filter(Mybooks.status == 'Approved').scalar()
        rejected_count = db.session.query(func.count(Mybooks.id)).filter(Mybooks.status == 'Rejected').scalar()
        sizes = [approved_count, rejected_count]
        fig, ax = plt.subplots()
        ax.pie(sizes, labels=labels, autopct='%1.1f%%', shadow=True, startangle=90)
        ax.axis('equal')

        img = BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close(fig)
        return send_file(img, mimetype='image/png')

class UsersApprovedBooksChart(Resource):
    def get(self):
        users_approved_books = db.session.query(
            User.username,
            func.count(Mybooks.id).label('approved_count')
        ).join(Mybooks, User.id == Mybooks.user_id).filter(Mybooks.status == 'Approved').group_by(User.id).all()

        usernames = [user.username for user in users_approved_books]
        approved_counts = [user.approved_count for user in users_approved_books]

        fig, ax = plt.subplots()
        ax.bar(usernames, approved_counts)
        ax.set_xlabel('Users')
        ax.set_ylabel('Number of Approved Books')
        ax.set_title('Number of Approved Books per User')

        img = BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close(fig)
        return send_file(img, mimetype='image/png')


api.add_resource(ServePDFResource, '/uploads/<filename>')
api.add_resource(StatusPieChart, '/admin/stats/status_pie_chart')
api.add_resource(UsersApprovedBooksChart, '/admin/stats/users_approved_books_chart')
api.add_resource(BookList, '/books')
api.add_resource(BookCreate, '/books/create')
api.add_resource(BookUpdate, '/books/update/<int:book_id>')
api.add_resource(BookDelete, '/books/delete/<int:book_id>')
api.add_resource(MyBooks, '/mybooks', '/mybooks/<int:id>')
api.add_resource(MyBooks_admin, '/mybooksadm', '/mybooksadm/<int:id>')
api.add_resource(MyBooks_admin_issue_book, '/mybooksib')
api.add_resource(MyBooks_user, '/mybooksuser')
api.add_resource(Sections,'/sections')
api.add_resource(Section_CRUD,'/sections/<int:section_id>')
api.add_resource(BookResource,'/book')
api.add_resource(BookCount,'/bookcount')
api.add_resource(FeedBack,'/feedback/<int:id>')