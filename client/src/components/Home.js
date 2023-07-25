import React from "react"

export default function Home(props){

    const [message, setMessage] = React.useState(
        {'msg':''})
    const [allMessage, setAllMessage] = React.useState([])

    function handleClick(e){
        e.preventDefault()
        setAllMessage(prevAllMessage => {
            return allMessage.length === 0? [message] : [...prevAllMessage,message]
        })
        setMessage({'msg':''})
    } 

    function handleChange(e){
        e.preventDefault()
        setMessage({'msg':e.target.value})
    }

    // makes all the messages into html code that can be displayed
    const listOfMessage = allMessage.map(currMessage => {
        return <p>{props.name}: {currMessage.msg}</p>
    })

    return ( <div>
        <form>
            <h1>Hello {props.name}</h1>
            <p>input text</p>
            <input type="text" value={message.msg} onChange={handleChange}></input>
            <button onClick={handleClick}>send</button>
        </form>
        <h3>{listOfMessage}</h3>
    </div>)
}