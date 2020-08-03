import React from 'react'
import classes from './ChatInput.module.css'
import emoji from '../../assets/icons/smile 1.svg';
import send from '../../assets/icons/SendBtn.svg';
import image from '../../assets/icons/picture 1 (1).svg';

const chatInput = (props: any) => {

    return (
        <form className={classes.ChatInput}>
            <input type="image" alt="" src={emoji}/>
            <input type="text" className={classes.TextInput} placeholder='Type here'/>
            <input type="image" alt="" src={image}/>
            <input type="image" alt="" src={send}/>
        </form>
    )
}

export default chatInput
