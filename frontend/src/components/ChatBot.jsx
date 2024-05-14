import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import "./ChatBot.css";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import buddy2 from "../assets/buddy2.png";


const systemMessage = {
  role: "system",
  content: "Talk like I am your friend",
};

export default function ChatBot({ currentChat, socket, handleBack }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const handleSendMsg = async (message) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: message,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: message });
    setMessages(msgs);

    await processMessageToChatGPT(msgs);
  };

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    const data1 = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.fromSelf === false) {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then(async (data) => {
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            fromSelf: false,
          },
        ]);
        await axios
          .post(sendMessageRoute, {
            from: currentChat._id,
            to: data1._id,
            message: data.choices[0].message.content,
          })
          .then((response) => {
            console.log("Response from server:", response);
          })
          .catch((error) => {
            console.error("Error sending message to server:", error);
          });
      });
  }

  useEffect(async () => {
    if (process.env.REACT_APP_LOCALHOST_KEY)
      console.log(process.env.REACT_APP_LOCALHOST_KEY);
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container-fluid " style={{ height: "100%" }}>
      <div
        className="chat-header d-flex justify-content-between py-2 "
        style={{ height: "10%" }}
      >
        <div
          className="user-details d-flex gap-1 gap-sm-3"
          style={{ width: "90%" }}
        >
          <IoArrowBackCircleSharp
            className="back"
            onClick={handleBack}
            size={40}
            color="#9a86f3"
          />
          <div className="avatarimg">
            <img src={buddy2} alt="" className="avatarimg" />
          </div>
          <div className="username text-white  d-flex flex-column ">
            <h4 className="mb-0 text-wrap">{currentChat.username} </h4>
            <h6>
              <small>
                {currentChat.status === "online" ? (
                  <GoDotFill color="green" />
                ) : (
                  <GoDotFill color="red" />
                )}
                {currentChat.status}
              </small>
            </h6>
          </div>
        </div>
        <div
          className="d-flex justify-content-center py-1"
          style={{ width: "10%" }}
        >
          <Logout />
        </div>
      </div>
      <div
        className="chat-messages"
        style={{ height: "80%", overflowY: "auto" }}
      >
        <ul className="list-group list-unstyled ">
          {messages.map((message) => {
            return (
              <li ref={scrollRef} key={uuidv4()} className="me-2 mb-2">
                <div
                  className={`message ${
                    message.fromSelf ? "sended" : "recieved"
                  }`}
                >
                  <div className="content px-2 py-1 rounded">
                    <p className="m-0">{message.message}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{ height: "10%" }} className="d-flex align-items-center">
        <ChatInput className="w-100" handleSendMsg={handleSendMsg} />
      </div>
    </div>
  );
}
