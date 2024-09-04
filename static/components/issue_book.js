export default {
    template: `
      <div class="container mt-5" v-if="this.role=='admin'">
        <h2>Manage Book Requests</h2>
        <div class="row">
          <div class="col-md-12 mb-4" v-for="request in bookRequests" :key="request.id">
            <div class="card book-card">
              <div class="card-body">
                <h5 class="card-title">{{ request.book_name }}</h5>
                <p class="card-text">
                  <strong>User Name:</strong> {{ request.username }}<br>
                  <strong>Issue Date:</strong> {{ request.issue_date }}<br>
                  <strong>Return Date:</strong> {{ request.return_date }}<br>
                  <strong>Status:</strong> {{ request.status }}
                </p>
                <button class="btn btn-success btn-sm" @click="updateRequestStatus(request.id, 'Approved')">Approve</button>
                <button class="btn btn-danger btn-sm" @click="updateRequestStatus(request.id, 'Rejected')">Reject</button>
              </div>
            </div>
          </div>
        </div>
        <h2>Manage Book Access</h2>
        <div class="row">
          <div class="col-md-12 mb-4" v-for="request in bookApproved" :key="request.id">
            <div class="card book-card">
              <div class="card-body">
                <h5 class="card-title">{{ request.book_name }}</h5>
                <p class="card-text">
                  <strong>User Name:</strong> {{ request.username }}<br>
                  <strong>Issue Date:</strong> {{ request.issue_date }}<br>
                  <strong>Return Date:</strong> {{ request.return_date }}<br>
                  <strong>Status:</strong> {{ request.status }}
                </p>
                <button class="btn btn-danger btn-sm" @click="revokeAccess(request.id)">Revoke Access</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        bookRequests: [],
        bookApproved: [],
        token: localStorage.getItem('auth-token'),
        role:localStorage.getItem('role'),
      };
    },
    async mounted() {
      await this.fetchBookRequests();
      await this.fetchApprovedBookRequests();
    },
    methods: {
      async fetchBookRequests() {
        try {
          const res = await fetch('/api/mybooksadm', {
            headers: {
              'Authentication-Token': this.token,
            },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch book requests');
          }
          const data = await res.json();
          this.bookRequests = data;
        } catch (error) {
          console.error('Error fetching book requests:', error);
        }
      },
      async fetchApprovedBookRequests() {
        try {
          const res = await fetch('/api/mybooksib', {
            headers: {
              'Authentication-Token': this.token,
            },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch book requests');
          }
          const data = await res.json();
          this.bookApproved = data;
        //   location.reload();
        } catch (error) {
          console.error('Error fetching book requests:', error);
        }
      },
      async updateRequestStatus(id, status) {
        try {
          const res = await fetch(`/api/mybooksadm/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.token,
            },
            body: JSON.stringify({ status }),
          });
          const data = await res.json();
          if (res.ok) {
            await this.fetchApprovedBookRequests();
            await this.fetchBookRequests();
            console.log('Request updated:', data);
          }
          else{
            throw new Error(data.message || 'Failed to update request status');
          }
        } catch (error) {
          console.error('Error updating request status:', error);
        }
      },
      async revokeAccess(id) {
        let con = confirm("Are you going to revoke access?");
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
            await this.fetchApprovedBookRequests();
            await this.fetchBookRequests();
            // this.bookApproved = this.bookApproved.filter(book => book.id !== id);
        }
      },
    },
  };
  