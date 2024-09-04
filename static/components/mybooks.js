export default {
    template: `
      <div class='d-flex justify-content-center' style="margin-top: 10vh">
        <div class="mb-3 p-5 bg-light">
        <h3>Pending Request</h3>
          <table border="1px">
            <tr>
              <th>Book ID</th>
              <th>Book Name</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
            <tr v-for="book in mybooks" :key="book.id">
              <td>{{ book.book_id }}</td>
              <td>{{ book.book_name }}</td>
              <td>{{ book.issue_date }}</td>
              <td>{{ book.return_date }}</td>
              <td>{{ book.status }}</td>
              <td>
                <button class="btn btn-danger btn-sm" @click="cancelBook(book.id)">cancel</button>
              </td>
            </tr>
          </table>
          </div>
        <div class="mb-3 p-5 bg-light">
        <h3>Approved Books</h3>
          <table border="1px">
            <tr>
              <th>Book ID</th>
              <th>Book Name</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
            <tr v-for="book in approvedBooks" :key="book.id">
              <td>{{ book.book_id }}</td>
              <td>{{ book.book_name }}</td>
              <td>{{ book.issue_date }}</td>
              <td>{{ book.return_date }}</td>
              <td>{{ book.status }}</td>
              <td>
              <button class="btn btn-success btn-sm" @click="openBook(book.pdf_path)">Open</button>
                <button class="btn btn-warning btn-sm" @click="feedbackBook(book.book_id)">Feedback</button>
                <button class="btn btn-danger btn-sm" @click="returnBook(book.id)">Return</button>
              </td>
            </tr>
          </table>
          </div>
        </div>
    `,
    data() {
      return {
        mybooks: [],
        approvedBooks:[],
        token: localStorage.getItem('auth-token'),
        role:localStorage.getItem('role'),
      };
    },
    async mounted() {
      await this.fetchBooks();
      await this.fetchapprovedBooks();
    },
    methods: {
      async fetchBooks() {
        const res = await fetch('/api/mybooks', {
          headers: {
            'Authentication-Token': this.token,
          },
        });
        const data = await res.json();
        if (res.ok) {
          this.mybooks = data;
        } else {
          console.error('Error fetching books:', data);
        }
      },
      async fetchapprovedBooks() {
        const res = await fetch('/api/mybooksuser', {
          headers: {
            'Authentication-Token': this.token,
          },
        });
        const data = await res.json();
        if (res.ok) {
          this.approvedBooks = data;
          // console.log(data)
        } else {
          console.error('Error fetching books:', data);
        }
      },
      getSectionName(section_id) {
        const section = this.sections.find(section => section.id === section_id);
        return section ? section.section_name : 'Unknown';
      },
      
      async cancelBook(book_id) {
        const res = await fetch(`/api/mybooks/`+book_id, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.token,
          },
        });
        const data = await res.json();
        if (res.ok) {
          this.mybooks = this.mybooks.filter(book => book.id !== book_id);
        } else {
          console.error('Error deleting book:', data);
        }
      },
      async returnBook(id) {
        let con = confirm("Do you want to return the book?");
        if (!con) {
          return;
        }
        const res = await fetch('/api/mybooks/' + id, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
            'Authentication-Token': this.token,
          },
        });
        const data = await res.json().catch((e) => {});
        if (res.ok) {
          await this.fetchapprovedBooks();
            // this.approvedbooks = this.approvedBooks.filter(book => book.id !== id);
            // for(let i=0;i<=1;i++){
            //   location.reload();
            // }
        }
      },
      async feedbackBook(id){
        try{
        let feed = prompt('Type your feedback here!')
        let feedback = feed.toString()

        const res = await fetch('api/feedback/' + id,{
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            book_id: id,
            feedback: feedback,
          }),
        });
        const data = await res.json();
        alert(data.message)
        }catch (error) {
        console.error('Error :', error);
      }
      },
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

  