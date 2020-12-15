import React from 'react'
import { Link } from "react-router-dom";
import logo from "./delete-512.png"
import './navbar.scss';
import { useHistory } from 'react-router'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-center">
        <img src={logo} alt="logo" className="logo" />
        <ul className="nav-links">   
          <li> <a href = "/" >Home</a></li>
          <li><a href= "/my-bin" >Binned Post</a></li>
          <li><a href = "/my-post" >My Post</a></li>
        </ul>
      </div>
    </nav>
  )
}
