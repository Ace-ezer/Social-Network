var SocialNetwork = artifacts.require('SocialNetwork.sol');

module.exports = (deployer) => {
    deployer.deploy(SocialNetwork);
}