import React, { useState, useEffect, useContext, useReducer } from 'react';
import { DataStore } from '@aws-amplify/datastore';
import { Message } from './models';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

//import VideoPreCall from './components/VideoPreCall';

import ChatSection from './components/ChatSection';

const drawerWidth = 300;

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

  const [messages, setMessages] = useState([]);

  const sendMessage = async message => {
    if (!message) return;
    await DataStore.save(new Message({ message, user: 'test', localCreatedAt: new Date().toISOString() }));
  };

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

  const fetchMessages = async () => {
    const newMessages = await DataStore.query(Message);
    const sortedMessages = [...newMessages].sort((messageA, messageB) => {
      const messageADate = messageA.createdAt || messageA.localCreatedAt;
      const messageBDate = messageB.createdAt || messageB.localCreatedAt;
      if (new Date(messageADate) > new Date(messageBDate)) {
        return 1;
      } else {
        return -1;
      }
    });
    setMessages(sortedMessages);
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
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Grid container spacing={3}>
          <Grid item xs={8}>
            {/* <VideoPreCall /> */}
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
        <ChatSection messages={messages} fetchMessages={fetchMessages} sendMessage={sendMessage} />
      </Drawer>
    </div>
  );
}

export default App;
