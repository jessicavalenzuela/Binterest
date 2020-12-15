import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import queries from '../queries';
import './home.scss';
import  ButtonComponent from  './Button'


const Home = () => {
    const [pageNum, setPageNum] = useState(1);
    const { loading, error, data } = useQuery(queries.GET_UNSPLASH,{ 
      variables: {
        pageNum: pageNum,
      }
    });
    const handleMore = () => setPageNum(pageNum + 1);
  if(typeof(data)=='object'){ 
    return (
    <div>
      <h1>Welcome to Binterest!</h1>
      <ul>
        {data.unsplashImages.map(element =>{
          return(  
          <div className = "post" key = {element.id}>
          <li>
            <img src = {element.url} alt = "image" className = "image"/>
            <p>Description: {element.description}</p>
            <p>Author: {element.posterName}</p>
            </li>
            <br></br>
          <ButtonComponent element={element}/>
          </div>
          )}
        )}  
      </ul>
      <button className = "button"onClick = {handleMore}>Get More</button>
      </div>
    )
  } else if (loading){
    return <div>Loading...</div>
  } else if(error){
    return<div><p>{error.message}</p></div>
  }
};


export default Home;