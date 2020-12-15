import React from 'react'
import { useMutation, useQuery } from '@apollo/client';
import queries from '../queries';
import './home.scss'

export default function NewPost() {
  
  const[addImage] = useMutation(queries.ADD_IMG);

  let url;
  let description;
  let posterName;  
  return (
    <div className = "newpost">
      <h1>New Post</h1>
      <form className = "form" id = "add-img" onSubmit={(e)=>{
        e.preventDefault()
        addImage({
          variables: {
              url: url.value,
              description: description.value,
              posterName: posterName.value
          }
        }); 
        url = '';
        description ='';
        posterName = '';
        alert('Post added successfully')
      }} >
        <label>
          Image url: 
        <input ref={(node) => url=node} required autoFocus placeholder="Enter an image url"/>
        </label>
        <br></br>
        <label>
          Image description: 
          <input ref={(node) => description=node} required placeholder="Enter a description"/>
        </label>
        <br></br>
        <label>
        Poster's Name: 
        <input ref={(node) => posterName=node} required placeholder="Enter your name"/>
        </label>
        <br></br>
        <button className="submit" type="submit">
          Add Post
        </button>
      </form>
    </div>
  )
}
