import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import './home.scss';
import  ButtonComponent from  './Button'
const MyBin = (props) => {
    const { loading, error, data } = useQuery(queries.GET_BINNED);
    

  // console.log(data)
  // console.log(typeof(data))
  if(typeof(data)=='object'){
return (
    <div>
      <h1>My Bin</h1>
      <ul>
        {data.binnedImages.map(element =>{
          return(  
          <div className = "post" key = {element.id}>
          <li>
            <img src = {element.url} alt = "image" className = "image"/>
            <p>Description: {element.description}</p>
            <p>Author: {element.posterName}</p>
            </li>
            <br></br>
          <ButtonComponent element={element}/>
          <br></br>
          </div>
          )}
        )}  
      </ul>
      </div>
    )
  } else if (loading){
    return <div>Loading...</div>
  } else if(error){
    return<div><p>{error.message}</p></div>
  }
};


export default MyBin;