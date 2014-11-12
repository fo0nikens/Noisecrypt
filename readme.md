﻿# Charme

Charme is a distributed and open source social network. In contrast to current social networks you can save your user data on your own server or a server of your choice. Furthermore messages and private information requests are end-to-end encrypted. Client and server are two seperate projects to avoid the server from having access to decrypted information. Client-Server and server-server communication happens via JSON.

**Warning: This is for preview puposes only. This version is NOT stable and NOT secure yet. It will be released after it has been completed and peer reviewed. This will probably take some years.**

The project is splitted into the following sub projects:



<table>
    <tr>
        <td>Path</td>
        <td>Description</td>

    </tr>

   <tr>
        <td>/doc</td>
        <td>Developer Documentation</td>

    </tr>

        <tr>
        <td>/android</td>
        <td>Android App Files</td>

    </tr>

     <tr>
        <td>/demo</td>
        <td>Screenshots and promotion images.</td>

    </tr>

      <tr>
        <td>/jsclient</td>
        <td>HTML5 based client for Encrypted Communication</td>

    </tr>

     <tr>
        <td>/server</td>
        <td>Server for Encrypted Communication</td>

    </tr>

<tr>
        <td>/graph</td>
        <td>Visualisation tools</td>

    </tr>

    
  <tr>
        <td>/web (deprecated)</td>
        <td>Files of the old version.</td>

    </tr>
    
</table>

## Screenshot

![Screenshot](https://raw.github.com/mschultheiss/charme/dev/demo/screen2.png "Screenshot")

## Setup a client
  * Just copy the files in `/jsclient` on your server

## Setup a server




  * Make sure PHP5 and apache2 is installed on your machine
  * Install pecl if not done yet
    ```
    apt-get install php5-dev
    apt-get install make
    apt-get install php-pear
    apt-get install php5-curl
    ```
  * Install mongoDB via `pecl install mongo` and
    ```
    apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
    echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
    apt-get update
    apt-get install -y mongodb-org
    apt-get install php5-gd
    ```
   
  * Install gearman
    ```
    apt-get install gearman
    apt-get install gearman-job-server libgearman-dev
    pecl install gearman-1.0.3
    ```
  * Add gearman and mongodb to php.ini via:

    `nano /path/to/php.ini` To find the path run phpinfo(). Then add the lines
    ```
    extension=mongo.so
    extension=curl.so
    extension = gearman.so
    ```
    Also make sure `short_open_tag` is set to true in php.ini

   * Copy the files in `/server/charme` to `yourserver.com/charme`, so that req.php is acessable via `yourserver.com/charme/req.php`
   * Protect yourserver.com/charme/admin with a .htaccess file in production use!
   * make sure `yourserver.com/charme/log.txt` is writeable
   * Restart apache via `service apache2 restart`
   * Start gearman server via `nohup php hydra.php &` in `yourserver.com/charme` directory. If you do not do this, your  server will crash when sending messages :)
   * Always check /var/log/apache2/error.log when something is not working.



## Install a client
 * copy the files in the /client directory onto a (local) webserver and access via index.html
 * Please note that Firefox currently has some problems with the textbox for writing messages. Everything shoudl work fine in Chromium/Chrome however.

## Crypto

* We use a RSA/AES cryptosystem to encrypt messages and private data
* The private key is stored on a server, encrypted with a 20 digit passphrase.
* To validate public keys we will implement a Web-Of-Trust like key verification system, that checks if some/all friends of a user own the same public key of him in the background. You currently have to validate the public keys in the key manager in the client via Settings/Key Manager.

## How to Contribute?

* Write Code, generate Documentation, check Crypto Concepts
* Getting started: https://github.com/mschultheiss/Charme/wiki/Getting%20Started
* Ask questions here: https://groups.google.com/forum/?hl=de&fromgroups#!forum/charmeproject

You can develop modules that do not require much knowledge about the main infrastructure. Such include.
* An admin interface
* A map selector
* Find semantic information: Identify often used 
for example. Create a issue if you are interested in :)

## License
Charme is a distributed social network with end-to-end encryption

Copyright (C) 2014 Manuel Schultheiß

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.




## Recommended IDE
Sublime Text 3 with https://github.com/jdc0589/JsFormat plugin.

## Libraries

<table>
    <tr>
        <td>Name</td>
        <td>License</td>
        <td>Filepath</td>
    </tr>

    <tr>
        <td>mongodb.php from Jonathan H. Wage</td>
        <td>BSD</td>
        <td>/server/mongodb.php</td>
    </tr>
        <tr>
        <td>WideImage</td>
        <td>GNU LGPL 2.1. </td>
        <td>/lib/app/3rdparty/wideimage</td>
    </tr>
   <tr>
        <td>Tom Wu's RSA Library</td>
        <td> BSD license</td>
        <td>/jsclient/lib/crypto/</td>
    </tr>
   
    <tr>
        <td>jQuery(UI)</td>
        <td>MIT</td>
        <td>/lib/jq.js and lib/jqui.js</td>
    </tr>
        <tr>
        <td>nanoScroller</td>
        <td>MIT</td>
        <td>embedded in ui.css / ui.js (http://jamesflorentino.github.com/nanoScrollerJS/ for more information)</td>
    </tr>

       <tr>
        <td>nProgressBar</td>
        <td>MIT</td>
        <td>{lib|css}/nprogress.; https://github.com/rstacruz/nprogress</td>
    </tr>


     <tr>
        <td>Backbone.js</td>
        <td>MIT</td>
        <td>/lib/backbone.js</td>
    </tr>
     <tr>
        <td>moment.js</td>
        <td>MIT</td>
        <td>jsclient/lib/moment.js</td>
    </tr>
 <tr>
        <td>doTimeout</td>
        <td>MIT</td>
        <td>jsclient/lib/plugins.js</td>
    </tr>
 <tr>
        <td>autosize.js</td>
        <td>MIT</td>
        <td>jsclient/lib/plugins.js</td>
    </tr>

 <tr>
        <td>Gibberish AES</td>
        <td>MIT</td>
        <td>jsclient/lib/crypto/gibberish.js</td>
    </tr>

 <tr>
        <td>RequireJS</td>
        <td>MIT</td>
        <td>jsclient/lib/require.js</td>
    </tr>

     <tr>
        <td>Symfony (Autoloader)</td>
        <td>MIT</td>
        <td>server/charme/lib/App/ClassLoader</td>
    </tr>

  <tr>
        <td>Leaflet</td>
        <td>Custom</td>
        <td>jsclient/vendor/leaflet</td>
    </tr>



 <tr>
        <td>Tokenizing Autocomplete Text Entry</td>
        <td>MIT</td>
        <td>jsclient/lib/plugins.js</td>
    </tr>

 <tr>
        <td>QRCode.js</td>
        <td>MIT</td>
        <td>jsclient/lib/qrcode.min.js</td>
    </tr>





</table>

