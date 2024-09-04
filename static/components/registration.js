export default ({
    template: `
    <div class='d-flex justify-content-center' style="margin-top: 25vh">
    <div class="mb-3 p-5 bg-light">
                <h3>Register </h3>
                <div class="alert alert-danger">*{{error}}</div>
                    <label for="user-name" class="form-label">User Name</label>
                    <input type="text" class="form-control" id="user-name" placeholder="abc"  v-model="cred.username"/>
                    <label for="user-email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email" />
                    <label for="user-password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="user-password" placeholder="***" v-model="cred.password"/>
                    <button class="btn btn-primary mt-2" @click="register">Register</button>
                    <p>Already a member ?</p>
                    <router-link to="/login">Login</router-link>
    </div>
    </div>
    `,
    data(){
        return{
            cred:{
                username:null,
                email:null,
                password:null
            },
            error:null,
        }
    },
    methods: {
        async register() {
            fetch('/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.cred)
                }
            )
                .then(async (res) => {
                    const data = await res.json();
                    if (res.ok) {
                        localStorage.setItem('auth-token', data.token)
                        localStorage.setItem('role', data.role)
                        this.$router.push({path: '/'})
                    } else {
                        this.error = data.message
                    }

                });
        }
    },
})