export default{
    template:`<div class='d-flex justify-content-center' style="margin-top: 25vh">
        <div class="mb-3 p-5 bg-light">
        <h3>Login </h3>
        <div class='text-danger'>*{{error}}</div>
        <label for="user-email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
        <label for="user-password" class="form-label">Password</label>
        <input type="password" class="form-control" id="user-password" v-model="cred.password">
        <button class="btn btn-primary mt-2" @click='login' > Login </button>
        <p>Not a member ?</p>
        <router-link to="/register">Register Here</router-link>
    </div> 
  </div>`,
  data(){
    return {
        cred:{
            email:null,
            password:null,
        },
        error:null,
    }
  },
  methods:{
    async login(){
        const res = await fetch('/user-login',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify(this.cred)
        })
        const data = await res.json()
        if(res.ok){
            localStorage.setItem('auth-token',data.token)
            localStorage.setItem('role',data.role)
            localStorage.setItem('status',0)
            this.$router.push({path:'/'})
        }
        else{
            this.error = data.message
        }
    },
  },
  created(){
    this.status = localStorage.getItem('status')
    if (this.status == 1){
    // location.reload()
      localStorage.setItem('status',0)
    }
    }
}