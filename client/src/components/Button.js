import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import queries from '../queries';


const Button = (props) => {
  const [buttonText, setButtonText] = useState("Bin!")
  const [updateImage]=useMutation(queries.UPDATE_IMG);
  const handleButton = (x) => {
      if(x.binned==false){
        {updateImage({variables:{
          "id": x.id,
          "url": x.url,
          "posterName": x.posterName,
          "description": x.description,
          "userPosted": x.userPosted,
          "binned": true
      }})}
      alert("Binned Succesfully!")
      } else if((x.binned == true)){
        {updateImage({variables:{
          "id": x.id,
          "url": x.url,
          "posterName": x.posterName,
          "description": x.description,
          "userPosted": x.userPosted,
          "binned": false
      }})}
      alert("Unbinned Succesfully!")
      } else{
        alert("error")
      }
    }
  if(props.element.binned==false){
    return (
  <div>    
      <button className = "binnedButton" onClick={() => {handleButton(props.element)}}>Bin!</button>  
  </div>

  )
          
}else{
  return(
      <div>    
        <button className = "binnedButton" onClick={() => {handleButton(props.element)}}>Unbin!</button>  
  </div>
  )
}
}

export default Button;