import React, { useState } from 'react';
import { useQuery, useMutation} from '@apollo/client';
import queries from '../queries';
import './home.scss';
import  ButtonComponent from  './Button'
// import NewPost from "./NewPost"
import { Link } from "react-router-dom";


const MyPost = (props) => {
    const { loading, error, data } = useQuery(queries.GET_USERPOSTED);
    const [removeImage] = useMutation(queries.DELETE_IMG, {
        update(cache) {
            const { userPostedImages } = cache.readQuery({
                query: queries.GET_USERPOSTED,
            });
            cache.writeQuery({
                query: queries.GET_USERPOSTED,
                data: {
                    userPostedImages: userPostedImages.filter((e) => e.id === data.userPostedImages.id),
                },
            });
        },
    });


  // console.log(data )
  // console.log(typeof(data))
  if(typeof(data)=='object'){
    return (
    <div>
      <h1>My Posts</h1>
      <ul>
        {data.userPostedImages.map(element =>{
          return(  
          <div className = "post" key = {element.id}>
          <li>
            <img src = {element.url} alt = "image" className = "image"/>
            <p>Description: {element.description}</p>
            <p>Author: {element.posterName}</p>
            </li>
            <br></br>
          <ButtonComponent element={element}/>
          <button className = "deleteButton" onClick = {()=>{
            try{
              removeImage(
                {
              variables:{
                id: element.id  
            }
            })
            alert("Deleted Successfully!")
          }catch(e){
            console.log(e)
            alert("Error could not delete...")
          }
          }
          }>
            Delete
            </button>
          </div>
          )}
        )}  
      </ul>
      <Link to = "new-post" className = "link">Click here to create a new post!</Link>     
      </div>
      )
  } else if (loading){
    return <div>Loading...</div>
  } else if(error){
    return<div><p>{error.message}</p></div>
  }
};


export default MyPost;