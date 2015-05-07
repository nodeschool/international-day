#!/usr/bin/env node

"use strict";

var fs = require("fs");

var OWNER = "nodeschool";
var REPO = "international-day";

var TIMEOUT = 4000;

var CACHE_FILE_NAME = __dirname + "/.cache.json";

var settings = require("./package.json");

var util = require("util");
var http = require("http");
var https = require("https");

var concat = require("concat-stream");

var geocoderProvider = "google";
var httpAdapter = "https";

var extra = {
    apiKey: process.env["GEOCODER_KEY"] || "",
    formatter: null
};

var geocoder = require("node-geocoder")(geocoderProvider, httpAdapter, extra);
var cache = {};

try {
    cache = require(CACHE_FILE_NAME);
} catch (e) {}

function getProperty(line, name, result) {
    var regExp = new RegExp("^\\s*" + name + "\\s*(\\:| )\\s*(.*)", "i");
    var res = regExp.exec(line);

    if (res) {
        var data = /^@?(.*)/.exec(res[2]);
        result[name] = data[1];
    }
}

function extractInfo(body) {
    if (body.match(/^\[no\-enroll\]/)) {
        return null;
    }

    var lines = body.split("\n");
    var name = /(.*)(\r?)$/.exec(lines.shift())[1];
    var nameSet = /([^,]*)(\s*,\s*(.*)\s*)/.exec(name);

    if (!nameSet) {
        nameSet = ["", "", "", /^\s*(.*)\s*$/.exec(name)[1]];
    }

    var owner = /(.*)(\r?)$/.exec(lines.shift())[1];
    var result = {
        name: name,
        owner: owner,
        city: nameSet && nameSet[1],
        country: nameSet && nameSet[3]
    };

    lines.forEach(function (line) {
        getProperty(line, "github", result);
        getProperty(line, "chapter", result);
        getProperty(line, "skype", result);
        getProperty(line, "twitter", result);
        getProperty(line, "email", result);
        getProperty(line, "event", result);

        if (result.email) {
            result.email = result.email
                .replace(/\s*\[\s*at\s*\]\s*/ig, "@")
                .replace(/gmail\s*$/ig, "gmail.com");
        }
    });

    return result;
}

function geocode(name, callback) {
    geocoder.geocode(name, function (err, res) {
        if (err || res.length === 0) {
            callback(err, { lat: 0, lng: 0});
            return;
        }

        callback(err, { lat: res[0].latitude, lng: res[0].longitude });
    });
}

function createChapter(events, comment, callback) {
    var info = extractInfo(comment.body);

    if (!info) {
        callback(null);
    } else {
        var cached = cache[info.name];

        info.url = info.chapter || util.format("http://nodeschool.io/%s", info.city.replace(/\s/, "-").toLowerCase());
        info.event = events[info.name.toLowerCase()] || events[info.city.toLowerCase()];

        if (cached) {
            info.lat = cached.lat;
            info.lng = cached.lng;

            callback(null, info);
        } else {
            geocode(info.name.toLowerCase(), function (error, geo) {
                if (error) {
                    info.lat = "";
                    info.lng = "";
                } else {
                    info.lat = geo.lat;
                    info.lng = geo.lng;

                    cache[info.name] = {
                        lat: geo.lat,
                        lng: geo.lng
                    };
                }

                callback(null, info);
            });
        }
    }
}

function parseEvents(events) {
    var result = {};

    events.forEach(function (event) {
        var res = /^\s*([^:]+)\s*\:\s*(.*)\s*$/g.exec(event.body);
        if (res) {
            result[res[1].toLowerCase()] = res[2];
        }
    });

    return result;
}

function parseComments(events, comments) {
    var async = require("async");

    async.mapLimit(comments, 10, createChapter.bind(null, events), function (err, chapters) {
        fs.writeFileSync(CACHE_FILE_NAME, JSON.stringify(cache));
        chapters = chapters.sort(function (a, b) {
            if (!a) {
                return !b ? 0 : 1;
            }

            if (!b) {
                return -1;
            }

            if (a.name > b.name) {
                return 1;
            }

            if (b.name > a.name) {
                return -1;
            }

            return 0;
        });

        console.log("city,country,lat,lon,chapter-url,event-url,hex-logo,owner,github,skype,twitter,email");
        chapters.forEach(function (object) {
            if (object) {
                console.log("\"%s\",\"%s\",\"%d\",\"%d\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"",
                    object.city,
                    object.country,
                    object.lat,
                    object.lng,
                    object.url || "",
                    object.event || "",
                    object.hexLogo || "",
                    object.owner || "",
                    object.github || "",
                    object.skype || "",
                    object.twitter || "",
                    object.email || "");
            }
        });

        process.exit(0);
    });
}

function loadEventSignups() {
    var ISSUE = 22;

    https.get({
        hostname: "api.github.com",
        port: 443,
        path: util.format("/repos/%s/%s/issues/%d/comments?per_page=100", OWNER, REPO, ISSUE),
        method: "GET",
        headers: {
            "User-Agent": util.format("comments-gh-scraper@%s", settings.version)
        }
    }, function (response) {
        if (response.statusCode >= 300) {
            throw new Error("[EE] Unexpected status code: " + response.statusCode + " | " + response.statusMessage);
        }

        response.pipe(concat(function (content) {
            var json;

            try {
                json = JSON.parse(content);
            } catch (error) {
                throw new Error("[EE] JSON syntax error: " + error + "\n" + content);
            }

            loadComments(parseEvents(json));
        }));
    }).on("error", function (error) {
        throw new Error("[EE] " + error);
    });
}

function loadComments(events) {
    var ISSUE = 8;

    https.get({
        hostname: "api.github.com",
        port: 443,
        path: util.format("/repos/%s/%s/issues/%d/comments?per_page=100", OWNER, REPO, ISSUE),
        method: "GET",
        headers: {
            "User-Agent": util.format("comments-gh-scraper@%s", settings.version)
        }
    }, function (response) {
        if (response.statusCode >= 300) {
            throw new Error("[EE] Unexpected status code: " + response.statusCode + " | " + response.statusMessage);
        }

        response.pipe(concat(function (content) {
            var json;

            try {
                json = JSON.parse(content);
            } catch (error) {
                throw new Error("[EE] JSON syntax error: " + error + "\n" + content);
            }

            parseComments(events, json);
        }));
    }).on("error", function (error) {
        throw new Error("[EE] " + error);
    });
}

loadEventSignups();
