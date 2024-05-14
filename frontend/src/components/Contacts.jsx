import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.png";
import "./Contacts.css";
import Logout from "./Logout";
import { GoDotFill } from "react-icons/go";
import { RiRobot2Fill } from "react-icons/ri";
import altprofile from "../assets/altprofile.png";
import { RiUnpinFill } from "react-icons/ri";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const predefinedContact = {
    email: "buddy@openai.com",
    username: "Buddy",
    avatarImage: "https://example.com/predefined-avatar.jpg",
    _id: "65c0d419508086996680d56a",
    status: "online",
  };
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    setCurrentUserName(data.username);
    setCurrentUserImage(data.avatarImage);
  }, []);
  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUserImage && currentUserImage && (
        <div className="allcontacts container-fluid d-flex flex-column h-100 ">
          <div
            className="brand text-white d-flex gap-2 justify-content-center align-items-center"
            style={{ height: "10%" }}
          >
            <div className="">
              <img src={Logo} alt="logo" className="rounded-circle" />
            </div>
            <h4 className="mb-0 fw-bold">CHATIFY</h4>

            <button
              onClick={() => changeCurrentChat(2, predefinedContact)}
              className="btn btn-tooltip"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Your Buddy"
            >
              <RiRobot2Fill
                size={28}
                className="mb-1 ms-2"
                style={{ cursor: "pointer" }}
              />
            </button>
          </div>
          <div
            className="contacts"
            style={{ overflowY: "auto", height: "80%" }}
          >
            {" "}
            {/* Add overflow-auto class here */}
            <ul className="list-group">
              {contacts.map((contact, index) => {
                return (
                  <li
                    key={contact._id}
                    className={`contact d-flex gap-2 justify-content-between  list-group-item mx-2 ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    onClick={() => changeCurrentChat(index, contact)}
                  >
                    <div className="d-flex gap-2">
                      <div className="avatar">
                        <img
                          src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                          alt=""
                        />
                      </div>
                      <div className="username text-white">
                        <h5
                          className="mt-1 mb-0"
                          style={{ overflowWrap: "break-word" }}
                        >
                          {contact.username}
                        </h5>

                        <h6>
                          <small>
                            {contact.status === "online" ? (
                              <GoDotFill color="green" />
                            ) : (
                              <GoDotFill color="red" />
                            )}
                            {contact.status}
                          </small>
                        </h6>
                      </div>
                    </div>

                    <div>
                      {contact.isPin ? (
                        <RiUnpinFill color="white" size={20} />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="current-user d-flex justify-content-center align-items-center gap-3"
            style={{ height: "10%" }}
          >
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username text-white">
              <h5 className="m-0">{currentUserName}</h5>
            </div>
            <div className="">
              <Logout className="logout" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
