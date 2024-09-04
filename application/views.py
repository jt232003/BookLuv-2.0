from flask import current_app as app, jsonify, request,render_template, send_file
from flask_security import auth_required, roles_required
from werkzeug.security import check_password_hash,generate_password_hash
from flask_restful import marshal, fields
from .models import db,User,Book,Mybooks,Feedback,Role,Section
from application.sec import datastore
from .tasks import create_resource_csv
import flask_excel as excel
from celery.result import AsyncResult

@app.get('/')
def home():
    return render_template('index.html')

@app.get('/admin')
@auth_required("token")
@roles_required('admin')
def admin():
    return "welcome admin"

@app.get('/user')
@auth_required("token")
@roles_required('user')
def user():
    return "welcome user"

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message":"email not provided"}), 400
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message":"email not provided"}), 404
    if check_password_hash(user.password,data.get('password')):
        return jsonify({"token":user.get_auth_token(),"email":user.email,"role":user.roles[0].name}), 201
    else:
        return jsonify({"message":"wrong password"}), 400
    
@app.post('/register')
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    if not email:
        return jsonify({"message": "email not provided"}), 400

    if not username:
        return jsonify({"message": "username not provided"}), 400

    if not password:
        return jsonify({"message": "password not provided"}), 400

    user_exists = User.query.filter_by(email=email).count()
    if(user_exists):
        return {"message":"Email already taken, use another email"},401
    user = datastore.create_user(email=email, username=username, password=generate_password_hash(password), active=True,
                                 roles=["user"])

    db.session.add(user)

    db.session.commit()
    return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name}),201

user_fields={
    "id":fields.Integer,
    "email":fields.String,
    "active":fields.Boolean
}


@app.get('/download-csv')
def download_csv():
    task = create_resource_csv.delay()
    return jsonify({"task-id":task.id})

@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404
