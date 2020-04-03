import React, { useState, useEffect, useCallback } from 'react';
import { DataStore } from '@aws-amplify/datastore';
import { Message } from './models';
import Box from '@material-ui/core/Box';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import TextField from '@material-ui/core/TextField';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';

import VideoPreCall from './components/VideoPreCall';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  messageList: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: 'inline'
  }
}));

function App() {
  const classes = useStyles();

  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState('user');

  useEffect(() => {
    console.log('useEffect');
    fetchMessages();
    const subscription = DataStore.observe(Message).subscribe(() => {
      fetchMessages();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onMessageChange = e => {
    setCurrentMessage(e.target.value);
  };

  const onUserChange = e => {
    setCurrentUser(e.target.value);
  };

  const fetchMessages = async () => {
    const newMessages = await DataStore.query(Message);
    const sortedMessages = [...newMessages].sort((messageA, messageB) => {
      if (new Date(messageA.createdAt) > new Date(messageB.createdAt)) {
        return -1;
      } else {
        return 1;
      }
    });
    console.log({ newMessages, sortedMessages });
    setMessages(sortedMessages);
  };

  const createMessage = async () => {
    if (!currentMessage) return;
    await DataStore.save(new Message({ message: currentMessage, user: currentUser }));
    setCurrentMessage('');
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position='fixed' className={classes.appBar}>
        <Toolbar>
          <Typography variant='h6' noWrap>
            Trip Buddi Chat
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant='permanent'
        classes={{
          paper: classes.drawerPaper
        }}>
        <div className={classes.toolbar} />
        <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <VideoPreCall />
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <h1>Real Time Message App</h1>
              <form onSubmit={e => e.preventDefault()} noValidate autoComplete='off'>
                <TextField id='username' label='Username' variant='outlined' onChange={onUserChange} value={currentUser} />
                <TextField id='message' label='Message' variant='outlined' onChange={onMessageChange} value={currentMessage} />
                <Button variant='contained' color='primary' onClick={createMessage}>
                  Create Message
                </Button>
              </form>
            </Paper>
            <List className={classes.messageList}>
              {messages.map(message => {
                return (
                  <React.Fragment key={message.id}>
                    <ListItem alignItems='flex-start'>
                      <ListItemAvatar>
                        <Avatar alt='Remy Sharp' src='https://picsum.photos/100' />
                      </ListItemAvatar>
                      <ListItemText
                        primary={message.message}
                        secondary={
                          <React.Fragment>
                            <Typography component='span' variant='body2' className={classes.inline} color='textPrimary'>
                              {message.user} @
                            </Typography>
                            {new Date(message.createdAt).toString()}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant='inset' component='li' />
                  </React.Fragment>
                );
              })}
            </List>
          </Grid>
        </Grid>
      </main>
      <Drawer
        className={classes.drawer}
        variant='permanent'
        classes={{
          paper: classes.drawerPaper
        }}
        anchor='right'>
        <div className={classes.toolbar} />
        <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem button key={text + '2'}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem button key={text + '2'}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>
  );
}

export default App;
