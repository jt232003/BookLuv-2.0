from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin,RoleMixin
from datetime import datetime

db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('User.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('Role.id'))

class User(db.Model,UserMixin):
    __tablename__ = "User"
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(50), unique = True)
    email = db.Column(db.String, unique = True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255),unique=True,nullable=False)
    
    #relationship
    carts = db.relationship('Mybooks', backref='User', lazy=True)
    feedbacks = db.relationship('Feedback', backref='User', lazy=True)
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('users', lazy='dynamic'))

class Role(db.Model,RoleMixin):
    __tablename__ = "Role"
    id = db.Column(db.Integer(),primary_key = True)
    name = db.Column(db.String(80),unique = True)
    description = db.Column(db.String(255))

class Book(db.Model):
    __tablename__ = "Book"
    id = db.Column(db.Integer, primary_key = True)
    book_name = db.Column(db.String(20), nullable = False)
    section_id = db.Column(db.Integer, db.ForeignKey('Section.id'), nullable = False)
    content = db.Column(db.String(20), nullable = False)
    author = db.Column(db.String(20), nullable = False)
    is_approved = db.Column(db.Boolean(), default=False)
    pdf_path = db.Column(db.String(255), nullable = False,default='No path found')

    #relationship
    carts = db.relationship('Mybooks', backref='Book', lazy=True)

class Section(db.Model):
    __tablename__ = "Section"
    id = db.Column(db.Integer, primary_key = True)
    section_name = db.Column(db.String(50), nullable = False)
    date_created = db.Column(db.Date, nullable = False)
    description = db.Column(db.String(50), nullable = False)

    # relationship
    books = db.relationship('Book', backref='Section', lazy=True)

class Mybooks(db.Model):
    __tablename__ = "Mybooks"
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable = False)
    book_id = db.Column(db.Integer, db.ForeignKey('Book.id'), nullable = False)
    issue_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    return_date = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default="Pending")

class Feedback(db.Model):
    __tablename__ = "Feedback"
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable = False)
    book_id = db.Column(db.Integer, db.ForeignKey('Book.id'), nullable = False)
    feedback = db.Column(db.String(200))