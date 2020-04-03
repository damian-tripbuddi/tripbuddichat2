import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import VideoCall from './VideoCall';

import { AGORA_APP_ID } from '../agora.config';

const VideoPreCall = () => {
  const [hasJoined, setHasJoined] = useState(false);
  const [joinBtn, setJoinBtn] = useState(true);
  const [channel, setChannel] = useState('test');
  const [baseMode, setBaseMode] = useState('avc');
  const [transcode, setTranscode] = useState('interop');
  const [attendeeMode, setAttendeeMode] = useState('video');
  const [videoProfile, setVideoProfile] = useState('480p_4');

  const [appId, setAppId] = useState(AGORA_APP_ID);
  const [uid, setUid] = useState(
    Math.random()
      .toString(36)
      .substring(7)
  );

  const handleChannel = (_channel, _joinBtn) => {
    setChannel(_channel);
    setJoinBtn(_joinBtn);
  };

  const handleJoin = () => {
    setJoinBtn(false);
    setHasJoined(true);
  };

  return (
    <div>
      <h1>Video Pre Call Screen</h1>
      {!hasJoined && (
        <Button variant='contained' color='primary' disabled={!joinBtn} onClick={handleJoin}>
          Join Call
        </Button>
      )}
      {hasJoined && <VideoCall videoProfile={videoProfile} channel={channel} transcode={transcode} attendeeMode={attendeeMode} baseMode={baseMode} appId={appId} uid={uid} />}
    </div>
  );
};

export default VideoPreCall;
