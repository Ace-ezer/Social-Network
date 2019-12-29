import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json';
import Navbar from'./Navbar';
import Main from './Main';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true
    }
    this.createPost = this.createPost.bind(this);
    this.tipPost = this.tipPost.bind(this);
  }

  async componentWillMount() {
    await this.loadWeb3();
    console.log("I am called");
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert("Non-ethereum Browser detected. You should consider trying MetaMask!");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({
      account: accounts[0]
    });

    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkId];
    if(networkData) {
      // Load Contract
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address);
      this.setState({ socialNetwork: socialNetwork });

      // Load post count
      const postCount = await socialNetwork.methods.postCount().call();
      this.setState({ postCount: postCount });

      // Load posts
      for(var i = 1; i<= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call();
        this.setState({
          posts: [...this.state.posts, post]
        });
      }

      // Sort posts. Show highest on top
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount)
      });
      this.setState({loading: false});

    } else {
        window.alert('SocialNetwork contract not deployed to detected network.');
    }
  }

  createPost(content) {

    this.setState({ loading: true });
    this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account })
    .on('transactionHash', (hash) => {
        console.log(hash);
        this.setState({ loading: false });
    })
    .on('receipt', receipt => {
      console.log(receipt); 
    })
    .on('error', error => {
      console.log("Transaction failed");
      this.setState({ loading: false });
    });

  }

  tipPost(id, tipAmount) {
      this.setState({ loading: true});
      this.state.socialNetwork.methods.tipPost(id).send({from: this.state.account, value: tipAmount})
      .once('transactionHash', hash => {
          this.setState({loading: false});
      })
      .on('error', err => console.log("failed"));
  }

  render() {
    console.log("In render "+this.state.loading);

    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading? (
          <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
        ) :(
        <Main 
          posts={this.state.posts}   
          createPost={this.createPost}
          tipPost={this.tipPost}
        />
        )}
      </div>
    );
  }
}

export default App;
