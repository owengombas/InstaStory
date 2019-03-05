# Instagram story fetcher
It fetchs the instagram private API to get the stories of speciefied users and it sends updates to the client using socket.io.   
You can subscribe to story change updates with websockets (socket.io) (`StoryWs.ts`).  
A list of users is already provided for testing.  
This version doesn't 

## How it works ?
It makes requests that your browser make it on the instagram. Insta just need a SessionID cookie that can be retrieved by a login request (st program start). After that you can do wathever you want, you just need to have a query_hash that doesn't change on the time, it specify wich content you are trying to retrieve (it's a constant because it doesn't change). Instagram doesn't detects "slow spam", you can easily fetch stories of hundreds of accounts each 10 secondes wihout problems and send it to a subsciber by socket.io or vanilla ws.

## Login
You need to enter a username and a password of an account to the `InstagramService.ts` because we need a SessionID to perform requests to the Instagram private API.  
In this version a test account is already set. If might doesn't works because you are in a another country and Instagram detects suspect IP. So you need to use your account or a new account that you've created.

## License
MIT - Owen Calvin
