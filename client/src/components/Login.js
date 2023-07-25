import React from 'react'

export default function Login(props){

    const [local, setLocal] = React.useState('')


    function handleChange(e){
        e.preventDefault()
        setLocal(e.target.value)
    }

    function handleClick(e){
        e.preventDefault()
        props.func(local)
    }

    return (
        <div>
            <form>
                    <p>Enter user name:</p>
                    <input type="text" onChange={handleChange}></input>
                    <button onClick={handleClick}>login</button>
            </form>
        </div>
    )
}