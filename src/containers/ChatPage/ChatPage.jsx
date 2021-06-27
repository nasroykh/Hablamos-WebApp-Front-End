import React, { useEffect, useRef, useState } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import classes from './ChatPage.module.scss';
import {ReactComponent as FileIcon} from '../../assets/file-icon.svg';
import NavBar from '../../components/NavBar/NavBar';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import Messages from '../../components/Messages/Messages';
import Button from '../../elements/Button/Button';
import BackDrop from '../../elements/BackDrop/BackDrop';
import FormInput from '../../elements/FormInput/FormInput';
import {userActions} from '../../store/user/user-slice';
import {fetchMessages, sendMessage, sendFile} from '../../store/user/user-actions';
import { socket } from '../../App';


const ChatPage = (props) => {

    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();

    const messageInput = useRef();

    let conv = useSelector(state => state.user.selectedConv);
    let userId = useSelector(state => state.user._id);

    const [convId, setConvId] = useState('');
    const [friendId, setFriendId] = useState('');
    const [selectedFile, setSelectedFile] = useState('');

    useEffect(() => {
        if ((!conv.messages && conv._id) || conv.new ) {
            history.push(`/chat?_id=${conv._id}`)
        }
    }, [conv, history])

    useEffect(() => {
        let query = location.search;
        query = query.replace('?', '').split('=');

        
        let _id = '';
        let friendId = '';

        if (query[0] === '_id') {
            _id = query[1];
            dispatch(fetchMessages(_id));
            socket.emit('join', _id);
            setConvId(_id);
        } else if (query[0] === 'friendId') {
            friendId = query[1];
            setFriendId(friendId);
            dispatch(userActions.checkIfConvExist({friendId}));
        }

        return () => {
            if (_id) {
                socket.emit('leave', _id);
            }
            dispatch(userActions.leaveConv());
        };

    }, [dispatch, history.location, location.search])

    const fileSendChangeHandler = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }

    const sendMessageHandler = (e) => {
        e.preventDefault();

        if (friendId) {
            if (selectedFile) {
                let file = new FormData();

                file.append('file', selectedFile);
        
                dispatch(sendFile(file, conv._id, friendId));
            } else {
                dispatch(sendMessage(messageInput.current.value, conv._id, friendId));
            }
        } else {
            let part = conv.participants.find(el => el !== userId);
            if (selectedFile) {
                let file = new FormData();

                file.append('file', selectedFile);
        
                dispatch(sendFile(file, convId, part));            
            } else {
                dispatch(sendMessage(messageInput.current.value, convId, part));
            }
        }
        messageInput.current.value = '';
        setSelectedFile('');
    }


    return (
        <div className={`${classes.ChatPage} ${props.isDarkMode ? '' : classes.LightMode}`}>
            <BackDrop bdShow={props.bdShow} click={props.sdToggleHandler}/>
            <SideDrawer isDarkMode={props.isDarkMode} sdShow={props.sdShow} sdToggleHandler={() => setTimeout(props.sdToggleHandler,300)} logoutHandler={props.logoutHandler}/>
            <NavBar chat sdToggleHandler={props.sdToggleHandler}/>
            <div className={classes.ChatHeader}>
                <h2>{conv.groupName ? conv.groupName : conv.friendUsername}</h2>
            </div>
            <Messages messages={conv.messages} friendId={conv.participants} userId={userId}/>
            <form className={classes.ChatForm} onSubmit={sendMessageHandler}>
                <label className={classes.FileSend}>
                    <FileIcon/>
                    <input type="file" accept='image/*' onChange={fileSendChangeHandler}/>
                </label>
                <FormInput 
                    type="text" 
                    inputRef={messageInput} 
                    placeholder={selectedFile.name ? selectedFile.name : undefined} 
                    value={selectedFile.name ? '' : undefined}
                    disabled={selectedFile.name ? true : false} />
                <Button btnType="send-btn" />
            </form>
        </div>
    )
}

export default ChatPage
