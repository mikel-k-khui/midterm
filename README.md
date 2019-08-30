# Smart To do list
**Listify** - we categorize your tasks, so you don’t have to.

*Our smart algorithm does the heavy lifting for your to-do lists.*

## Final Product

Key features:
1) Guests receives a cookie after adding a task and can return to register within 7 days. 
  *This provides the convenience to add tasks immediately without the lengthy sign-up*
2) Tasks are automatically added to one of the to-do lists based on IAB taxonomy with an easy option to reclass to another to-do list.
  *The ParallelDot text classification API does the thinking for our users*
3) Users stays logged in for 7 days without having or after they logout.

### Mobiel View
#### [Wireframe of landing page - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/01%20desktop_view.png)
#### [Wireframe of quick edit option - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/01%20desktop_view.png)
#### [Landing page - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/01%20desktop_view.png)
#### [Task added - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/02%20tablet_view.png)
#### [To-do list rendering - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/03%20mobile_view.png)
#### [Register - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/04%20input_error.png)
#### [Edit options - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/04%20input_error.png)

### Desktop View
#### [Wireframe - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/01%20desktop_view.png)
#### [Landing page - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/01%20desktop_view.png)
#### [Task added - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/02%20tablet_view.png)
#### [To-do list rendering - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/03%20mobile_view.png)
#### [Register - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/04%20input_error.png)
#### [Edit options - Listify](https://github.com/mikel-k-khui/tweeter/blob/master/docs/04%20input_error.png)

## Project Setup

### Dependencies

- bcrypt
- body-parser
- chalk
- cookie-parser
- cookie-session
- dotenv
- ejs
- express
- method-override
- morgan
- node-sass-middleware
- paralleldots
- pg
- pg-native
- spectre.css
- nodemon *devDependencies*

### Setting Up

A step by step series of examples that tell you how to get a development env running

Download the files to your repository

```
1. Create your own empty repo on GitHub
2. Clone this repository (<mark>do not fork!</mark>)
  - When cloning, specify a different folder name that is relevant to your project
3. Remove the git remote: `git remote rm origin`
4. Add a remote for your origin: `git remote add origin <your github repo URL>`
5. Push to the new origin: `git push -u origin master`
```

### Installing
Create the .env file

Update the .env file with the correct local information
```
For example,
 username: `labber` 
 password: `labber` 
 database: `to-do-list`
```

Request an api key from ParallelDots
```
https://user.apis.paralleldots.com/login 
```

Install dependencies:
```
npm i
```

Fix to binaries for sass
```
npm rebuild node-sass
```

Start up the localhost server.  Default port is 8080.
Note: nodemon is used, so you should not have to restart your server
```
npm run local
```

Open a new browser window and enter the local host with your port.  Chrome is preferred.
```
http://localhost:8080/
```

## Built With

* [Spectre](https://picturepan2.github.io/spectre/) - The web framework used
* [ParallelDots](https://www.paralleldots.com/text-classification) - Text Classification function
* [Postman](https://www.getpostman.com/) - For testing RESTful APIs

## Contributing

As this is a student project there is currently no process for submitting pull requests.

## Versioning

* [SemVer](http://semver.org/) for versioning: version 1.0.0.

## Authors

* **Russell McWhae** - *Initial work* - [Lighthouse Labs](https://github.com/PurpleBooth)
* **Michael Chui** - *Initial work* - [Lighthouse Labs](https://github.com/PurpleBooth)s

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

