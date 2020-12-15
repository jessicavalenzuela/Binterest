const { ApolloServer, gql } = require('apollo-server');
const uuid = require('uuid');
const lodash = require("lodash");

const bluebird = require("bluebird");
const redis = require("redis")
const client = redis.createClient();
const axios = require('axios')
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
client.on("error", function (err) {
    console.log("Error " + err);
});

//Queries & Mutations
const typeDefs = gql`
  type ImagePost {
    id: ID!
    url: String!
    posterName: String!
    description: String
    userPosted: Boolean!
    binned: Boolean!
}
  type Query {
    unsplashImages(pageNum: Int): [ImagePost]
    binnedImages: [ImagePost]
    userPostedImages: [ImagePost]
  }
  type Mutation {
    uploadImage(
      url: String!,
      description: String,
      posterName: String
      ): ImagePost
    updateImage(
      id: ID!
      url: String
      posterName: String
      description: String
      userPosted: Boolean
      binned: Boolean
    ): ImagePost
    deleteImage(id: ID!): ImagePost
  }
`;
//get unsplash image
async function getImage(pageNum){
  //if no pageNum provided start at 0;
  try{
    if(!pageNum){
      pageNum = 0;
    }
    
    //axios request
    const image = await axios.get(`https://api.unsplash.com/photos?client_id=TzJIQ7YOivBqn3EG4MMoFpRNK7FkdB6WREK8esBs3tA&page=${pageNum}`);
    const imageData = image.data;
    const images = [];

    for(const element of imageData){
      const splashImg = await client.getAsync(element.id)
      let binned = false;
      if(splashImg){
        binned = true;
      }
      let img = {
        id: element.id,
        url: element.urls.full,
        posterName: element.user.name,
        description: element.alt_description,
        userPosted: false,
        binned: binned,
      }
        images.push(img);
    }
      return images; 
    } catch(e) {
      console.log(e);
    }
}
//get binned images
async function getBinnedImages(){
  //LRANGE returns the specified elements of the list stored at key.
  let binned = await client.lrangeAsync("binned", 0, -1)
  try{
    const images = [];
    for(const element of binned) {
      const imageData = await client.getAsync(element);
      const imageObj = JSON.parse(imageData);
      //only push if an image is binned
      console.log(imageData)
      console.log(imageData.binned)
      if(typeof(imageObj)==='object'&&imageObj!==null){
        if(imageObj.binned==true){      
          images.push(imageObj)
        }
      }
    }
    console.log(images)
    return images;
  } catch(e){
    console.log(e);
  }
}

//get user posted images
async function getUserPostedImages(){
  let posts = await client.lrangeAsync("userpost", 0, -1)
  try{
    let images = [];
    for(let element of posts){
      // console.log(element)
      const imageData = await client.getAsync(element)
      const imageObj = JSON.parse(imageData)
      if(typeof(imageObj)==='object'&&imageObj!==null){
        if(imageObj.userPosted==true){
          images.push(imageObj)
        }
      }
    }
    return images;
  } catch(e){
    console.log(e);
  }
}

//Resolvers

const resolvers = {
  Query:{
    unsplashImages: (_, args) => getImage(args.pageNum),
    binnedImages: () => getBinnedImages(),
    userPostedImages: () => getUserPostedImages()
  },
  Mutation: {
    //=============================UPLOAD AN IMAGE=====================================
    uploadImage: async (_, args) =>{
      //error handling
      if(!args.url || !args.description || !args.posterName) throw `ERROR: must provide ${url}, ${description} and ${posterName}`
      if(typeof(args.url) !== "string" || typeof(args.description) !== "string" || typeof(args.posterName) !== "string") throw `ERROR ${args.url}, ${args.description} and ${args.posterName} must be a string`
      
      const imageData = {
        id:  uuid.v4(),
        url: args.url,
        description: args.description,
        posterName: args.posterName,
        userPosted: true,
        binned: false,
      };
      try{
        // await client.lpushAsync('userpost', JSON.stringify(imageData));
        await client.setAsync(imageData.id, JSON.stringify(imageData));
        await client.rpushAsync('userpost', imageData.id);
    } catch(e){
      console.log(e)
    }
  return imageData;

  },
    //===================================UPDATE AN IMAGE=================================
    updateImage: async (_, args) => {
      //error handling
      // if(!args.id || !args.url || !args.posterName || !args.description || !args.userPosted || !args.binned) throw `ERROR: all fields are required and cannot be left blank`

      let updatedImage = {
              id: args.id,
              url: args.url,
              posterName: args.posterName,
              description: args.description,
              userPosted: args.userPosted,
              binned: args.binned
          };

      const updatedImageData = JSON.stringify(updatedImage);
      let imageData = JSON.parse(await client.getAsync(args.id));
      console.log(imageData)
      try{
          //if binned
          if (args.binned == true){
            if (!imageData) {
              await client.setAsync(args.id, updatedImageData);
              if(args.binned) await client.rpushAsync('binned', args.id)
              return updatedImage;
            } else{
              await client.setAsync(args.id, updatedImageData);
              if (args.binned && !imageData.binned) await client.rpushAsync('binned', args.id);
              if (imageData.binned && !args.binned) await client.lremAsync('binned', 0, args.id);
            }
          } 
          //if userposted
          if(args.userPosted==true) {
            if (!imageData) {
              await client.setAsync(args.id, updatedImageData);
              if (args.userPosted) await client.rpushAsync('userpost', args.id);
              return updatedImage;
            }else{
              await client.setAsync(args.id, updatedImageData);
              if (args.userPosted && !imageData.userPosted) await client.rpushAsync('userpost', id);
              if (imageData.userPosted && !args.userPosted) await client.lremAsync('userpost', 0, args.id);

            }
            return updatedImage;
          }
        } catch(e){
          console.log(e)
        }          
          await client.delAsync(args.id);
          if (imageData.userPosted) await client.lremAsync('userpost', 0, args.id);
          if (imageData.binned) await client.lremAsync('binned', 0, args.id);
          return updatedImage;
    },
    //===================================DELETE AN IMAGE=================================
    deleteImage: async (_, args) => {
      if(!args.id) throw `ERROR: please provide an id`
      let imageData = JSON.parse(await client.getAsync(args.id));
      try{
        await client.lremAsync('userpost', 0, args.id);
        await client.lremAsync('binned', 0, args.id);

        return imageData
      }catch(e){
        console.log(e)
        throw `not found`
      }
    }
  }
}


const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url} 🚀`);
});
