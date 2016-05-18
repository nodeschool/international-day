angular.module('myApp').controller('MainCtrl', ['$scope', function($scope) {


  $scope.chapterData = {
    row1: {
  		chapter1:{
  			name: "Bainbridge",
  			url	:	"http://www.meetup.com/IslandJS-Nodeschool/events/230953012",
  			icon:	"images/icn-bainbridge.png"
  		},
  		chapter2:{
  			name: "Barcelona",
  			url	:	"http://nodeschool.io/barcelona",
  			icon:	"images/icn-barcelona.png"
  		},
  		chapter3:{
  			name: "Belgrade",
  			url	:	"http://nodeschool.io/belgrade",
  			icon:	"images/icn-belgrade.png"
  		},
  		chapter4:{
  			name: "Bengaluru",
  			url	:	"https://github.com/nodeschool/Bengaluru",
  			icon:	"images/icn-bengaluru.png"
  		}
  	},
  	row2: {
  		chapter5:{
  			name: "Berlin",
  			url	:	"http://nodeschool.io/berlin",
  			icon:	"images/icn-berlin.png"
  		},
  		chapter6:{
  			name: "Buenos Aires",
  			url	:	"http://nodeschool.io/buenosaires",
  			icon:	"images/icn-buenosaires.png"
  		},
  		chapter7:{
  			name: "Costa Rica",
  			url	:	"http://nodeschool.io/costarica",
  			icon:	"images/icn-costarica.png"
  		},
  		chapter8:{
  			name: "Dhaka",
  			url	:	"http://nodeschool.io/dhaka",
  			icon:	"images/icn-dhaka.png"
  		}
  	},
  	row3: {
  		chapter9:{
  			name: "Hermosillo",
  			url	:	"https://github.com/nodeschool/hermosillo",
  			icon:	"images/icn-hermosillo.png"
  		},
  		chapter10:{
  			name: "IEM Kolkata",
  			url	:	"http://nodeschool.io/iem-kolkata",
  			icon:	"images/icn-kolkata.png"
  		},
  		chapter11:{
  			name: "Italy",
  			url	:	"http://nodeschool.io/italy",
  			icon:	"images/icn-italy.png"
  		},
  		chapter12:{
  			name: "Lisbon",
  			url	:	"http://www.meetup.com/require-lx/events/229064760",
  			icon:	"images/icn-lisbon.png"
  		}
  	},
  	row4: {
  		chapter13:{
  			name: "London",
  			url	:	"https://github.com/nodeschool/london",
  			icon:	"images/icn-london.png"
  		},
  		chapter14:{
  			name: "Mexico City",
  			url	:	"http://nodeschool.github.io/mexicocity",
  			icon:	"images/icn-mexicocity.png"
  		},
  		chapter15:{
  			name: "New York",
  			url	:	"http://nodeschool.io/nyc",
  			icon:	"images/icn-newyork.png"
  		},
  		chapter16:{
  			name: "Oakland",
  			url	:	"http://nodeschool.io/oakland",
  			icon:	"images/icn-oakland.png"
  		}
  	},
  	row5: {
  		chapter17:{
  			name: "Pereira",
  			url	:	"http://nodeschool.io/pereira",
  			icon:	"images/icn-pereira.png"
  		},
  		chapter18:{
  			name: "Raleigh-Durham",
  			url	:	"http://nodeschool.io/raleigh-durham",
  			icon:	"images/icn-raleigh.png"
  		},
  		chapter19:{
  			name: "Reykjavik",
  			url	:	"http://nodeschool.io/reykjavik",
  			icon:	"images/icn-reykjavik.png"
  		},
  		chapter20:{
  			name: "San Francisco",
  			url	:	"http://nodeschool.io/sanfrancisco",
  			icon:	"images/icn-sanfrancisco.png"
  		}
  	},
  	row6: {
  		chapter21:{
  			name: "Tacoma",
  			url	:	"http://nodeschool.io/tacoma",
  			icon:	"images/icn-tacoma.png"
  		},
  		chapter22:{
  			name: "Tokyo",
  			url	:	"http://nodeschool.io/tokyo",
  			icon:	"images/icn-tokyo.png"
  		},
  		chapter23:{
  			name: "Toronto",
  			url	:	"http://nodeschool.io/toronto",
  			icon:	"images/icn-toronto.png"
  		},
  		chapter24:{
  			name: "Washington DC",
  			url	:	"http://nodeschool.io/washingtondc",
  			icon:	"images/icn-washingtondc.png"
  		}
  	},
  	row7: {
  		chapter25:{
  			name: "Western Mass",
  			url	:	"http://nodeschool.io/western-mass",
  			icon:	"images/icn-westernmass.png"
  		},
  		chapter26:{
  			name: "Zagreb",
  			url	:	"http://nodeschool.io/zagreb",
  			icon:	"images/icn-zagreb.png"
  		}
  	}
  };

  $scope.lastAttendees = {

    col1: [
        "daveskull81",
        "LupDre",
        "Trott",
        "pvrbek",
        "dinodsaurus",
        "shime",
        "bcobanovfoi",
        "SimonSun1988",
        "PolarBearAndrew",
        "iancrowther",
        "piccoloaiutante",
        "Sequoia",
        "filtercake",
        "VladTheLad",
        "sas05",
        "derwebcoder",
        "sebastian301082",
        "HerrBertling",
        "herzi",
        "Salzig",
        "robin-drexler",
        "trevorah",
        "SomeoneWeird"
    ],
    col2: [
        "sidorares",
        "sericaia",
        "iled",
        "foliveira",
        "zcarlos",
        "nneves",
        "dhenriques",
        "JSFernandes",
        "ghost",
        "kytwb",
        "armno",
        "aikordek",
        "chester1000",
        "jengguru",
        "aimmango",
        "rburns",
        "rogr",
        "Sparragus",
        "jurasec",
        "alecsGarza",
        "robextrem",
        "sarazat",
        "AlfredoBejarano"
    ],
    col3: [
        "leoolmos",
        "andygnewman",
        "swooop",
        "joaopaulopp",
        "almssp",
        "joshpitzalis",
        "TheBenji",
        "msmichellegar",
        "adriankelly",
        "tomasz-potanski",
        "anniva",
        "sandagolcea",
        "borellvi",
        "alanshaw",
        "jmpp",
        "nerik",
        "martinjeannot",
        "supertanuki",
        "alain75007",
        "UnbearableBear",
        "marie-ototoi",
        "donaminos",
        "stephane71"
    ],
    col4: [
        "rumesh",
        "sophietk",
        "Andromed",
        "iteuss",
        "arnaudbreton",
        "alexandreferreirafr",
        "hmaalmi",
        "fagossa",
        "yassinedoghri",
        "yanning92",
        "y9mo",
        "csu6",
        "micabe",
        "dicaormu",
        "vjlock",
        "dylaw",
        "pepinpin",
        "hmore",
        "masterct",
        "jeanpaulpollue",
        "faisalmohd",
        "Nahal-Islam",
        "SdShadab"
    ],
    col5: [
        "amuntasim",
        "ishtiaque23",
        "imranfarid7890",
        "hsleonis",
        "shafayeatsumit",
        "naimrajib07",
        "devfaisal",
        "faiyazahmed",
        "FuadRafiq",
        "himaloy",
        "tanvirraj",
        "mkawsar",
        "selimppc",
        "mones-cse",
        "mahsin-islam",
        "codeinfected",
        "faizaalam",
        "zhdzmn",
        "prappo",
        "newazsharif",
        "junan",
        "ProsantaChaki",
        "bleedingpoem"
    ],
    col6: [
        "mofrubel",
        "suzon007",
        "imranabdurrahim",
        "jeebonanowar",
        "afronski",
        "mmoczulski",
        "galuszkak",
        "sleaz0id",
        "bdanek",
        "kkoscielniak",
        "marcinrog",
        "awilczek",
        "mandraszyk",
        "MariuszGeo",
        "martasap",
        "pbocian",
        "widmofazowe",
        "bandraszyk",
        "marckraw",
        "kkarczmarczyk",
        "frakti"
    ]
};

}]);