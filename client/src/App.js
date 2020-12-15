import './App.css';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';


import Home from "./components/Home"
import NewPost from "./components/NewPost"
import MyPost from "./components/MyPost"
import MyBin from "./components/MyBin"
import Navbar from "./components/Navbar";
import NotFound from "./components/NotFound"
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link:new HttpLink({
    uri: 'http://localhost:4000'
  })
})

const App = ()=> {
  return (
  <ApolloProvider client={client}>
    <Router>
      <Navbar />
      <Switch>
        <Route exact path = "/" component ={Home}></Route>
        <Route exact path = "/my-bin" component = {MyBin}></Route>
        <Route exact path = "/my-post" component = {MyPost}></Route>
        <Route exact path = "/new-post" component = {NewPost}></Route>
        <Route path='*' exact={true} component={NotFound} />
      </Switch>
    </Router>
  </ApolloProvider>
  );
}

export default App;
