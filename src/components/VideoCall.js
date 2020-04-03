import React, { useState, useRef, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk';

import MicSharpIcon from '@material-ui/icons/MicSharp';
import MicOffSharpIcon from '@material-ui/icons/MicOffSharp';
import VideocamSharpIcon from '@material-ui/icons/VideocamSharp';
import VideocamOffSharpIcon from '@material-ui/icons/VideocamOffSharp';
import CancelPresentationSharpIcon from '@material-ui/icons/CancelPresentationSharp';

const VideoCall = ({ videoProfile, channel, transcode, attendeeMode, baseMode, appId, uid }) => {
  const client = useRef();
  const localStream = useRef();
  const shareClient = useRef();
  const shareStream = useRef();
  const toolbarToggle = useRef();

  const canvas = useRef();

  const [displayMode, setDisplayMode] = useState('pip');
  const [streamList, setStreamList] = useState([]);
  const [streamListIds, setStreamListIds] = useState([]);
  const [readyState, setReadyState] = useState(false);
  const [showButtonGroup, setShowButtonGroup] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    console.log('useEffect Stream List');
    streamList.forEach((item, index) => {
      console.log('Playing ', { item });
      item.play('ag-item-' + item.getId());
      item.player.resize && item.player.resize();
    });
  }, [streamListIds]);

  useEffect(() => {
    // init AgoraRTC local client
    console.log({ transcode });
    client.current = AgoraRTC.createClient({ mode: transcode });
    client.current.init(appId, () => {
      console.log('AgoraRTC client initialized');
      subscribeStreamEvents();
      client.current.join(appId, channel, uid, uid => {
        console.log('User ' + uid + ' join channel successfully');
        console.log('At ' + new Date().toLocaleTimeString());
        // create local stream
        // It is not recommended to setState in function addStream
        localStream.current = streamInit(uid, attendeeMode, videoProfile);
        localStream.current.init(
          () => {
            addStream(localStream.current, true);
            client.current.publish(localStream.current, err => {
              console.log('Publish local stream error: ' + err);
            });
            setReadyState(true);
          },
          err => {
            console.log('getUserMedia failed', err);
            setReadyState(true);
          }
        );
      });
    });

    canvas.current.addEventListener('mousemove', () => {
      if (toolbarToggle.current) {
        clearTimeout(toolbarToggle.current);
      }
      setShowButtonGroup(true);
      toolbarToggle.current = setTimeout(function() {
        setShowButtonGroup(false);
      }, 2000);
    });

    const keepCanvas = canvas.current;
    return () => {
      keepCanvas.removeEventListener('mousemove');
      client.current && client.current.unpublish(this.localStream);
      localStream.current && localStream.current.close();
      client.current &&
        client.current.leave(
          () => {
            console.log('Client succeed to leave.');
          },
          () => {
            console.log('Client failed to leave.');
          }
        );
    };
  }, []);

  const streamInit = (uid, attendeeMode, videoProfile, config) => {
    let defaultConfig = {
      streamID: uid,
      audio: true,
      video: true,
      screen: false
    };

    console.log('######### INIT STREAM');

    let stream = AgoraRTC.createStream({ ...defaultConfig, ...config });
    stream.setVideoProfile(videoProfile);
    return stream;
  };

  const subscribeStreamEvents = () => {
    client.current.on('stream-added', function(evt) {
      let stream = evt.stream;
      console.log('##########################################');
      console.log('New stream added: ' + stream.getId());
      console.log('At ' + new Date().toLocaleTimeString());
      console.log('Subscribe ', stream);
      console.log('##########################################');
      client.current.subscribe(stream, function(err) {
        console.log('##########################################');

        console.log('Subscribe stream failed', err);
        console.log('##########################################');
      });
    });

    client.current.on('peer-leave', function(evt) {
      console.log('##########################################');

      console.log('Peer has left: ' + evt.uid);
      console.log(new Date().toLocaleTimeString());
      console.log(evt);
      console.log('##########################################');

      removeStream(evt.uid);
    });

    client.current.on('stream-subscribed', function(evt) {
      let stream = evt.stream;
      console.log('##########################################');

      console.log('Got stream-subscribed event');
      console.log(new Date().toLocaleTimeString());
      console.log('Subscribe remote stream successfully: ' + stream.getId());
      console.log(evt);
      console.log('##########################################');

      addStream(stream);
    });

    client.current.on('stream-removed', function(evt) {
      let stream = evt.stream;
      console.log('##########################################');

      console.log('Stream removed: ' + stream.getId());
      console.log(new Date().toLocaleTimeString());
      console.log(evt);
      console.log('##########################################');

      removeStream(stream.getId());
    });
  };

  const removeStream = uid => {
    console.log('removeStream');
    streamList.map((item, index) => {
      if (item.getId() === uid) {
        item.close();
        const newStreamList = [...streamList].splice(index, 1);
        console.log('1 ################################# SET NEW STREAM LIST', newStreamList);
        setStreamList(newStreamList);
        const newStreamListIds = [...streamListIds].splice(index, 1);
        setStreamListIds(newStreamListIds);
      }
    });
  };

  const addStream = (stream, push = false) => {
    console.log('##########################################');
    console.log('##########################################');
    console.log('##########################################');
    console.log('##########################################');

    console.log('addStream function', stream);
    let repeatition = streamList.some(item => {
      return item.getId() === stream.getId();
    });
    if (repeatition) {
      return;
    }
    if (push) {
      const newStreamList = [...streamList].concat([stream]);
      console.log('2 ################################# SET NEW STREAM LIST', newStreamList);
      setStreamList(newStreamList);
      const newStreamListIds = [...streamListIds].concat([stream.getId()]);
      setStreamListIds(newStreamListIds);
    } else {
      const newStreamList = [stream].concat([...streamList]);
      console.log('##########################################');
      console.log('##########################################');
      console.log('##########################################');

      console.log('3 ################################# SET NEW STREAM LIST', newStreamList);
      setStreamList(newStreamList);
      const newStreamListIds = [stream.getId()].concat([...streamListIds]);
      setStreamListIds(newStreamListIds);
    }
  };

  const handleCamera = e => {
    localStream.current.isVideoOn() ? localStream.current.disableVideo() : localStream.current.enableVideo();
  };

  const handleMic = e => {
    localStream.current.isAudioOn() ? localStream.current.disableAudio() : localStream.current.enableAudio();
  };

  const handleExit = e => {
    try {
      client.current && client.current.unpublish(localStream.current);
      localStream.current && localStream.current.close();
      client.current &&
        client.current.leave(
          () => {
            console.log('Client succeed to leave.');
          },
          () => {
            console.log('Client failed to leave.');
          }
        );
    } finally {
      setReadyState(false);
      client.current = null;
      localStream.current = null;
    }
  };

  const videoControlBtn = isVidoOn ? <VideocamSharpIcon onClick={handleCamera} /> : <VideocamOffSharpIcon onClick={handleCamera} />;

  const audioControlBtn = isMicOn ? <MicSharpIcon onClick={handleMic} /> : <MicOffSharpIcon onClick={handleMic} />;

  const exitBtn = <CancelPresentationSharpIcon onClick={handleExit} disabled={!readyState} />;

  return (
    <>
      <h1>Video Call</h1>
      <div ref={canvas}>
        <div>
          {exitBtn}
          {videoControlBtn}
          {audioControlBtn}
        </div>
        {streamListIds.map(id => {
          return <section key={id} id={'ag-item-' + id} style={{ height: '400px' }}></section>;
        })}
      </div>
    </>
  );
};

export default VideoCall;
