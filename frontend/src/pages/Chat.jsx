import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatBot from "../components/ChatBot";
import "./Chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();

  // Initialize state with the predefined contact
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 767) {
      setIsSmallScreen(true);
    }

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 767);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )
      );
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (currentUser) {
          if (currentUser.isAvatarImageSet) {
            const { data } = await axios.get(
              `${allUsersRoute}/${currentUser._id}`
            );
            setContacts(data);
          } else {
            navigate("/setAvatar");
          }
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();

    // Fetch contacts every 30 seconds
    const intervalId = setInterval(fetchContacts, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  const handleBack = () => {
    setCurrentChat(undefined);
  };

  return (
    <>
      <div
        className="container-fluid vh-100 d-flex align-items-center justify-content-center p-xl-4"
        style={{ backgroundColor: "#131324" }}
      >
        <div
          className="container-fluid"
          style={{ height: "80%", backgroundColor: " #00000076" }}
        >
          <div className="row h-100">
            {(!currentChat || !isSmallScreen) && (
              <div className="contacts col-12 col-sm-4 col-md-4 col-xl-3 bg-light h-100 p-0">
                <Contacts contacts={contacts} changeChat={handleChatChange} />
              </div>
            )}

            {(!isSmallScreen || currentChat) && (
              <>
                {currentChat === undefined ? (
                  <div className={`col-12   col-md-8 col-xl-9 h-100`}>
                    <Welcome />
                  </div>
                ) : (
                  <div className={`col-12  p-0 col-md-8 col-xl-9 h-100`}>
                    {currentChat.email === "buddy@openai.com" ? (
                      <>
                        <ChatBot
                          currentChat={currentChat}
                          socket={socket}
                          handleBack={handleBack}
                        />
                      </>
                    ) : (
                      <>
                        <ChatContainer
                          currentChat={currentChat}
                          socket={socket}
                          handleBack={handleBack}
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
