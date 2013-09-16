Dashboard
=========

This project is inspired by the (soon-to-be-shutdown) iGoogle page.
It contains a simple static html page and some css magic to make it look a little bit better.
(Also i have started the javascript stuff using jquery ui.)

This will later become a simple and configurable nodejs application,
that will be extendable with all kinds of widgets like rss readers.

Getting started
---------------

To get started with it, simply clone and call:

```
cp settings.json.template settings.json
vi settings.json # Do not forget to configure it ;-)
npm install
npm start
```


SSL
---

In order to use SSL, you need a (self-signed) ssl certificate.
I provide a simple shellscript to create a self-signed one:

```
cd snakeoil && ./generateSnakeoil.sh
```

Make sure to set up the cert + its private key in your `settings.json`.