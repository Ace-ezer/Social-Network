const SocialNetwork = artifacts.require('SocialNetwork.sol');

contract('SocialNetwork', async ([deployer, author, tipper]) => {
    let socialNetwork;

    before(async () => {
        socialNetwork = await SocialNetwork.deployed();
    });

    describe('Dummmy Test', async() => {
        it('deploys Successfully', async () => {
            const address = await socialNetwork.address;
    
            assert.notEqual(address,0x0);
            assert.notEqual(address,'');
            assert.notEqual(address,null);
            assert.notEqual(address,undefined);
        });
    
        it('has a name', async () => {
            assert.equal(await socialNetwork.name(), "GurutvaKarshan Sharma");
        });
    });

    describe('posts', async () => {
        let result;
        let postCount;

        before(async () => {
            result =  await socialNetwork.createPost('First post', {from: author});
            postCount = await socialNetwork.postCount();
        });

        it('creates a post', async () => {

           assert.equal(postCount, 1);

           const event = result.logs[0].args;
           assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct');
           assert.equal(event.content, 'First post', 'content is correct');
           assert.equal(event.tipAmount, '0', 'Tip amt is correct');
           assert.equal(event.author, author, 'author is correct.');
        });

        it('list posts', async () => {
            const post = await socialNetwork.posts(postCount);

            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(post.content, 'First post', 'content is correct');
            assert.equal(post.tipAmount, '0', 'Tip amt is correct');
            assert.equal(post.author, author, 'author is correct.');
        });

        it('allows users to tip posts', async () => {
            // Track author balance before purchase
            let oldAuthorBalance;
            oldAuthorBalance = await web3.eth.getBalance(author);
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

            result = await socialNetwork.tipPost(postCount, {from: tipper, value: web3.utils.toWei('1', 'Ether') });

            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct');
            assert.equal(event.content, 'First post', 'content is correct');
            assert.equal(event.tipAmount, '1000000000000000000', 'Tip amt is correct');
            assert.equal(event.author, author, 'author is correct.');

            // Track updated balance
            let newAuthorBalance;
            newAuthorBalance = await web3.eth.getBalance(author);
            newAuthorBalance = new web3.utils.BN(newAuthorBalance);

            let tipAmount;
            tipAmount = await web3.utils.toWei('1','Ether');
            tipAmount = new web3.utils.BN(tipAmount);

            const expectedBalance = oldAuthorBalance.add(tipAmount);
            assert.equal(newAuthorBalance.toString(), expectedBalance.toString());

            // Tries to tip Post that does not exists
            //await socialNetwork.tipPost(99, {from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        });
    });
});