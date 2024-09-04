export default {
  template: `
    <div class='d-flex justify-content-center' v-if="this.role=='admin'" style="margin-top: 10vh">
      <h3>Add book</h3>
      <div class="mb-3 p-5 bg-light">
        <label for="book_name" class="form-label">Book Name: </label>
        <input type="text" placeholder="book name" v-model="resource.book_name"/>
        
        <label for="section_id" class="form-label">Section: </label>
        <select name="section_id" id="section_id" v-model="resource.section_id">
          <option v-for="(section, i) in sections" :key="i" :value="section.id">{{section.section_name}}</option>
        </select>
        
        <label for="content" class="form-label">Content: </label>
        <input type="text" placeholder="content" v-model="resource.content" />
        
        <label for="author" class="form-label">Author: </label>
        <input type="text" placeholder="author" v-model="resource.author" />
        
        <label for="pdf_path" class="form-label">PDF Path: </label>
        <input type="file" accept=".pdf" ref="pdfPath" />
        
        <button class="btn btn-primary mt-2" @click="createBook">Create book</button>
      </div>
    </div>
  `,
  data() {
    return {
      resource: {
        book_name: null,
        section_id: null,
        content: null,
        author: null,
      },
      role: localStorage.getItem('role'),
      sections: [],
      token: localStorage.getItem('auth-token'),
    };
  },
  async mounted() {
    const res = await fetch('/api/sections', {
      headers: {
        'Authentication-Token': this.token,
      },
      method: 'GET',
    });
    const data = await res.json();
    if (res.ok) {
      this.sections = data;
    }
  },
  methods: {
    async createBook() {
      const formData = new FormData();
      formData.append('book_name', this.resource.book_name);
      formData.append('section_id', this.resource.section_id);
      formData.append('content', this.resource.content);
      formData.append('author', this.resource.author);
  
      const fileInput = this.$refs.pdfPath;
      if (fileInput.files.length > 0) {
        formData.append('pdf_path', fileInput.files[0]);
        console.log(fileInput.files[0]);  // Debugging line
      } else {
        alert("Please select a PDF file");
        return;
      }
  
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Authentication-Token': this.token,
          // 'Content-Type' is not set to allow the browser to set the correct boundary
        },
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        this.$router.push({ path: '/books' });
      } else {
        alert(data.message || 'Failed to create book');
      }
    },
  }  
};