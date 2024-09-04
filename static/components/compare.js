export default {
    template: `
      <div class="container mt-5">
        <h3>Welcome User</h3><br>
        <h5>Books Remaining: {{ 5 - book_count }}</h5>
        <div v-for="section in sections" :key="section.id">
          <div class="row mb-4 text-center">
            <div class="col">
              <h3 class="category-title">{{ section.section_name }}</h3>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-4" v-for="book in getBooksBySection(section.id)" :key="book.id">
              <div class="card book-card">
                <div class="card-body">
                  <h5 class="card-title">{{ book.book_name }}</h5>
                  <p class="card-text">
                    <strong>Book content:</strong> {{ book.content }}<br>
                    <strong>Author:</strong> {{ book.author }}
                  </p>
                  <a href="#" class="card-link">View feedback</a>
                  <div class="mt-3">
                    <div v-if="book_count < 5">
                      <button class="btn btn-warning btn-sm" @click="requestBook(book)">Request Issue</button><br><br>
                    </div>
                    <strong>Return date:</strong>
                    <input type="date" v-model="returnDates[book.id]" required class="form-control mt-2" placeholder="Return Date">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <link rel="stylesheet" href="main.css">
      </div>
    `,
    data() {
      return {
        books: [],
        sections: [],
        returnDates: {}, // Object to hold return dates for each book
        token: localStorage.getItem('auth-token'),
        book_count: 0,
      };
    },
    async mounted() {
      await this.fetchSections();
      await this.fetchBooks();
      await this.fetchBookCount();
    },
    methods: {
      async fetchSections() {
        try {
          const res = await fetch('/api/sections', {
            headers: {
              'Authentication-Token': this.token,
            },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch sections');
          }
          const data = await res.json();
          this.sections = data;
        } catch (error) {
          console.error('Error fetching sections:', error);
        }
      },
      async fetchBooks() {
        try {
          const res = await fetch('/api/book', {
            headers: {
              'Authentication-Token': this.token,
            },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch books');
          }
          const data = await res.json();
          this.books = data;
        } catch (error) {
          console.error('Error fetching books:', error);
        }
      },
      getBooksBySection(sectionId) {
        return this.books.filter(book => book.section_id === sectionId);
      },
      async requestBook(book) {
        const returnDate = this.returnDates[book.id];
        if (!returnDate) {
          alert("Specify return date");
          return;
        }
  
        if (this.book_count >= 5) {
          alert("You can request a maximum of 5 books only.");
          return;
        }
  
        try {
          const res = await fetch('/api/mybooks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
            },
            body: JSON.stringify({
              book_id: book.id,
              return_date: returnDate,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Failed to request book');
          }
          console.log('Book requested:', data);
          await this.fetchBookCount(); // Update the book count after requesting a book
        } catch (error) {
          console.error('Error requesting book:', error);
        }
      },
      async fetchBookCount() {
        try {
          const res = await fetch('/api/bookcount', {
            headers: {
              'Authentication-Token': this.token,
            },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch book count');
          }
          const data = await res.json();
          console.log('Book count fetched:', data);
          this.book_count = data.book_count;
        } catch (error) {
          console.error('Error fetching book count:', error);
        }
      },
    },
    created() {
      this.status = localStorage.getItem('status');
      if (this.status == 0) {
        location.reload();
        localStorage.setItem('status', 1);
      }
    }
  };
  