import React, { useEffect, useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { agoraConfig } from '../../config/agoraConfig';
import { toast } from 'react-toastify';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaPhone, 
  FaExpand, 
  FaUserCircle,
  FaCog
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';

const VideoCall = ({ appointmentId, role }) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
  const [agoraEngine, setAgoraEngine] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callContainerRef = useRef(null);

  useEffect(() => {
    const setupAgoraClient = async () => {
      try {
        // Request microphone permission first
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
          console.error('Microphone permission denied:', error);
          toast.error('Please allow microphone access to use audio in the call');
          return;
        }

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        setAgoraEngine(client);

        // Initialize local tracks with error handling
        try {
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            {}, // audio config
            { encoderConfig: { width: 1280, height: 720 } } // video config
          );
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);

          // Event handlers
          client.on('user-published', async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === 'video') {
              setRemoteVideoTrack(user.videoTrack);
            }
            if (mediaType === 'audio') {
              setRemoteAudioTrack(user.audioTrack);
            }
          });

          client.on('user-unpublished', (user, mediaType) => {
            if (mediaType === 'video') {
              setRemoteVideoTrack(null);
            }
          });

          // Join channel
          const channelName = `appointment-${appointmentId}`;
          await client.join(agoraConfig.appId, channelName, null, null);
          await client.publish([audioTrack, videoTrack]);
          setIsConnected(true);
        } catch (trackError) {
          console.error('Error creating tracks:', trackError);
          toast.error('Failed to access camera or microphone');
        }

      } catch (error) {
        console.error('Error setting up video call:', error);
        toast.error('Failed to setup video call');
      }
    };

    if (appointmentId) {
      setupAgoraClient();
    }

    return () => {
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (agoraEngine) {
        agoraEngine.leave();
      }
    };
  }, [appointmentId]);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.play(remoteVideoRef.current);
    }
  }, [remoteVideoTrack]);

  useEffect(() => {
    if (remoteAudioTrack) {
      remoteAudioTrack.play();
    }
  }, [remoteAudioTrack]);

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      callContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const endCall = () => {
    // Implement call ending logic
    toast.info('Call ended');
  };

  return (
    <div 
      ref={callContainerRef}
      className="relative w-full h-screen bg-gray-900 text-white overflow-hidden"
    >
      {/* Main video grid */}
      <div className="absolute inset-0 flex flex-col md:flex-row">
        {/* Remote video (main) */}
        <div className="flex-1 relative bg-gray-800">
          {remoteVideoTrack ? (
            <div 
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900">
              <FaUserCircle className="text-gray-600 text-9xl mb-4" />
              <p className="text-xl text-gray-400">Waiting for participant to join...</p>
              <p className="text-sm text-gray-500 mt-2">Appointment ID: {appointmentId}</p>
            </div>
          )}
          
          {/* Remote user info */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-full">
            <span className="font-medium">Dr. Smith</span>
            <span className="text-xs text-gray-300 ml-2">(Patient)</span>
          </div>
        </div>

        {/* Local video (preview) */}
        <div className="w-full md:w-80 h-48 md:h-auto bg-gray-900 border-t md:border-t-0 md:border-l border-gray-700 relative">
          {isVideoOn ? (
            <div 
              ref={localVideoRef}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-800">
              <FaUserCircle className="text-gray-600 text-5xl mb-2" />
              <p className="text-sm text-gray-400">Camera is off</p>
            </div>
          )}
          
          {/* Local user info */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded-full text-sm">
            You ({role})
          </div>
        </div>
      </div>

      {/* Call controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="bg-black bg-opacity-60 rounded-full px-4 py-2 flex items-center space-x-4">
          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
            aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
            aria-label={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700"
            aria-label="End call"
          >
            <FaPhone size={20} />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <FaExpand size={18} />
          </button>

          {/* Settings dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
              aria-label="Settings"
            >
              <BsThreeDotsVertical size={18} />
            </button>
            
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                <button className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left">
                  <FaCog className="mr-2" />
                  Settings
                </button>
                <button className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left">
                  <FaVideo className="mr-2" />
                  Camera Settings
                </button>
                <button className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left">
                  <FaMicrophone className="mr-2" />
                  Microphone Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call status */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 px-3 py-1 rounded-full text-sm">
        {isConnected ? (
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Connected
          </span>
        ) : (
          <span className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Connecting...
          </span>
        )}
      </div>

      {/* Call timer */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 px-3 py-1 rounded-full text-sm">
        12:45
      </div>
    </div>
  );
};

export default VideoCall;