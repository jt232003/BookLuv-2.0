// export default {
//   template: `
//     <div class="container mt-5">
//       <h3>Welcome User</h3><br>
//       <h5>Books Remaining : {{ (book_count-5)*-1 }}</h5>
//       <div v-for="section in sections" :key="section.id">
//         <div class="row mb-4 text-center">
//           <div class="col">
//             <h3 class="category-title">{{ section.section_name }}</h3>
//           </div>
//         </div>
//         <div class="row">
//           <div class="col-md-4 mb-4" v-for="book in getBooksBySection(section.id)" :key="book.id">
//             <div class="card book-card">
//               <div class="card-body">
//                 <h5 class="card-title">{{ book.book_name }}</h5>
//                 <p class="card-text">
//                   <strong>Book content:</strong> {{ book.content }}<br>
//                   <strong>Author:</strong> {{ book.author }}
//                 </p>
//                 <button class="btn btn-warning btn-sm" @click="viewFeedback(book.id)">View Feedback</button>
//                 <div v-if="feedback[book.id]">
//                 <div v-for="item in feedback[book.id]" :key="item.id">
//                   {{ item.feedback }}
//                 </div>
//               </div>
//                 <div class="mt-3">
//                 <div v-if="book_count<=4">
//                   <button class="btn btn-success btn-sm" @click="requestBook(book)">Request Issue</button><br><br>
//                 </div>
//                   <strong>Return date:</strong>
//                   <input type="date" v-model="returnDates[book.id]" required class="form-control mt-2" placeholder="Return Date">
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <link rel="stylesheet" href="main.css">
//     </div>
//   `,
//   data() {
//     return {
//       books: [],
//       sections: [],
//       returnDates: {},
//       token: localStorage.getItem('auth-token'),
//       book_count: null,
//       feedback:{},
//     };
//   },
//   async mounted() {
//     await this.fetchSections();
//     await this.fetchBooks();
//     await this.bookCount();
//   },
//   methods: {
//     async fetchSections() {
//       try {
//         const res = await fetch('/api/sections', {
//           headers: {
//             'Authentication-Token': this.token,
//           },
//         });
//         if (!res.ok) {
//           throw new Error('Failed to fetch sections');
//         }
//         const data = await res.json();
//         this.sections = data;
//       } catch (error) {
//         console.error('Error fetching sections:', error);
//       }
//     },
//     async fetchBooks() {
//       try {
//         const res = await fetch('/api/book', {
//           headers: {
//             'Authentication-Token': this.token,
//           },
//         });
//         if (!res.ok) {
//           throw new Error('Failed to fetch books');
//         }
//         const data = await res.json();
//         this.books = data;
//         // console.log(this.books)
//       } catch (error) {
//         console.error('Error fetching books:', error);
//       }
//     },
//     getBooksBySection(sectionId) {
//       return this.books.filter(book => book.section_id === sectionId);
//     },
//     async requestBook(book) {
//       const returnDate = this.returnDates[book.id];
//         if (!returnDate) {
//         alert("Specify return date");
//         return;
//       }

//       if (this.book_count >= 5) {
//         alert("You can request a maximum of 5 books only.");
//         return;
//       }

//       try {
//         const res = await fetch('/api/mybooks', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authentication-Token': this.token,
//           },
//           body: JSON.stringify({
//             book_id: book.id,
//             return_date: returnDate,
//           }),
//         });
//         const data = await res.json();
//         alert(data.message)
//         if (!res.ok) {
//           throw new Error(data.message || 'Failed to request book');
//         }
//         console.log('Book requested:', data);
//         await this.bookCount(); // Update the book count after requesting a book
//       } catch (error) {
//         console.error('Error requesting book:', error);
//       }
//     },
//     async bookCount() {
//       try {
//         const res = await fetch('/api/bookcount', {
//           headers: {
//             'Authentication-Token': this.token,
//           },
//         });
//         if (!res.ok) {
//           throw new Error('Failed to fetch');
//         }
//         const data = await res.json();
//         this.book_count = data;
//       } catch (error) {
//         console.error('Error fetching:', error);
//       }
//     },
//     async viewFeedback(id) {
//       try {
//         const res = await fetch('/api/feedback/'+id, {
//           headers: {
//             'Authentication-Token': this.token,
//           },
//         });
//         if (!res.ok) {
//           throw new Error('Failed to fetch');
//         }
//         const data = await res.json();
//         this.$set(this.feedback, id, data);
//         console.log(data)
//       } catch (error) {
//         console.error('Error fetching:', error);
//       }
//     }, 
//   },
//   created() {
//     this.status = localStorage.getItem('status');
//     if (this.status == 0) {
//       location.reload();
//       localStorage.setItem('status', 1);
//     }
//   }
// };


export default {
  template: `
    <div class="container mt-5">
      <h3>Welcome User</h3><br>
      <h5>Books Remaining : {{ (book_count-5)*-1 }}</h5>
      <div class="row mb-4">
        <div class="col">
          <select v-model="searchCriterion" class="form-control">
            <option value="book_name">Book Name</option>
            <option value="section_name">Section Name</option>
            <option value="author">Author</option>
          </select>
        </div>
        <div class="col">
          <input
            type="text"
            v-model="searchQuery"
            class="form-control"
            placeholder="Enter search text"
          />
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" @click="filterBooks">Search</button>
        </div>
      </div>
      <div v-for="section in filteredSections" :key="section.id">
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
                <button class="btn btn-warning btn-sm" @click="viewFeedback(book.id)">View Feedback</button>
                <div v-if="feedback[book.id]">
                  <div v-for="item in feedback[book.id]" :key="item.id">
                    {{ item.feedback }}
                  </div>
                </div>
                <div class="mt-3">
                  <div v-if="book_count <= 4">
                    <button class="btn btn-success btn-sm" @click="requestBook(book)">Request Issue</button><br><br>
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
      returnDates: {},
      token: localStorage.getItem('auth-token'),
      book_count: null,
      feedback: {},
      searchQuery: '',
      searchCriterion: 'book_name',
      filteredBooks: [],
    };
  },
  async mounted() {
    await this.fetchSections();
    await this.fetchBooks();
    await this.bookCount();
  },
  computed: {
    filteredSections() {
      if (!this.searchQuery) {
        return this.sections;
      }
      const lowerSearchQuery = this.searchQuery.toLowerCase();
      return this.sections.filter(section =>
        this.getBooksBySection(section.id).length > 0 ||
        (this.searchCriterion === 'section_name' && section.section_name.toLowerCase().includes(lowerSearchQuery))
      );
    },
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
      return this.filteredBooks.length
        ? this.filteredBooks.filter(book => book.section_id === sectionId)
        : this.books.filter(book => book.section_id === sectionId);
    },
    isBookMatchSearch(book) {
      const lowerSearchQuery = this.searchQuery.toLowerCase();
      if (this.searchCriterion === 'book_name') {
        return book.book_name.toLowerCase().includes(lowerSearchQuery);
      } else if (this.searchCriterion === 'author') {
        return book.author.toLowerCase().includes(lowerSearchQuery);
      } else if (this.searchCriterion === 'section_name') {
        const section = this.sections.find(section => section.id === book.section_id);
        return section ? section.section_name.toLowerCase().includes(lowerSearchQuery) : false;
      }
      return false;
    },
    async requestBook(book) {
      const returnDate = this.returnDates[book.id];
      // console.log(returnDate)
      // console.log(book.id)
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
        alert(data.message);
        if (!res.ok) {
          throw new Error(data.message || 'Failed to request book');
        }
        console.log('Book requested:', data);
        await this.bookCount(); // Update the book count after requesting a book
      } catch (error) {
        console.error('Error requesting book:', error);
      }
    },
    async bookCount() {
      try {
        const res = await fetch('/api/bookcount', {
          headers: {
            'Authentication-Token': this.token,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await res.json();
        this.book_count = data;
      } catch (error) {
        console.error('Error fetching:', error);
      }
    },
    async viewFeedback(id) {
      try {
        const res = await fetch('/api/feedback/' + id, {
          headers: {
            'Authentication-Token': this.token,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await res.json();
        this.$set(this.feedback, id, data);
        console.log(data);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    },
    filterBooks() {
      if (!this.searchQuery) {
        this.filteredBooks = [];
        return;
      }
      const lowerSearchQuery = this.searchQuery.toLowerCase();
      this.filteredBooks = this.books.filter(book =>
        this.isBookMatchSearch(book)
      );
    },
  },
  created() {
    this.status = localStorage.getItem('status');
    if (this.status == 0) {
      // location.reload();
      localStorage.setItem('status', 1);
    }
  }
};





  
  
  
  
  

