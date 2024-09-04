export default {
    template: `
      <div class="container mt-5" v-if="role=='admin'">
        <h3>Admin Stats</h3>
        <div v-if="showCharts">
          <div class="chart-container">
            <h4>Status Pie Chart</h4>
            <img :src="statusPieChart" alt="Status Pie Chart">
          </div>
          <div class="chart-container">
            <h4>Users Approved Books Chart</h4>
            <img :src="usersApprovedBooksChart" alt="Users Approved Books Chart">
          </div>
        </div>
        <div v-else>
          <p>Loading charts, please wait...</p>
        </div>
      </div>
    `,
    data() {
      return {
        showCharts: false,
        statusPieChart: '',
        usersApprovedBooksChart: '',
        role:localStorage.getItem('role'),
      };
    },
    async mounted() {
      setTimeout(async () => {
        await this.fetchChartData();
        this.showCharts = true;
      }, 5000); // Delay loading by 5000 milliseconds (5 seconds)
    },
    methods: {
      async fetchChartData() {
        try {
          this.statusPieChart = await this.fetchChart('/api/admin/stats/status_pie_chart');
          this.usersApprovedBooksChart = await this.fetchChart('/api/admin/stats/users_approved_books_chart');
        } catch (error) {
          console.error('Error fetching chart data:', error);
        }
      },
      async fetchChart(url) {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Failed to fetch chart');
        }
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    }
  };
  