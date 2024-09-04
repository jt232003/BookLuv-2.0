export default{
    template:`<div class='d-flex justify-content-center' v-if="role=='admin'" style="margin-top: 10vh"><h3>Add Section</h3>
    <div class="mb-3 p-5 bg-light">
    <label for="section_name" class="form-label">Section Name: </label>
    <input type="text" placeholder="section name" v-model="resource.section_name"/>
    <label for="description" class="form-label">Description: </label>
    <input type="text" placeholder="description" v-model="resource.description" />
    <button class="btn btn-primary mt-2" @click="createSection"> Create Section</button>
  </div>
  </div>`
  ,

  data() {
    return {
      resource: {
        section_name: null,
        description: null,
      },
      token: localStorage.getItem('auth-token'),
      role:localStorage.getItem('role'),
    }
  },

  methods: {
    async createSection() {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Authentication-Token': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.resource),
      })

      const data = await res.json()
      if (res.ok) {
        alert(data.message)
        this.$router.push({path:'/'})
      }
    },
  },
}


