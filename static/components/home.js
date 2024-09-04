import adminhome from './adminhome.js'
import userhome from './userhome.js'

export default{
    template:`<div>
    <userhome v-if="userRole=='user'"/>
    <adminhome v-if="userRole=='admin'"/></div>`,
    data(){
        return{
            userRole:localStorage.getItem('role'),
        }
    },
    components:{
        adminhome,
        userhome,
    }
}