import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Sparkles, Mic, MicOff, Volume2, X, Maximize2, Layers, ExternalLink, ShieldCheck, Mail } from 'lucide-react';
import { askAssistantApi } from '../services/api';
import { createVoiceRecognizer, speakWithTaskFlowAiVoice, VoiceRecognizerController } from '../utils/speechUtils';
import { autoCorrectText } from '../utils/autoCorrect';

export const FloatingAssistantOverlay: React.FC = () => {
  const { currentScreen, setCurrentScreen, userProfile, notifications } = useApp();

  const isLight = userProfile?.themeMode === 'Light';

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isOverlayModeActive, setIsOverlayModeActive] = useState(false);
  const [pipWindowRef, setPipWindowRef] = useState<Window | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // Latest email notification sent to registered email
  const latestEmailNotif = notifications.find((n) => n.category === 'EMAIL');

  const controllerRef = useRef<VoiceRecognizerController | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const longPressTimerRef = useRef<any>(null);
  const isLongPressTriggeredRef = useRef(false);

  useEffect(() => {
    const handleLaunchPip = () => {
      launchPictureInPicture();
    };
    window.addEventListener('launch-overlay-pip', handleLaunchPip);
    return () => window.removeEventListener('launch-overlay-pip', handleLaunchPip);
  }, [isLight, userProfile]);

  // Hide main button when already on full AI Assistant screen
  const isAssistantScreen = currentScreen === 'assistant';

  // Speech synthesis speak helper using Task Flow AI voice
  const speakText = (text: string) => {
    speakWithTaskFlowAiVoice(text);
  };

  // Process voice input through AI
  const handleVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    const correctedQuery = autoCorrectText(queryText);
    setIsThinking(true);
    setResponse('Task Flow AI is analyzing your prompt...');

    // If PiP window active, update PiP text immediately
    if (pipWindowRef) {
      const pipText = pipWindowRef.document.getElementById('pip-transcript');
      if (pipText) pipText.innerText = '🤔 Task Flow AI is analyzing: "' + correctedQuery + '"...';
    }

    try {
      const aiReply = await askAssistantApi(
        `[Overlay Assistant Mode] User voice prompt: ${correctedQuery}`,
        userProfile
      );

      setResponse(aiReply);
      speakText(aiReply);

      if (pipWindowRef) {
        const pipText = pipWindowRef.document.getElementById('pip-transcript');
        if (pipText) pipText.innerText = '🤖 ' + aiReply;
      }
    } catch (err) {
      const fallback = "I'm ready to assist with your business tasks, revenue goals, and scheduling.";
      setResponse(fallback);
      speakText(fallback);

      if (pipWindowRef) {
        const pipText = pipWindowRef.document.getElementById('pip-transcript');
        if (pipText) pipText.innerText = '🤖 ' + fallback;
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Toggle Speech Recognition
  const toggleListening = async () => {
    if (isListening) {
      if (controllerRef.current) {
        controllerRef.current.stop();
      }
      setIsListening(false);
      if (pipWindowRef) {
        const pipMic = pipWindowRef.document.getElementById('pip-mic');
        if (pipMic) pipMic.innerText = '🎙️ Speak to AI Assistant';
      }
      return;
    }

    currentTranscriptRef.current = '';
    setIsListening(true);
    setTranscript('Listening for your voice...');
    if (pipWindowRef) {
      const pipText = pipWindowRef.document.getElementById('pip-transcript');
      const pipMic = pipWindowRef.document.getElementById('pip-mic');
      if (pipText) pipText.innerText = '🎙️ Listening... Speak your command now!';
      if (pipMic) pipMic.innerText = '🔴 Listening... (Click to Stop)';
    }

    const controller = createVoiceRecognizer(
      (transcribedText) => {
        currentTranscriptRef.current = transcribedText;
        setTranscript(transcribedText);
        if (pipWindowRef) {
          const pipText = pipWindowRef.document.getElementById('pip-transcript');
          if (pipText) pipText.innerText = '🗣️ ' + transcribedText;
        }
      },
      (errorMsg) => {
        setTranscript(errorMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
        if (pipWindowRef) {
          const pipMic = pipWindowRef.document.getElementById('pip-mic');
          if (pipMic) pipMic.innerText = '🎙️ Speak to AI Assistant';
        }
        const textToQuery = currentTranscriptRef.current.trim();
        if (textToQuery && textToQuery !== 'Listening...') {
          handleVoiceQuery(textToQuery);
        }
      }
    );

    controllerRef.current = controller;
    await controller.start();
  };

  // Request Picture-in-Picture window (Display Over Other Apps feature)
  const launchPictureInPicture = async () => {
    if ('documentPictureInPicture' in window) {
      try {
        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 390,
          height: 540,
        });

        setPipWindowRef(pipWin);
        setIsOverlayModeActive(true);

        const bgColor = isLight ? '#F8FAFC' : '#0A0C14';
        const textColor = isLight ? '#0F172A' : '#F8FAFC';
        const cardBg = isLight ? '#FFFFFF' : '#131726';
        const borderColor = isLight ? '#E2E8F0' : '#2E3552';

        // Inject styles & interactive markup into PiP window
        pipWin.document.body.innerHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Task Flow AI - Display Over Apps</title>
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  padding: 14px;
                  background: ${bgColor};
                  color: ${textColor};
                  font-family: system-ui, -apple-system, sans-serif;
                  display: flex;
                  flex-direction: column;
                  height: 100vh;
                }
                .header {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  border-bottom: 1px solid ${borderColor};
                  padding-bottom: 8px;
                  margin-bottom: 10px;
                }
                .title {
                  font-weight: 800;
                  font-size: 13px;
                  color: #06B6D4;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                }
                .badge {
                  background: rgba(0, 230, 118, 0.2);
                  color: #00E676;
                  font-size: 10px;
                  padding: 2px 8px;
                  border-radius: 12px;
                  border: 1px solid rgba(0, 230, 118, 0.4);
                  font-weight: bold;
                }
                .content {
                  flex: 1;
                  background: ${cardBg};
                  border: 1px solid ${borderColor};
                  border-radius: 12px;
                  padding: 12px;
                  overflow-y: auto;
                  font-size: 12px;
                  line-height: 1.5;
                  margin-bottom: 10px;
                }
                .chip-group {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                  margin-bottom: 10px;
                }
                .chip {
                  background: ${cardBg};
                  border: 1px solid ${borderColor};
                  color: #7C3AED;
                  font-size: 10px;
                  font-weight: bold;
                  padding: 4px 8px;
                  border-radius: 8px;
                  cursor: pointer;
                  white-space: nowrap;
                }
                .chip:hover { border-color: #7C3AED; }
                .input-box {
                  display: flex;
                  gap: 6px;
                  margin-bottom: 10px;
                }
                .input-box input {
                  flex: 1;
                  padding: 8px 12px;
                  border-radius: 10px;
                  border: 1px solid ${borderColor};
                  background: ${cardBg};
                  color: ${textColor};
                  font-size: 12px;
                  outline: none;
                }
                .input-box button {
                  padding: 8px 14px;
                  background: #7C3AED;
                  color: white;
                  font-weight: bold;
                  font-size: 11px;
                  border: none;
                  border-radius: 10px;
                  cursor: pointer;
                }
                .mic-btn {
                  width: 100%;
                  padding: 12px;
                  background: linear-gradient(135deg, #7C3AED, #06B6D4);
                  color: white;
                  font-weight: bold;
                  border: none;
                  border-radius: 12px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  font-size: 13px;
                  box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
                }
                .mic-btn:active { opacity: 0.85; }
                .hint { font-size: 10px; color: #94A3B8; text-align: center; margin-top: 6px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">🤖 Task Flow AI Assistant</div>
                <div class="badge">OVERLAY ACTIVE</div>
              </div>
              <div class="content" id="pip-transcript">
                Welcome to Task Flow AI Display Over Apps mode! Ask questions or give commands below via voice or text.
              </div>

              <div class="chip-group">
                <button class="chip" id="chip-1">⚡ Daily AI Plan</button>
                <button class="chip" id="chip-2">📈 Revenue Status</button>
                <button class="chip" id="chip-3">📝 Create High Priority Task</button>
              </div>

              <div class="input-box">
                <input id="pip-input" type="text" placeholder="Type prompt or command..." />
                <button id="pip-send">Send</button>
              </div>

              <button class="mic-btn" id="pip-mic">
                🎙️ Speak to AI Assistant
              </button>
              <div class="hint">Window stays pinned floating over other apps</div>
            </body>
          </html>
        `;

        // Wire event listeners in PiP window
        const pipMicBtn = pipWin.document.getElementById('pip-mic');
        const pipInput = pipWin.document.getElementById('pip-input') as HTMLInputElement | null;
        const pipSendBtn = pipWin.document.getElementById('pip-send');
        const chip1 = pipWin.document.getElementById('chip-1');
        const chip2 = pipWin.document.getElementById('chip-2');
        const chip3 = pipWin.document.getElementById('chip-3');

        if (pipMicBtn) {
          pipMicBtn.onclick = () => {
            toggleListening();
          };
        }

        const submitTextFromPip = () => {
          if (pipInput && pipInput.value.trim()) {
            const text = pipInput.value.trim();
            pipInput.value = '';
            handleVoiceQuery(text);
          }
        };

        if (pipSendBtn) pipSendBtn.onclick = submitTextFromPip;
        if (pipInput) {
          pipInput.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') submitTextFromPip();
          };
        }

        if (chip1) chip1.onclick = () => handleVoiceQuery('Generate AI Daily Plan for my business');
        if (chip2) chip2.onclick = () => handleVoiceQuery('Show revenue metrics and monthly goal progress');
        if (chip3) chip3.onclick = () => handleVoiceQuery('Add task: Review proposal and follow up with leads today');

        pipWin.addEventListener('unload', () => {
          setIsOverlayModeActive(false);
          setPipWindowRef(null);
        });
      } catch (e) {
        // Fallback to in-app floating overlay mode
        setIsOverlayModeActive(true);
        setIsOpen(true);
      }
    } else {
      // Fallback overlay mode
      setIsOverlayModeActive(true);
      setIsOpen(true);
    }
  };

  // Long press handling logic for the AI Assistant trigger:
  // Short click -> Open AI Assistant screen
  // Long press (~400ms) -> Show "Display Over Other Apps" panel
  const handlePointerDown = () => {
    isLongPressTriggeredRef.current = false;
    setIsLongPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsLongPressing(false);
      setIsOpen(true); // Open the Display Over Other Apps popover
    }, 400);
  };

  const handlePointerUp = () => {
    setIsLongPressing(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isLongPressTriggeredRef.current) {
      // Regular click: open AI Assistant Screen
      setCurrentScreen('assistant');
    }
  };

  const handlePointerLeave = () => {
    setIsLongPressing(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <>
      {/* Floating Assistant Orb (visible on all screens except full assistant view) */}
      {!isAssistantScreen && (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
          {/* Expanded Overlay Quick Panel */}
          {isOpen && (
            <div
              className={`w-80 p-4 rounded-2xl border shadow-2xl space-y-3 animate-fade-in mb-2 ${
                isLight
                  ? 'bg-white/95 border-purple-200 text-slate-900 shadow-purple-500/10'
                  : 'bg-[#0A0C14]/95 border-[#2E3552] text-white shadow-cyan-500/10'
              } backdrop-blur-xl`}
            >
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#7C3AED]/20 text-[#A78BFA] rounded-lg">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs flex items-center gap-1">
                      Task Flow AI Assistant <Sparkles className="w-3 h-3 text-[#06B6D4]" />
                    </h4>
                    <span className="text-[10px] text-[#00E676] font-semibold">
                      {isOverlayModeActive ? 'Display Over Other Apps Active' : '24/7 Overlay Assistant'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setCurrentScreen('assistant');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer"
                    title="Expand Full Screen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Registered Email Alert Banner */}
              {latestEmailNotif && (
                <div
                  className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                    isLight
                      ? 'bg-cyan-50 border-cyan-300 text-slate-800'
                      : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className="flex items-center gap-1 text-[#06B6D4]">
                      <Mail className="w-3.5 h-3.5" /> {latestEmailNotif.title}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400">{latestEmailNotif.timestamp}</span>
                  </div>
                  <p className="text-[11px] leading-snug opacity-90">{latestEmailNotif.message}</p>
                </div>
              )}

              {/* Status / Response Box */}
              <div
                className={`p-3 rounded-xl border text-xs max-h-40 overflow-y-auto scrollbar-none space-y-1.5 ${
                  isLight
                    ? 'bg-purple-50/70 border-purple-200 text-slate-800'
                    : 'bg-[#131726] border-[#2E3552] text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>TASK FLOW AI VOICE RESPONSE</span>
                  {isThinking && (
                    <div className="flex items-center gap-1 text-[#06B6D4]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] ai-typing-dot-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] ai-typing-dot-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] ai-typing-dot-3" />
                      <span className="ml-1 text-[10px] font-bold">Thinking...</span>
                    </div>
                  )}
                </div>
                <p className="leading-relaxed">
                  {response || transcript || 'Tap the microphone below or ask any question to speak with Task Flow AI.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={toggleListening}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white hover:opacity-90'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" /> Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" /> Speak in Real-Time (Task Flow AI Voice)
                    </>
                  )}
                </button>

                {/* Display Over Other Apps Button */}
                <button
                  onClick={launchPictureInPicture}
                  className={`w-full py-2 rounded-xl font-bold text-[11px] border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900'
                      : 'bg-[#1E2338] hover:bg-[#252C46] border-[#2E3552] text-[#06B6D4]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {isOverlayModeActive ? 'Overlay Window Running' : 'Display Over Other Apps (Floating PiP)'}
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              </div>
            </div>
          )}

          {/* Floating Orb Icon: Click opens AI screen, Long Tap shows Display Over Other Apps */}
          <div className="relative group">
            <button
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
              onContextMenu={(e) => {
                e.preventDefault();
                setIsOpen(true);
              }}
              className={`relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-[0_0_25px_rgba(124,58,237,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] cursor-pointer touch-manipulation select-none transition-transform duration-200 ${
                isLongPressing
                  ? 'scale-110 ring-4 ring-[#06B6D4] bg-gradient-to-tr from-[#06B6D4] to-[#7C3AED]'
                  : 'bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] hover:scale-105 active:scale-95'
              }`}
              title="Click to Open AI Assistant Screen • Long-Press to Display Over Other Apps"
            >
              <Bot className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00E676] rounded-full border-2 border-[#0A0C14] animate-pulse" />
            </button>

            {!isOpen && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 bg-[#131726]/95 border border-[#7C3AED] px-3 py-1.5 rounded-xl text-[11px] font-bold text-white shadow-xl whitespace-nowrap pointer-events-none">
                <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Click: Open AI • Hold: Display Over Apps</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
