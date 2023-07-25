import React from "react"
import Home from "./components/Home"
import Login from './components/Login.js'

export default function App(){
    const [user,setUser] = React.useState('')

    function handleChild(userValue){
        setUser(userValue)
    }

    return ( 
        <div>
        {user?<Home name={user}/>:<Login func={handleChild}/>}
        </div>
    )
}