#!/usr/bin/env node

"use strict";

var fs = require("fs");
var streamToArray = require("stream-to-array"); 
var csv = require("csv");

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
    apiKey: process.argv[2] || "",
    formatter: null
};

if (!extra.apiKey) {
    console.log("Please pass a Google Maps API key as a first argument.")
    process.exit(1)
}

var GITHUB_KEY = process.argv[3] || ""

if (!GITHUB_KEY) {
    console.log("Please pass a Github API Key as second argument")
    process.exit(1)
}

var github = require("octonode").client(GITHUB_KEY);

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
                .replace(/gmail\s*$/ig, "gmail.com")
                .replace(/\s+/ig, "");
        }
    });

    return result;
}

function geocode(name, callback) {
    geocoder.geocode(name, function (err, res) {
        if (err || res.length === 0) {
            callback(err, { lat: 0, lon: 0});
            return;
        }

        callback(err, { lat: res[0].latitude, lon: res[0].longitude });
    });
}

function createChapter(events, comment, callback) {
    var info = extractInfo(comment.body);

    if (!info) {
        callback(null);
    } else {
        var cached = cache[info.name];

        info["chapter-url"] = info.chapter || util.format("http://nodeschool.io/%s", info.city.replace(/\s/, "-").toLowerCase());
        info["event-url"] = info.event || events[info.name.toLowerCase()] || events[info.city.toLowerCase()];
        info["hex-logo"] = info.hexLogo

        if (cached) {
            info.lat = cached.lat;
            info.lon = cached.lon;

            callback(null, info);
        } else {
            geocode(info.name.toLowerCase(), function (error, geo) {
                if (error) {
                    info.lat = "";
                    info.lon = "";
                } else {
                    info.lat = geo.lat;
                    info.lon = geo.lon;

                    cache[info.name] = {
                        lat: geo.lat,
                        lon: geo.lon
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
        var body = event.body.split("\n")[0]
        var res = /^\s*([^:]+)\s*\:\s*(.*)\s*$/g.exec(body);
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

        var scheduleStream = fs.createReadStream("./international-nodeschool-schedule.csv");
        scheduleStream.setEncoding("utf8")
        scheduleStream = scheduleStream.pipe(csv.parse({columns: true}));
        streamToArray(scheduleStream, function (err, schedule) {
            csv.stringify(chapters.filter(function (chapter) {
                return chapter !== undefined && chapter["event-url"]
            }).map(function (chapter) {
                for (var i = 0; i < schedule.length; i++) {
                    var sched = schedule[i]
                    if (sched.city === chapter.city && sched.country === chapter.country) {
                        chapter["end-time"] = sched["end-time"]
                        chapter["start-time"] = sched["start-time"]
                        chapter["time-zone"] = sched["time-zone"]
                        break;
                    }
                };
                var start = chapter["start-time"]
                  , zone = chapter["time-zone"]
                  , time = []

                if (start && zone) {
                    chapter.start = new Date("Sat May 23 2015 " + start + ":00 " + zone)
                }
                return chapter
            }).sort(function (a, b) {
                if (!a.start || !b.start) {
                    return 0;
                }
                if (a.start.getTime() > b.start.getTime())
                    return 1;
                else if(a.start.getTime() < b.start.getTime())
                    return -1;
                return 0;
            }), { objectMode: true, header: true, columns: [
                "city",
                "country",
                "lat",
                "lon",
                "chapter-url",
                "event-url",
                "hex-logo",
                "owner",
                "github",
                "skype",
                "twitter",
                "email",
                "start-time",
                "end-time",
                "time-zone"
            ]}, function (err, data) {
                if (err) {
                    console.log("Error: ", err)
                    return process.exit(1)
                }
                fs.writeFile('./output.csv', data)
            });
        });
    });
}

function loadEventSignups() {
    github.issue(OWNER + '/' + REPO, 22).comments(0, 200, function (err, events) {
        if (err >= 300) {
            throw new Error("[EE] Unexpected err: " + err);
        }

        loadComments(parseEvents(events));
    }).on("error", function (error) {
        throw new Error("[EE] " + error);
    });
}

function loadComments(events) {
    github.issue(OWNER + '/' + REPO, 8).comments(0, 200, function (err, comments) {
        if (err) {
            throw new Error("[EE] Unexpected error: " + err);
        }
        parseComments(events, comments);
    }).on("error", function (error) {
        throw new Error("[EE] " + error);
    });
}

loadEventSignups();