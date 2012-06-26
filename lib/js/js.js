/**
#
#Copyright (c) 2011-2012 Razortooth Communications, LLC. All rights reserved.
#
#Redistribution and use in source and binary forms, with or without modification,
#are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
#
#    * Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
#
#    * Neither the name of Razortooth Communications, LLC, nor the names of its
#      contributors may be used to endorse or promote products derived from this
#      software without specific prior written permission.
#
#THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
#ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
#ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

/** 
 * Imports
 */
var createServer = require('http').createServer,
	util = require('util'),
	assert = require('assert'), 
	fs = require('fs'),
	events = require('events'),
	url = require('url');

/** 
  * Attributions
  */
/** 
  js.js a small server for big ideas, offering a small template starter project, 

  - fu.js: from the node_chat demo, source of major inspiration
  - socket.io: to handle socket oriented communication
  - node.js: for the runtime
 */
var JS = exports.JS = function() {
	this.CONFIG = {
		'HTTPWS_PORT':8000,
		'LISTEN_ON_ADDRESS': '0.0.0.0',
		'VERSION_TAG':'0.1.1',
		'VERSION_DESCRIPTION':'NPM package for Jumbosocket, affectionately known as JS.js',
	};
	this.ROUTE_MAP = {}; // Populate this with the App Routes you set up
	this.RE_MAP = {}; // Populate this with the App Routes you set up
	this.address = '0.0.0.0'; // If you don't want this exposed on a network facing IP address, change to 'localhost'
	this.channels = {}; // XXX Should move to using socket.io namespaces
	this.DEFAULT_JS_HANDLER = defaultJSHandler;
	this.server; 
	this.js_handler; // Set this to some handler you want to use for Socket.IO, otherwise, default to defaultJSHandler
};
// module.exports = JS;
// XXX Not quite sure why I'd do this
// var JS = exports; 


DEBUG = true;
var INTERNAL_SERVER_ERROR = 'Internal Server Error!  Oh pshaw\n';
var NOT_FOUND_ERROR = '404 Error :(  I am sad.  \n';



if (DEBUG) {
	console.log("TURN OFF DEBUG for Production");
}

JS.prototype.get = function(path, handler) {
	this.ROUTE_MAP[path] = handler;
};

JS.prototype.getterer = function(path, handler) {
	var repath = RegExp(path);
	this.RE_MAP[path] = repath;
	// console.log(regexMap);
	this.get(repath, handler);
}

// Static Variables
JS.prototype.mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension : function(ext, fallback) {
    return this.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
  },

  // List of most common mime-types, stolen from Rack.
  // XXX: Can we refactor this out, replace with an NPM module or something more compact?
  TYPES : { ".3gp"   : "video/3gpp"
          , ".a"     : "application/octet-stream"
          , ".ai"    : "application/postscript"
          , ".aif"   : "audio/x-aiff"
          , ".aiff"  : "audio/x-aiff"
          , ".asc"   : "application/pgp-signature"
          , ".asf"   : "video/x-ms-asf"
          , ".asm"   : "text/x-asm"
          , ".asx"   : "video/x-ms-asf"
          , ".atom"  : "application/atom+xml"
          , ".au"    : "audio/basic"
          , ".avi"   : "video/x-msvideo"
          , ".bat"   : "application/x-msdownload"
          , ".bin"   : "application/octet-stream"
          , ".bmp"   : "image/bmp"
          , ".bz2"   : "application/x-bzip2"
          , ".c"     : "text/x-c"
          , ".cab"   : "application/vnd.ms-cab-compressed"
          , ".cc"    : "text/x-c"
          , ".chm"   : "application/vnd.ms-htmlhelp"
          , ".class"   : "application/octet-stream"
          , ".com"   : "application/x-msdownload"
          , ".conf"  : "text/plain"
          , ".cpp"   : "text/x-c"
          , ".crt"   : "application/x-x509-ca-cert"
          , ".css"   : "text/css"
          , ".csv"   : "text/csv"
          , ".cxx"   : "text/x-c"
          , ".deb"   : "application/x-debian-package"
          , ".der"   : "application/x-x509-ca-cert"
          , ".diff"  : "text/x-diff"
          , ".djv"   : "image/vnd.djvu"
          , ".djvu"  : "image/vnd.djvu"
          , ".dll"   : "application/x-msdownload"
          , ".dmg"   : "application/octet-stream"
          , ".doc"   : "application/msword"
          , ".dot"   : "application/msword"
          , ".dtd"   : "application/xml-dtd"
          , ".dvi"   : "application/x-dvi"
          , ".ear"   : "application/java-archive"
          , ".eml"   : "message/rfc822"
          , ".eps"   : "application/postscript"
          , ".exe"   : "application/x-msdownload"
          , ".f"     : "text/x-fortran"
          , ".f77"   : "text/x-fortran"
          , ".f90"   : "text/x-fortran"
          , ".flv"   : "video/x-flv"
		  , ".apk"	 : "application/vnd.android.package-archive"
          , ".for"   : "text/x-fortran"
          , ".gem"   : "application/octet-stream"
          , ".gemspec" : "text/x-script.ruby"
          , ".gif"   : "image/gif"
          , ".gz"    : "application/x-gzip"
          , ".h"     : "text/x-c"
          , ".hh"    : "text/x-c"
          , ".htm"   : "text/html"
          , ".html"  : "text/html"
          , ".ico"   : "image/vnd.microsoft.icon"
          , ".ics"   : "text/calendar"
          , ".ifb"   : "text/calendar"
          , ".iso"   : "application/octet-stream"
          , ".jar"   : "application/java-archive"
          , ".java"  : "text/x-java-source"
          , ".jnlp"  : "application/x-java-jnlp-file"
          , ".jpeg"  : "image/jpeg"
          , ".jpg"   : "image/jpeg"
          , ".js"    : "application/javascript"
          , ".json"  : "application/json"
          , ".log"   : "text/plain"
          , ".m3u"   : "audio/x-mpegurl"
          , ".m4v"   : "video/mp4"
          , ".man"   : "text/troff"
          , ".mathml"  : "application/mathml+xml"
          , ".mbox"  : "application/mbox"
          , ".mdoc"  : "text/troff"
          , ".me"    : "text/troff"
          , ".mid"   : "audio/midi"
          , ".midi"  : "audio/midi"
          , ".mime"  : "message/rfc822"
          , ".mml"   : "application/mathml+xml"
          , ".mng"   : "video/x-mng"
          , ".mov"   : "video/quicktime"
          , ".mp3"   : "audio/mpeg"
          , ".mp4"   : "video/mp4"
          , ".mp4v"  : "video/mp4"
          , ".mpeg"  : "video/mpeg"
          , ".mpg"   : "video/mpeg"
          , ".ms"    : "text/troff"
          , ".msi"   : "application/x-msdownload"
          , ".odp"   : "application/vnd.oasis.opendocument.presentation"
          , ".ods"   : "application/vnd.oasis.opendocument.spreadsheet"
          , ".odt"   : "application/vnd.oasis.opendocument.text"
          , ".ogg"   : "application/ogg"
          , ".p"     : "text/x-pascal"
          , ".pas"   : "text/x-pascal"
          , ".pbm"   : "image/x-portable-bitmap"
          , ".pdf"   : "application/pdf"
          , ".pem"   : "application/x-x509-ca-cert"
          , ".pgm"   : "image/x-portable-graymap"
          , ".pgp"   : "application/pgp-encrypted"
          , ".pkg"   : "application/octet-stream"
          , ".pl"    : "text/x-script.perl"
          , ".pm"    : "text/x-script.perl-module"
          , ".png"   : "image/png"
          , ".pnm"   : "image/x-portable-anymap"
          , ".ppm"   : "image/x-portable-pixmap"
          , ".pps"   : "application/vnd.ms-powerpoint"
          , ".ppt"   : "application/vnd.ms-powerpoint"
          , ".ps"    : "application/postscript"
          , ".psd"   : "image/vnd.adobe.photoshop"
          , ".py"    : "text/x-script.python"
          , ".qt"    : "video/quicktime"
          , ".ra"    : "audio/x-pn-realaudio"
          , ".rake"  : "text/x-script.ruby"
          , ".ram"   : "audio/x-pn-realaudio"
          , ".rar"   : "application/x-rar-compressed"
          , ".rb"    : "text/x-script.ruby"
          , ".rdf"   : "application/rdf+xml"
          , ".roff"  : "text/troff"
          , ".rpm"   : "application/x-redhat-package-manager"
          , ".rss"   : "application/rss+xml"
          , ".rtf"   : "application/rtf"
          , ".ru"    : "text/x-script.ruby"
          , ".s"     : "text/x-asm"
          , ".sgm"   : "text/sgml"
          , ".sgml"  : "text/sgml"
          , ".sh"    : "application/x-sh"
          , ".sig"   : "application/pgp-signature"
          , ".snd"   : "audio/basic"
          , ".so"    : "application/octet-stream"
          , ".svg"   : "image/svg+xml"
          , ".svgz"  : "image/svg+xml"
          , ".swf"   : "application/x-shockwave-flash"
          , ".t"     : "text/troff"
          , ".tar"   : "application/x-tar"
          , ".tbz"   : "application/x-bzip-compressed-tar"
          , ".tcl"   : "application/x-tcl"
          , ".tex"   : "application/x-tex"
          , ".texi"  : "application/x-texinfo"
          , ".texinfo" : "application/x-texinfo"
          , ".text"  : "text/plain"
          , ".tif"   : "image/tiff"
          , ".tiff"  : "image/tiff"
          , ".torrent" : "application/x-bittorrent"
          , ".tr"    : "text/troff"
          , ".txt"   : "text/plain"
          , ".vcf"   : "text/x-vcard"
          , ".vcs"   : "text/x-vcalendar"
          , ".vrml"  : "model/vrml"
          , ".war"   : "application/java-archive"
          , ".wav"   : "audio/x-wav"
          , ".wma"   : "audio/x-ms-wma"
          , ".wmv"   : "video/x-ms-wmv"
          , ".wmx"   : "video/x-ms-wmx"
          , ".wrl"   : "model/vrml"
          , ".wsdl"  : "application/wsdl+xml"
          , ".xbm"   : "image/x-xbitmap"
          , ".xhtml"   : "application/xhtml+xml"
          , ".xls"   : "application/vnd.ms-excel"
          , ".xml"   : "application/xml"
          , ".xpm"   : "image/x-xpixmap"
          , ".xsl"   : "application/xml"
          , ".xslt"  : "application/xslt+xml"
          , ".yaml"  : "text/yaml"
          , ".yml"   : "text/yaml"
          , ".zip"   : "application/zip"
          }
};
JS.prototype.staticHandler = function (filename) {
  var body, headers;
  var content_type = this.mime.lookupExtension(extname(filename));

  function loadResponseData(callback) {
    if (body && headers && !DEBUG) {
      callback();
      return;
    }

    console.log("loading " + filename + "...");
    fs.readFile(filename, function (err, data) {
      if (err) {
        console.log("Error loading " + filename);
		console.log("Error loading file: " + filename + " because of " + err)
      } else {
        body = data;
        headers = { "Content-Type": content_type
                  , "Content-Length": body.length
                  };
        if (!DEBUG) headers["Cache-Control"] = "public";
        // console.log("static file " + filename + " loaded");
        callback();
      }
    });
  }

  return function (req, res) {
    loadResponseData(function () {
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    });
  }
};

JS.prototype.listenHttpWS = function (host, port) {
	var self = this;
	if (!port) port = this.CONFIG['HTTPWS_PORT'];
	if (!host) host = this.CONFIG['LISTEN_ON_ADDRESS'];
	console.log('Listening on host: ' + host + ' port: ' + port);
	JS.server.listen(port, host, function() {
		JS.address = JS.server.address().address;
		if (JS.address == '0.0.0.0') {
			getNetworkIP(function (error, ip) {
			    if (!error) {
					JS.address = ip;
					console.log('Started server on IP address: ', JS.address);
			    } else {
					console.log('error:', error);
				}
			}, false); 
		  }
		console.log("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
	});
};

JS.prototype.close = function () { 
	JS.server.close(); 
};

JS.prototype.listenSocketIO = function(servicehandler) {
	if (JS.server) {
		try { // Try not to let this fall out the bottom if we have an issue with the service handler implementation or any funky stuff with socket.io
			if (!servicehandler) servicehandler = defaultJSHandler;
			JS.io.sockets.on('connection', servicehandler);
			console.log("Set connection to socket.io");
		} catch(e) {
			console.error("Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message);
		}
	} else {
		console.error("server global is not defined");
	}
};

JS.prototype.create = function(host, port) {
	var self = this;
	console.log('Creating JS with config: ' + self.CONFIG);
	if (host) self.CONFIG['LISTEN_ON_ADDRESS'] = host;
	if (port) self.CONFIG['HTTPWS_PORT'] = port;
	
	JS.server = createServer(function(req, res) {
			try {
				if (req.method === "GET" || req.method === "HEAD") {
					var handler;
					handler = self.ROUTE_MAP[url.parse(req.url).pathname];
					if (!handler) {
						for (var expr in self.RE_MAP) {
							console.log('Test ' + req.url + ' against expr: ' + expr);
							if (self.RE_MAP[expr] && self.RE_MAP[expr].test(url.parse(req.url).pathname)) {
								handler = self.ROUTE_MAP[self.RE_MAP[expr].toString()];
								break;
							} else {
								handler = notFound;
							}
						}
					}
				}

				res.simpleText = function (code, body) {
			      	res.writeHead(code, { "Content-Type": "text/plain"
										, "Content-Length": body.length
								});
					res.end(body);
				};

				res.simpleJSON = function (code, obj) {
					var body = JSON.stringify(obj);
					res.writeHead(code, { "Content-Type": "text/json"
										, "Content-Length": body.length
								});
					res.end(body);
				};

				handler(req, res);
			} catch(e) {
				console.error("Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message);
				internalServerError(req, res);
			}

	});
	console.log('Setting up socket.io namespace');
	var io = require('socket.io').listen(JS.server);
	JS.io = io; // XXX Funky, but I don't see a clean way require the io namespace inside the application wrapper.

	// Setup default handler if needed
	if (!JS.js_handler) {
		JS.js_handler = JS.DEFAULT_JS_HANDLER;
	}
};

/**
  * JumboSocket Default Routes
 */
/*
JS.get("/", JS.staticHandler("index.html"));

this.get("/about", function(req, res) {
	var body = this.CONFIG['VERSION_TAG'] + ': ' + this.CONFIG['VERSION_DESCRIPTION'];
	res.writeHead(200, {
	  'Content-Length': body.length,
	  'Content-Type': 'text/plain'
	});
	res.write(body);
	res.end();
});

this.getterer("/css/[\\w\\.\\-]+", function(req, res) {
	return this.staticHandler("." + url.parse(req.url).pathname)(req, res);
});

this.getterer("/js/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
});

this.getterer("/images/[\\w\\.\\-]+", function(req, res) {
	return this.staticHandler("." + url.parse(req.url).pathname)(req, res);
});
*/


/**
  * Utility Routines
  */
function extname (path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
}

/** 
	getNetworkIP()
	
	Similar problem and similar answer found on python, drop down to os process and figure it out
	by sniffing off ifconfig.  May be tricky if you are looking for wireless interface, so probably
	would need to grab my code from python to remember what I did there that was clever.
	
	Code Borrowed from contribution by pumbaa80
	Thanks Stackoverflow: http://stackoverflow.com/posts/3742915/revisions
**/
var getNetworkIP = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

    var exec = require('child_process').exec;
    var cached;    
    var command;
    var filterRE;

    switch (process.platform) {
    // TODO: implement for OSs without ifconfig command
    case 'darwin':
         command = 'ifconfig';
         filterRE = /\binet\s+([^\s]+)/g;
         // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
         break;
    default:
         command = 'ifconfig';
         filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
         // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
         break;
    }

    return function (callback, bypassCache) {
         // get cached value
        if (cached && !bypassCache) {
            callback(null, cached);
            return;
        }
        // system call
        exec(command, function (error, stdout, sterr) {
            var ips = [];
            // extract IPs
            var matches = stdout.match(filterRE);
            // JS has no lookbehind REs, so we need a trick
            for (var i = 0; i < matches.length; i++) {
                ips.push(matches[i].replace(filterRE, '$1'));
            }

            // filter BS
            for (var i = 0, l = ips.length; i < l; i++) {
                if (!ignoreRE.test(ips[i])) {
                    //if (!error) {
                        cached = ips[i];
                    //}
                    callback(error, ips[i]);
                    return;
                }
            }
            // nothing found
            callback(error, null);
        });
    };
})();

/**
  * Error Routines
  */
function internalServerError(req, res) { // XXX Add a nicely formatted version!
  // XXX For some reason, this always returns garbage: 22 Internal Server Error.  Oh psh
  // Need to debug this!
  res.writeHead(500, {  'Content-Type': 'text/plain',
						'Content-Length': INTERNAL_SERVER_ERROR.length
                     });
  res.write(INTERNAL_SERVER_ERROR);
  util.log(sys.inspect(getMap, true, null)); // XXX Dump the getMap to the logs
  res.end();
}

function notFound(req, res) {
  res.writeHead(404, {  'Content-Type': 'text/plain',
						'Content-Length': NOT_FOUND_ERROR.length
                     });
  res.write(NOT_FOUND_ERROR);
  util.log(util.inspect(getMap, true, null)); // XXX Dump the getMap to the logs
  res.end();
}

/**
 * This is a basic handler.  XXX Clean it up.  It's messy and not clear what is the purpose.
 * For now, just use it as is.  It pongs back messages.
 *
 */
function defaultJSHandler(client) {
	// 
	// PLUG IN YOUR OWN SOCKET.IO HANDLERS HERE
	// This can be removed when you decide you want it to do something useful
	//
	console.log("*********** default listenSocketIO handler ******************");	
	client.on('message', function(data) {
		if (data) {
			console.log('socket client.on message data = ' + JSON.stringify(data) + '  at ' + (new Date().getTime()));
			JS.io.sockets.send("pong - " + JSON.stringify(data));
 		} else { console.err("empty message"); } // Ignore empty data messages
	});	
	// XXX This dies with socket.io v0.7 .  Handling of broadcast is different.
	setInterval(function() { // This could be a tweet stream, game status updates, robot messages
		console.log('sending something on the socket');
		if (JS.io) { // XXX Shouldn't this exist?
			JS.io.sockets.send("Ya'll ready for this");
		}
	}, 10000);
}



// sys.inherits(JS, events.EventsEmitter);