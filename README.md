Dashboard
=========

This project is inspired by the (soon-to-be-shutdown) iGoogle page.
It contains a static html page and some javascript + css to make it look better.
This will become a node.js + couchdb driven application that you can configure and (of course) use.

It will be possible to create an account, login and customize/add/delete the widgets and the background images, re-arrange them and use them to organize e.g. rss-feeds, todo-lists and all kinds of things you can think of.

Getting started
---------------

Dependencies: You will need `npm` (node.js) and `couchdb`.

To get started, simply clone this repository and call:

```
cp settings.json.template settings.json # Create your own settings.json from the template
vi settings.json # Configure it ;-)
npm install # Install node.js dependencies
npm start # Start the node.js application.
```


SSL
---

In order to use SSL, you need a (self-signed) ssl certificate.
I provide a simple shellscript to create a self-signed one:

```
cd snakeoil && ./generateSnakeoil.sh
```

Make sure to set up the cert + its private key in your `settings.json`.