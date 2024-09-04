// console.log("Hello world")
import router from './router.js'
import navbar from './components/navbar.js'

//doubt
router.beforeEach((to, from, next) => {
    const publicPages = ['Login', 'Registration'];
    const authToken = localStorage.getItem('auth-token');
    
    if (!authToken && !publicPages.includes(to.name)) {
      // Redirect to Login or Registration based on the condition
      if (to.name === 'Login') {
        next({ name: 'Login' });
      } else {
        next({ name: 'Registration' });
      }
    } else {
      next();
    }
  });

  router.beforeEach((to, from, next) => {
    const userPages = ['Home','mybooks'];
    const role = localStorage.getItem('role');
    
    if (role == 'user' && !userPages.includes(to.name)) {
      // Redirect to Login or Registration based on the condition
      if (to.name === 'Home') {
        next({ name: 'Home' });
      } else {
        next({ name: 'mybooks' });
      }
    } else {
      next();
    }
  });

// router.beforeEach((to, from, next) => {
//   const publicPages = ['Login', 'Registration'];
//   const authRole = localStorage.getItem('role');
  
//   if (!authRole && !publicPages.includes(to.name)) {
//     // User not authenticated and trying to access a restricted page
//     next({ name: 'Login' }); // Redirect to Login page
//   } else if (authRole === 'admin' || authRole === 'user') {
//     // User authenticated with 'admin' or 'user' role
//     if (authRole === 'admin' && !['admin_stats'].includes(to.name)) {
//       // Admin role can access AdminStats
//       next({ name: 'Home' }); // Redirect to Home if not allowed
//     } else {
//       next(); // Allow navigation
//     }
//   } else {
//     next(); // Allow navigation for public pages and authenticated but no specific role
//   }
// });

new Vue({
  el: '#app',
  template: `<div>
  <navbar :key='has_changed'/>
  <router-view /></div>`,
  router,
  components: {
    navbar,
  },
  data: {
    has_changed: true,
  },
  watch: {
    $route(to, from) {
      this.has_changed = !this.has_changed
    },
  },
})