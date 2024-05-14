import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  sendMessageRoute,
  recieveMessageRoute,
  setPinMessageRoute,
} from "../utils/APIRoutes";
import "./ChatContainer.css";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import { BsFillPinAngleFill } from "react-icons/bs";
import { RiUnpinFill } from "react-icons/ri";

export default function ChatContainer({ currentChat, socket, handleBack }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isPin, setisPin] = useState(currentChat.isPin);

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
    setisPin(currentChat.isPin);
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

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

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

  const handlePin = async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    try {
      const response = await axios.post(setPinMessageRoute, {
        isPin: !isPin,
        user_id: data._id,
        chat_id: currentChat._id,
      });
      console.log(response.data);
      setisPin(!isPin);
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
              className="avatarimg"
            />
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
        <span onClick={handlePin} className="me-2 mt-1 mt-sm-0 me-sm-0 ">
          {isPin ? (
            <RiUnpinFill
              color="white"
              size={23}
              style={{ cursor: "pointer" }}
              className=" btn btn-tooltip"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="UnPin Chat"
            />
          ) : (
            <BsFillPinAngleFill
              color="white"
              size={20}
              style={{ cursor: "pointer" }}
              className=" btn btn-tooltip mt-1"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Pin Chat"
            />
          )}
        </span>
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
