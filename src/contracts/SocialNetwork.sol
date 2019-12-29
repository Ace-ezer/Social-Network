pragma solidity ^0.5.0;

contract SocialNetwork {

    event PostCreated(  
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(  
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    string public name;
    mapping(uint => Post) public posts;
    uint public postCount = 0;

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    constructor() public {
        name = "GurutvaKarshan Sharma";
    }

    function createPost(string memory _content) public {

        // Require valid content
        require(bytes(_content).length > 0, 'Content must not be empty.');
        // Increment post count
        postCount++;
        // Create the post
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
        // Trigger event
        emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function tipPost(uint _id) public payable {

        //Check for valid id
        require(_id > 0 && _id<= postCount, '');
        // Fetch the post
        Post memory _post = posts[_id];
        // Fetch the author
        address payable _author = _post.author;
        // Pay the author
        address(_author).transfer(msg.value);
        // Increment the tip amount
        _post.tipAmount += msg.value;
        // Update the post
        posts[_id] = _post;
        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}