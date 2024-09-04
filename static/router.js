import home from "./components/home.js"
import login from "./components/login.js"
import registration from "./components/registration.js"
import add_section from "./components/add_section.js"
import add_book from "./components/add_book.js"
import books from "./components/books.js"
import issue_book from "./components/issue_book.js"
import mybooks from "./components/mybooks.js"
import admin_stats from "./components/admin_stats.js"

const routes = [
    {path:'/',component:home,name:'Home'},
    {path:'/login',component:login,name:'Login'},
    {path:'/register',component:registration,name:'Registration'},
    {path:'/sections',component:add_section,name:'add_section'},
    {path:'/book',component:add_book,name:'add_book'},
    {path:'/books',component:books,name:'books'},
    {path:'/issue_book',component:issue_book,name:'issue_book'},
    {path:'/mybooks',component:mybooks,name:'mybooks'},
    {path:'/admin_stats',component:admin_stats,name:'admin_stats'},
]


export default new VueRouter({
    routes,
})

