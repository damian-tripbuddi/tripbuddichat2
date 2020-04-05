import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import TextField from '@material-ui/core/TextField';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import SendSharpIcon from '@material-ui/icons/SendSharp';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  root: {},
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  messageList: {
    width: '100%',
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: 'inline'
  },
  messageInputHolder: {
    boxShadow: '0px -2px 3px -1px rgba(0,0,0,0.5)',
    paddingLeft: '10px',
    backgroundColor: theme.palette.background.paper,
    paddingTop: '10px',
    paddingBottom: '10px'
  },
  messageText: {
    wordBreak: 'break-word'
  },
  textField: {
    width: '240px'
  },
  toolbar: theme.mixins.toolbar
}));

const ChatSection = ({ messages, sendMessage, fetchMessages }) => {
  const [currentMessage, setCurrentMessage] = useState('');

  const [hasHadMessagesOnce, setHasHadMessagesOnce] = useState(false);

  const messageListRef = useRef(null);

  const scrollBox = useRef(null);

  const classes = useStyles();

  const onMessageChange = useCallback(
    e => {
      setCurrentMessage(e.target.value);
    },
    [setCurrentMessage]
  );

  const timer = useRef(null);

  useEffect(() => {
    console.log('THIS SHOULD ONLY RUN ONCE');
    if (!hasHadMessagesOnce && messages.length > 0) {
      setHasHadMessagesOnce(true);
      messageListRef.current.childNodes[messageListRef.current.childNodes.length - 1].scrollIntoView();
    }
  }, [messages, hasHadMessagesOnce]);

  useEffect(() => {
    timer.current = setTimeout(() => {
      fetchMessages();
    }, 20000);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  useEffect(() => {
    const visibleHeight = scrollBox.current.scrollHeight - scrollBox.current.offsetHeight;
    const scrollDistance = visibleHeight - scrollBox.current.scrollTop;
    if (scrollDistance < 160) {
      if (messageListRef.current && messageListRef.current.childNodes.length > 0) {
        messageListRef.current.childNodes[messageListRef.current.childNodes.length - 1].scrollIntoView();
      }
    }
  }, [messages]);

  const createMessage = async e => {
    if (e) e.preventDefault();
    if (!currentMessage) return;
    sendMessage(currentMessage);
    setCurrentMessage('');
  };

  const onEnterPress = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      createMessage();
    }
  };

  return (
    <>
      <Box height='100%' display='flex' flexDirection='column' flexGrow={1} flexShrink={1} flexBasis='0%'>
        <Box ref={scrollBox} overflow='auto' display='flex' flexGrow={1} flexShrink={1} flexBasis='0%'>
          <div className={classes.toolbar} />
          <List className={classes.messageList} ref={messageListRef}>
            {messages.map((message, index) => {
              return (
                <React.Fragment key={message.id}>
                  <ListItem alignItems='flex-start'>
                    <ListItemAvatar>
                      <Avatar alt='Remy Sharp' src='https://picsum.photos/100' />
                    </ListItemAvatar>
                    <ListItemText
                      className={classes.messageText}
                      primary={message.message}
                      secondary={
                        <React.Fragment>
                          {!!message.createdAt
                            ? moment(message.createdAt)
                                .fromNow()
                                .toString()
                            : moment(message.localCreatedAt)
                                .fromNow()
                                .toString()}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant='inset' component='li' />
                </React.Fragment>
              );
            })}
          </List>
        </Box>
        <Box zIndex={1}>
          <div className={classes.messageInputHolder}>
            <form onSubmit={createMessage} noValidate autoComplete='off'>
              <TextField id='message' multiline onKeyDown={onEnterPress} rowsMax={4} className={classes.textField} label='Message' variant='standard' onChange={onMessageChange} value={currentMessage} />
              <IconButton onClick={createMessage}>
                <SendSharpIcon />
              </IconButton>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default memo(ChatSection);
