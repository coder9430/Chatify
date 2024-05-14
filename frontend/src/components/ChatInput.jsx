import React, { useState, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import { FaFaceSmileWink } from "react-icons/fa6";
import annyang from "annyang";
import { AiFillAudio } from "react-icons/ai";
import { FaPause } from "react-icons/fa6";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const handleChange = (e) => {
    setMsg(e.target.value);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  const [transcript, setTranscript] = useState("");
  const [isListening, setisListening] = useState(true);
  const [previousTalks, setPreviousTalks] = useState("");

  useEffect(async () => {
    if (transcript.length > 0) {
      await handleSendMsg(transcript);
      setMsg("");
      setTranscript("");
    }
  }, [transcript]);

  useEffect(() => {
    // Initialize annyang when the component mounts
    annyang.init({ autoRestart: true });

    // Add a command for listening to speech
    annyang.addCommands({
      "start listening": () => {
        annyang.start();
      },
      "stop listening": () => {
        annyang.abort();
      },
    });

    annyang.addCallback("result", async (phrases) => {
      const newTranscript = phrases[0];
      setTranscript(newTranscript);
      // // Update the string of previous talks
      // setPreviousTalks((prevTalks) => prevTalks + ' ' + newTranscript);
      setMsg(newTranscript);
    });

    // Clean up when the component unmounts
    return () => {
      annyang.abort();
      annyang.removeCallback("result");
    };
  }, []);

  const startListening = () => {
    annyang.start();
    setisListening(false);
  };

  const stopListening = () => {
    annyang.abort();
    setisListening(true);
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <FaFaceSmileWink size={30} onClick={handleEmojiPickerhideShow} />
          {/* <BsEmojiSmileFill size={32} onClick={handleEmojiPickerhideShow} /> */}
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          type="text"
          placeholder="Type your message"
          onChange={handleChange}
          className="my-auto"
          value={msg}
        />

        {isListening ? (
          <button
            className="btn"
            onClick={startListening}
            style={{ border: "none" }}
          >
            <AiFillAudio color="white" size={27} />
          </button>
        ) : (
          <button
            className="btn "
            onClick={stopListening}
            style={{ border: "none" }}
          >
            <FaPause color="white" size={27} />
          </button>
        )}
        <button type="submit" className="buttonnormal">
          <IoMdSend size={25} className="rounded-lg" />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  width: 100%;
  border-radius: 20px;
  align-items: center;
  grid-template-columns: 5% 95%;
  background-color: #080420;

  @media (max-width: 800px) {
    grid-template-columns: 8% 92%;
    padding: 0 1rem;
    gap: 1rem;
  }
  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }
      .emoji-picker-react {
        position: absolute;
        top: -350px;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9a86f3;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #9a86f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
  }
  .input-container {
    width: 100%;
    height: 35px;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0rem;
    background-color: #ffffff34;
    input {
      width: 90%;
      height: 50%;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;

      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
    }
    @media (max-width: 500px) {
      input {
        font-size: 1rem;
      }
    }
    .buttonnormal {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a86f3;
      border: none;
      @media screen and (max-width: 800px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
`;
