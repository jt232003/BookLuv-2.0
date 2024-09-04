export default {
    template: `
      <div class='d-flex justify-content-center' style="margin-top: 10vh">
        <h3>Welcome admin</h3>
        <div class="mb-3 p-5 bg-light">
        <h4>Section Management</h4>
          <table border="1px">
            <tr>
              <th>Section ID</th>
              <th>Section Name</th>
              <th>Date Created</th>
              <th>Description</th>
              <th>Edit/Delete</th>
            </tr>
            <tr v-for="section in view_section" :key="section.id">
              <td>{{ section.id }}</td>
              <td>{{ section.section_name }}</td>
              <td>{{ section.date_created }}</td>
              <td>{{ section.description }}</td>
              <td>
                <button class="btn btn-warning btn-sm" @click="editSection(section)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="deleteSection(section.id)">Delete</button>
              </td>
            </tr>
          </table>
          <button class="btn btn-success btn-sm">
            <router-link class="text-white" :to="'/sections'">ADD SECTION</router-link>
          </button>
  
          <div v-if="editingSection" class="edit-section mt-4">
            <h4>Edit Section</h4>
            <div class="form-group">
              <label for="sectionName">Section Name</label>
              <input type="text" v-model="editingSection.section_name" class="form-control" id="sectionName">
            </div>
            <div class="form-group">
              <label for="sectionDescription">Description</label>
              <input type="text" v-model="editingSection.description" class="form-control" id="sectionDescription">
            </div>
            <button class="btn btn-primary btn-sm" @click="saveSection">Save</button>
            <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
          </div>
          <button class="btn btn-primary mt-2" @click="download">Download CSV File</button><span v-if='isWaiting'>Waiting...</span>
        </div>
      </div>
    `,
    data() {
      return {
        view_section: [],
        editingSection: null,
        token: localStorage.getItem('auth-token'),
        isWaiting:false,
      }
    },
    async mounted() {
      const res = await fetch('/api/sections', {
        method: 'GET',
        headers: {
          'Authentication-Token': this.token
        },
      });
      const data = await res.json().catch((e) => {});
      if (res.ok) {
        this.view_section = data;
      }
    },
    methods: {
      async deleteSection(section_id) {
        let con = confirm("Are you going to delete this section?");
        if (!con) {
          return;
        }
        const res = await fetch('/api/sections/' + section_id, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
            'Authentication-Token': this.token,
          },
        });
        const data = await res.json().catch((e) => {});
        if (res.ok) {
          this.view_section = this.view_section.filter(section => section.id !== section_id);
        }
        else{
          alert(data.message)
        }
      },
      editSection(section) {
        this.editingSection = { ...section };
      },
      async saveSection() {
        const res = await fetch('/api/sections/' + this.editingSection.id, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(this.editingSection)
        });
        const data = await res.json().catch((e) => {});
        if (res.ok) {
          this.view_section = this.view_section.map(section =>
            section.id === this.editingSection.id ? this.editingSection : section
          );
          this.editingSection = null;
        }
      },
      cancelEdit() {
        this.editingSection = null;
      },
      async download(){
        this.isWaiting=true
        const res = await fetch('/download-csv')
        const data = await res.json()
        if (res.ok){
          const taskId = data['task-id']
          const intv = setInterval(async()=>{
            const csv_res = await fetch(`/get-csv/${taskId}`)
            if (csv_res.ok){
              this.isWaiting=false
              clearInterval(intv)
              window.location.href = `/get-csv/${taskId}`
            }
          }, 1000)
        }
      },
    },
    
    created(){
      this.status = localStorage.getItem('status')
      if (this.status == 0){
        // location.reload();
        localStorage.setItem('status',1)
      }
      }
  }
  
