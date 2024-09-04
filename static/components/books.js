export default {
  template: `
    <div class='d-flex justify-content-center' v-if="this.role=='admin'" style="margin-top: 10vh">
      <div class="mb-3 p-5 bg-light">
      <h3>Books Management</h3>
        <table border="1px">
          <tr>
            <th>Book ID</th>
            <th>Book Name</th>
            <th>Section Name</th>
            <th>Content</th>
            <th>Author</th>
            <th>PDF Path</th>
            <th>Open/Edit/Delete</th>
          </tr>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.id }}</td>
            <td>{{ book.book_name }}</td>
            <td>{{ getSectionName(book.section_id) }}</td>
            <td>{{ book.content }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.pdf_path }}</td>
            <td>
              <button class="btn btn-success btn-sm" @click="openBook(book.pdf_path)">Open</button>
              <button class="btn btn-warning btn-sm" @click="editBook(book)">Edit</button>
              <button class="btn btn-danger btn-sm" @click="deleteBook(book.id)">Delete</button>
            </td>
          </tr>
        </table>
        <button class="btn btn-success btn-sm">
          <router-link class="text-white" :to="'/book'">ADD BOOK</router-link>
        </button>

        <div v-if="editingBook" class="edit-book mt-4">
          <h4>{{ editingBook.id ? 'Edit Book' : 'Create Book' }}</h4>
          <div class="form-group">
            <label for="bookName">Book Name</label>
            <input type="text" v-model="editingBook.book_name" class="form-control" id="bookName">
          </div>
          <div class="form-group">
            <label for="sectionId">Section</label>
            <select v-model="editingBook.section_id" class="form-control" id="sectionId">
              <option v-for="section in sections" :key="section.id" :value="section.id">{{ section.section_name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="content">Content</label>
            <input type="text" v-model="editingBook.content" class="form-control" id="content">
          </div>
          <div class="form-group">
            <label for="author">Author</label>
            <input type="text" v-model="editingBook.author" class="form-control" id="author">
          </div>
          <button class="btn btn-primary btn-sm" @click="saveBook">{{ editingBook.id ? 'Save' : 'Create' }}</button>
          <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      books: [],
      sections: [],
      editingBook: null,
      token: localStorage.getItem('auth-token'),
      role: localStorage.getItem('role'),
    };
  },
  async mounted() {
    await this.fetchSections();
    await this.fetchBooks();
  },
  methods: {
    async fetchSections() {
      const res = await fetch('/api/sections', {
        headers: {
          'Authentication-Token': this.token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        this.sections = data;
      } else {
        console.error('Error fetching sections:', data);
      }
    },
    async fetchBooks() {
      const res = await fetch('/api/books', {
        headers: {
          'Authentication-Token': this.token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        this.books = data;
      } else {
        console.error('Error fetching books:', data);
      }
    },
    getSectionName(section_id) {
      const section = this.sections.find(section => section.id === section_id);
      return section ? section.section_name : 'Unknown';
    },
    editBook(book) {
      this.editingBook = { ...book };
    },
    async saveBook() {
      const res = await fetch('/api/books/update/' + this.editingBook.id, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          'Authentication-Token': this.token,
        },
        body: JSON.stringify(this.editingBook)
      });
      const data = await res.json().catch((e) => {});
      if (res.ok) {
        this.books = this.books.map(book =>
          book.id === this.editingBook.id ? this.editingBook : book);
        this.editingBook = null;
      }
    },
    async deleteBook(book_id) {
      let con = confirm("Are you going to delete this book?");
        if (!con) {
          return;
        }
      const res = await fetch(`/api/books/delete/${book_id}`, {
        method: 'DELETE',
        headers: {
          'Authentication-Token': this.token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        this.books = this.books.filter(book => book.id !== book_id);
      } else {
        alert(data.message)
        console.error('Error deleting book:', data);
      }
    },
    cancelEdit() {
      this.editingBook = null;
    },
    // openBook(pdfPath) {
    //   const url = `/api/${pdfPath}`;
    //   window.open(url, '_blank');
    // }
    async openBook(pdfPath) {
      try {
        const res = await fetch(`/api/${pdfPath}`, {
          headers: {
            'Authentication-Token': this.token,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch PDF');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Optionally, revoke the object URL after some time
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 60000); // 1 minute
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    }
  },
};
  
  