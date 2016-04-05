var APPVersion = "3.2.4.160";
var MAX_REQUESTS = 5;   // Max requests
var CALL_WAIT = 200;        // 100ms
var count = 0;
var DownloadFiles = [];
var DownloadedFiles = [];
var maxFileSize = 1024 * 1024 * 2;
var parents = [];
var sessionGuid = "652f3216-c558-4d34-b647-8b976c109b3e";
var FileSystemTree = {};
var OfflineCatalogMinApiVersion = "4.4.5.0";
// default bandwidth
var highBandwidth = false;
var DownloadFirstWithMaxParallelThreads = 2;


myApp = {
    fileSystemHelper: null,
    BaseDir: null,
	DB: null,
	SettingsModel: null,
    Settings: {},
    initSettings: {
        DownloadSource: "API",
        DownloadMediaServerURL: "http://localhost/DIVA2",
        DownloadSourceStorage: "",
        DIVA3DSource: "API",
        DIVA3DSourceURL: "http://localhost/DIVA3D",
		LocalStorage: "DEVICE",
        LocalStorageDir: "DIVA",
		InitStartMode: "POS",
		GalleryItemsPerPage: 500,
        LastOfflineUpdate: "",
		LastAPPVersion: "",
        OnStartAutoOfflineUpdate: true,
        POIShowConfigurator: true,
        POIShowPrices: true,
        POIStartModule: "0",
        POIViewWhat: 0,
		POIPlaylist: "",
        POIShowTouchInfo: false,
        POIStartAutoPlay: 0,
		POSInitShowPrices: true,
        POSInitViewWhat: 0,
        POSPassword: "",
		CommonPriceType: "",
        RetailerName: "",
        RetailerNr: "",
        Salesperson: "",
        SalespersonEmail: ""
    },
	DownloadManager: null,
	doCancelDownload: false,
    // Application Constructor
    initialize: function () {
        this.bindEvents();
		this.initializeSettings();
    },
    initializeSettings: function () {
        for (var attr in this.initSettings) {
            this.Settings[attr] = this.initSettings[attr];
        }
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("load", this.onLoad, false);
        document.addEventListener("offline", this.onOffline, false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("touchstart", function () { }, false);
		document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);
        document.addEventListener("batterystatus", this.onBatteryStatus, false);

        //navigator.connection.addEventListener("change", myApp.BandwidthChange);
        //myApp.BandwidthChange();
    },

    onBatteryStatus:function (info) {
        // Handle the online event
        if (typeof myReader == "object") {
            debug("App.onBatteryStatus: Level: " + info.level + " isPlugged: " + info.isPlugged);
        }
        else {
            console.log("App.onBatteryStatus: Level: " + info.level + " isPlugged: " + info.isPlugged);
        }
    },

    onPause: function () {
        if (typeof myReader == "object") {
            debug("App.event -> onPause");
        }
        else {
            console.log("App.event -> onPause");
        }
    },
    onResume: function () {
        if (typeof myReader == "object") {
            debug("App.event -> onResume");
        }
        else {
            console.log("App.event -> onResume");
        }
    },

    onLoad: function () {
		if (typeof myReader == "object") {
            debug("App.event -> onLoad");
        }
        else {
            console.log("App.event -> onLoad");
        }
    },
    onOffline: function() {
        console.log("App.event -> onOffline");
        ccIsOnlineConnection = false;
        try {
			if (typeof myReader == "object") {
                goOffline(false);
            }
        }
        catch (e) {
        }
    },
    onOnline: function() {
        console.log("App.event -> onOnline");
        try {
			if (typeof myReader == "object") {
                if (myReader && myReader.ApiURL != "") goOnline(false, myReader.APIVersionURL(false));
            }
            else {
                ccIsOnlineConnection = true;
            }
        }
        catch(e) {
        }
    },

    checkConnection: function () {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';

        console.log('Connection type: ' + states[networkState]);
        console.log('bandwidth: '+ navigator.connection.bandwidth);
    },
    

    /*
    // bandwidth change handler
    BandwidthChange: function() {
        highBandwidth = (!navigator.connection.metered && navigator.connection.bandwidth > 2);
        console.log(
          "switching to " +
          (highBandwidth ? "high" : "low") +
          " bandwidth mode"
        );
        navigator.connectionSpeed

    },
    */


    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        if(navigator.splashscreen) navigator.splashscreen.hide();

        window.setTimeout(function () {
            if(myApp.DBopen()) {
				myApp.DBcreateTable();


				//Readerparams
				var params = {
					LoadReader: true,
    				ShowLoginOnStart: 0,
					ShowLicenseKey: "1",
					LoginWithContextID: '1',
					jsVers: '2.1.322.min',
					cssVers: '2.1.322',
					ConfigIsEmbedded: '2',
					LoginMode: 'offline',
					DebugSvgPlanner: 0,
					ShowDiscountCalculator: "1",
                    Culture: "it-IT",
					DebugToServer: 1,
					DebugToConsole: 0,
					StartNewsPage: "NEWS-DivaStart",
					NewsMainModule: "DIVA_PRO_START",
					LoginUserRole: 'v',
					BeforeStart: function () {
							$("#ccHomeMenu").kendoMenu();
					}
				};

				if(!params.kendoURL) params.kendoURL="kendo/";
				if(!params.jsPath) params.jsPath="js/";
				if(!params.stylePath) params.stylePath="css/";
				if(!params.jsVers) params.jsVers="2.1.322.min";
				if(!params.cssVers) params.cssVers="2.1.322";


				ccIsPhoneGap = true;
				debug("App Version: " + APPVersion);
				if (device) {
					debug("device.cordova: " + device.cordova);
					debug("device.model: " + device.model);
					debug("device.name: " + device.name);
					debug("device.platform: " + device.platform);
					debug("device.uuid: " + device.uuid);
					ccDeviceUUID = device.uuid;
					debug("device.version: " + device.version);
				}
				debug("Screen.width: " + window.innerWidth);
				debug("Screen.height: " + window.innerHeight);
				debug("networkState: " + navigator.connection.type);



				var networkState = navigator.connection.type;

				if (networkState == Connection.NONE) {
					ccIsOnlineConnection = false;
				}
				cordova.exec(function(result) {
					debug("Free Disk Space: " + result);
				}, function(error) {
					debug(error,"Free Disk Space:",true);
				}, "File", "getFreeDiskSpace", []);

				$("#AppVersion").html("App Version: " + APPVersion);
				ccOfflineBaseDir = "";
				ccRetailerBaseDir = "";
				ccDealerBaseDir = "";
				myApp.BaseDir = null;
				fileSystemHelper = new FileSystemHelper();
				//debug("init FileSystem");
				fileSystemHelper.getFileSystem(
					function (myBaseDir) {
						//debug("BaseDir:" + myBaseDir.fullPath)
						myApp.BaseDir = myBaseDir;
						//debug("FileSystem initialized: " + myApp.BaseDir.toURL());

						myApp.StartDiva(params);














					},












					function () {
						debugErr(null, "getFileSystem: No FileSystem Found!", true);
						myApp.StartDiva(params);
					}
				)



				function loadSingleScript(url, callback) {
					//$("#debug").append("loadSingleScript: "+url+"<br>");

					var head = document.getElementsByTagName("head")[0];
					var script = document.createElement("script");
					script.src = url;

					// Handle Script loading
					{
						var done = false;

						// Attach handlers for all browsers
						script.onload = script.onreadystatechange = function() {
							if (!done && (!this.readyState ||
								this.readyState == "loaded" || this.readyState == "complete")) {
								done = true;
								if (callback)
										callback();

								// Handle memory leak in IE
								script.onload = script.onreadystatechange = null;
							}
						};
					}


					head.appendChild(script);

					// We handle everything using the script element injection
					return undefined;
				};

			}
        },500);
    },

    showStartPage: function (params) {
		showSpinner();
        $("#ccMainPanel").empty().show();
        //$("#ccLoginCI").hide();
        myStartPage = new NewsReader(params);
        myStartPage.GetNewsPage("#ccMainPanel", params.NewsMainModule, "", "", "", params.StartNewsPage,
            function () { //onSuccess
				hideSpinner();
            },
            function (Error) {  //onError
				hideSpinner();
                $("#ccMainPanel").html(Error);
				myReader = new ccReader();
                ShowReader(params, true);
            }
        );
        
    },

    StartDiva: function (params) {

        //goOffline();
		function goOn() {
























            var myAutologin = false;
            if (storageEnabled()) myAutologin = $.localStorage.getItem('myAutologin') == "1";

            if (!myAutologin && params.StartNewsPage && params.StartNewsPage != "") {
                   myApp.showStartPage(params);
            }
            else {
                if (params.BeforeStart) params.BeforeStart();

                if (params.LoadReader) {
                    myReader = new ccReader();
                    ShowReader(params, true);
                }
                else {
                    $("#myCCReaderContent").hide();
                    $("#ccMainPanel").hide();
                    ShowCategoryMan(params);
                }
            }
        }



        goOn();
	},

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log(id);
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    //Settings Handler
    SettingsDialog: function (StartMenu, done) {

        hideSpinner();
        
        ModalDialogShow({
            "id": "ccSettingsDia",
            "Body": "<div id='ccSettingsBody'></div>",
            "width": "900px",
            "height": "600px",
            "title": txt("DIVA_SETTINGS"),
            "actions": []
        });
        if (!myApp.SettingsModel) {
            myApp.SettingsModel = new kendo.observable({
                Settings: {},
                LicenseKey: myReader.LicenseKey,
                MenuIsVisible: true,
                isAdminMode: false,
                ShowStartSettings: false,
                ShowDownloadSettings: false,
                ShowFileSystem: false,
                FileSystemMode: "",
                ShowDatabase: false,
                ShowTableName: "",
                onSelectMenu: function (e) {
                    this.set("ShowStartSettings", false);
                    this.set("ShowDownloadSettings", false);
                    this.set("ShowFileSystem", false);
                    this.set("ShowDatabase", false);

                    switch ($(e.item).closest("li[id]").attr("id")) {
                        case "ccStartSettingsMenu":
                            this.set("ShowStartSettings", true);
                            break;
                        case "ccDownLoadSettingsMenu":
                            this.set("ShowDownloadSettings", true);
                            break;
                        case "ccFileSystemShow":
                            this.set("ShowFileSystem", true);
                            if ($("#ccDir").html() == "" || this.FileSystemMode != "TREE") {
                                this.set("FileSystemMode", "TREE");
                                myApp.showDir(false);
                            }
                            break;
                        case "ccFileSystemShowSizes":
                            this.set("ShowFileSystem", true);
                            if ($("#ccDir").html() == "" || this.FileSystemMode != "SIZE") {
                                this.set("FileSystemMode", "SIZE");
                                myApp.showDir(true);
                            }
                            break;
                        case "ccDeleteAllOfflineData":
                            this.set("ShowFileSystem", true);
                            ConfirmDialogShow({
                                Message: txt("CONFIRM_DELETE_ALL_OFFLINE"),
                                Title: txt("DELETE")
                            }, function () {
                                myApp.deleteOfflineData(function () {
                                    //alle Datenbankeinträge löschen
                                    myApp.DBdropAlltables(function () {
                                        alert(txt("ALL_OFFLINE_DELETED"));
                                        document.location.reload();
                                    });
                                    
                                });
                            });
                            break;
                        case "ccDeleteUnusedOfflineData":
                            this.set("ShowFileSystem", true);
                            break;
                        case "ccDBUserMenu":
                            this.set("ShowDatabase", true);
                            myApp.ShowDBTable("#ccDB", "DivaData");
                            break;
                        case "ccDBCatalogsMenu":
                            this.set("ShowDatabase", true);
                            myApp.ShowDBTable("#ccDB", "DivaCatalogs");
                            break;
                        case "ccDBAccountsMenu":
                            this.set("ShowDatabase", true);
                            myApp.ShowDBTable("#ccDB", "DivaAccounts");
                            break;
                        case "ccDBBasketsMenu":
                            this.set("ShowDatabase", true);
                            myApp.ShowDBTable("#ccDB", "DivaBaskets");
                            break;
                        case "ccDBFavoritsMenu":
                            this.set("ShowDatabase", true);
                            myApp.ShowDBTable("#ccDB", "DivaFavorits");
                            break;
                        case "ccDBMasterMenu":
                            this.set("ShowDatabase", true);
                            myApp.ShowDBTable("#ccDB", "sqlite_master");
                            break;
                        case "ccDBReset":
                            ConfirmDialogShow({
                                Message: txt("CONFIRM_DELETE_ALL_DB_DATA"),
                                Title: txt("DELETE")
                            }, function () {
                                //alle Datenbankeinträge löschen
                                $.localStorage.setItem('myAutologin', "");
                                myApp.DBdropAlltables(function () {
                                    alert(txt("ALL_OFFLINE_DELETED"));
                                    document.location.reload();
                                });
                            });
                        case "ccShowDebug":
                            if (myReader.NavModel) myReader.NavModel.set("DebugIsVisible", !myReader.NavModel.DebugIsVisible);
                            if(myReader.NavModel.DebugIsVisible) myReader.NavModel.UpdateDebug();
                            break;
                        case "ccRestart":
                            ConfirmDialogShow({
                                Message: txt("CONFIRM_RESTART_APP"),
                                Title: "DIVA App"
                            }, function () {
                                document.location.reload();
                            });
                            break;
                        case "ccAdmin":
                            if (!myApp.SettingsModel.isAdminMode) {
                                showInputBox({
                                    title: "Admin",
                                    type: "PASSWORD"
                                }, function (value) {
                                    if (MD5(value) == ccAdx) myApp.SettingsModel.InitAdmin();
                                });
                            }
                            break;
                    };
                },
                
                //StartSettings
                Autologin:  $.localStorage.getItem('myAutologin') == "1",
                Username: $.localStorage.getItem('myCRU'),
                DefaultRetailerName: myReader.FirstLoginDealerName?myReader.FirstLoginDealerName:"",
                DefaultRetailerNr: myReader.LoggedContextID?myReader.LoggedContextID:"",
                DefaultSalesperson: myReader.FirstLoginUserFullname?myReader.FirstLoginUserFullname:"",
                DefaultSalespersonEmail: myReader.FirstLoginUserEmail ? myReader.FirstLoginUserEmail : txt("EMAIL"),
                LogOut: function () {
                    ModalDialogClose("ccSettingsDia");
                    $.localStorage.setItem('myAutologin', "");
                    myReader.ccLogout();
                },
                ItemsPerPageArray: [{ "Name": "50", "ID": 50 }, { "Name": "100", "ID": 100 }, { "Name": "200", "ID": 200 }, { "Name": "400", "ID": 400 }],
                ViewWhatArray: [{ "Name": txt("ALL_MODELS"), "ID": "0" }, { "Name": txt("FILTER_FAVORITS_INFO"), "ID": "1" }, { "Name": txt("OFFLINE_MODELS"), "ID": "2" }],
                POIStartModuleArray: [
                    { "Name": txt("TOP_MENU_DIVA_HOMEANDNEWS"), "ID": "0" },
                    { "Name": txt("POS_MENU_ACCOUNTS"), "ID": "1" },
                    { "Name": txt("POS_MENU_CATALOGS"), "ID": "2" },
                    { "Name": txt("POS_MENU_PROMOTIONS"), "ID": "4" }
                ],
                Playlists:[],
                StartPlaylistArray: [{ "Name": txt("START_MANUELL"), "ID": "0" }, { "Name": txt("START_AUTO"), "ID": "1" }],

                //Download Settings
                IncludeColorsim: true,
                validationMsg: function (key) {
                    return txt(key) + " erforderlich";
                },
                txt: function (key) {
                    return txt(key);
                },
                doAnalyzeOfflineData: function () {
                    myApp.AnalyzeOfflineData();
                },
                LocalStorageVisible: device.platform.toLowerCase() === "android",
                LocalStorageArr: [{ Id: "INTERNAL", Title: txt("INTERNAL") },
                                     { Id: "SDCARD", Title: txt("SDCARD") }
                                    ], 
                onLocalStorageChange: function () {
                    this.set("ShowLocalStorageDir", this.Settings.LocalStorage == "SDCARD")
                    if (device.platform.toLowerCase() === "android") {
                        // file:///storage/emulated/0/Android/data/<app-id>/files/
                        // Directory has to be public, for the default pdf viewer to read it.
                        url = "http://";
                        var TempURL = cordova.file.externalDataDirectory + "/test.txt";
                        window.resolveLocalFileSystemURL(            // Check whether the sample PDF file exists.
                            TempURL,
                            function (fileEntry) {      // wenn vorhanden gleich öffnen
                                myApp.loadDoc(fileEntry.toURL());
                            }, 
                            function (error) {          // wenn nicht vorhanden zuerst kopieren
                                myApp.copyFile(
                                    Url, //myApp.getWorkingFolderFileURL(FileName),
                                    TempURL,
                                    myApp.loadDocFromFileEntry, // dann öffnen
                                    function (error) {
                                        alert("Error copying file.");
                                        console.log("Error: " + JSON.stringify(error, null, 4));
                                    }
                                );
                            }
                        );
                    }
                    else {
                        myApp.loadDoc(Url);
                    }


                },
                ShowLocalStorageDir: this.Settings.LocalStorage == "SDCARD",
                
                DownloadSourceArr: [{ Id: "API", Title: "DIVA Server" },
                                    { Id: "LAN", Title: "AdHoc Netzwerk" }//,
                                    //{ Id: "STORAGE", Title: "Datenträger" }
                ],
                onDownloadSourceChange: function () {
                    this.set("ShowDownloadSourceURL", false)
                    this.set("ShowDownloadSourceStorage", false)
                    switch (this.Settings.DownloadSource) {
                        case "LAN":
                            this.set("ShowDownloadSourceURL", true)
                            break;
                        case "STORAGE":
                            this.set("ShowDownloadSourceStorage", true)
                            break;
                    }
                },

                ShowDownloadSourceURL: myApp.Settings.DownloadSource == "LAN",
                ShowDownloadSourceStorage: myApp.Settings.DownloadSource == "STORAGE",

                DIVA3DSourceArr: [{ Id: "API", Title: "DIVA Server" },
                    { Id: "LAN", Title: "AdHoc Netzwerk" }//,
                    //{ Id: "STORAGE", Title: "Datenträger" }
                ],
                onDIVA3DSourceChange: function () {
                    this.set("ShowDIVA3DSourceURL", this.Settings.DIVA3DSource == "LAN");
                },
                ShowDIVA3DSourceURL: myApp.Settings.DIVA3DSource == "LAN",
               
                OfflineUsage: "",
                onCalculateUsageClicked: function (e) {
                    e.preventDefault();
                    this.set("OfflineUsage", txt("CALCULATE"));

                },
                onCloseClicked: function (e) {
                    ModalDialogClose("ccSettingsDia");
                },
                onSaveClicked: function (e) {
                    var doClose = $(e.target).attr("t") == "1";
                    $.localStorage.setItem('myAutologin', myApp.SettingsModel.Autologin ? "1" : "");
                    myApp.Settings = myApp.SettingsModel.Settings.toJSON();
                    myApp.DBUpdateSettings(myReader.LoginURL(this.LicenseKey), $.serializeJSON(myApp.Settings), function () {
                        if (doClose) {
                            ModalDialogClose("ccSettingsDia");
                            document.location.reload();
                        }
                    });

                },
                onFixOfflineData: function (e) {
                    e.preventDefault();
                    var myCatalogs = [];
                    myApp.DBGetCatalogs(ccRetailerBaseDir, "", "", function (myOfflineCatalogs) {
                        if (myOfflineCatalogs) {
                            $.each(myOfflineCatalogs, function () {
                                myCatalogs.push(this);
                            });
                        }
                        if (myCatalogs.length > 0) {
                            myApp.downloadCatalogFiles(myCatalogs, true);
                        }
                        else {
                            MsgBox(txt("NOTHING_TO_DOWNLOAD"));
                        }
                    });

                },
                DirInfo: "",
                ActBaseDir: "",
                UserAccountsArr: [],
                onUserAccountChange: function (e) {
                    debug(this.ActBaseDir);
                    myApp.ShowDBTable("#ccDB", this.ShowTableName);
                },
                InitAdmin: function(e) {
                    myApp.SettingsModel.set("isAdminMode", true); //divaadmin
                    myApp.DBGetUserAccounts(function (myUserAccounts) {
                        myApp.SettingsModel.set("UserAccountsArr", myUserAccounts);
                    });
                },
                ccFilterFreeText: "",
                doFilterFreeText: function (e) {
                    if ($(e.target).val().length > 2) {
                        if (e.stopPropagation) e.stopPropagation();	// W3C standard variant
                        else e.cancelBubble = true; 	// IE variant
                        var grid = $("#ccDB .grid").data("kendoGrid");
                        if (grid) grid.dataSource.filter(this.calcDBFilter($(e.target).val()));
                    }
                },
                calcDBFilter: function (myFilter) {
                    var FilterArr = []; myTitel = "";
                    FilterArr.push({ field: "json", operator: "contains", value: myFilter });
                    /*    
                    if (myFilter != "") {
                        var orFilterArr = [];
                        orFilterArr.push({ field: "Json", operator: "contains", value: myFilter });
                        orFilterArr.push({ field: "AccountTitle", operator: "contains", value: myFilter });
                        orFilterArr.push({ field: "Name", operator: "contains", value: myFilter });
                        FilterArr.push({ "logic": "or", "filters": orFilterArr });
                    }
                    */
                    return FilterArr;
                },


            });
            for (var attr in myApp.Settings) {
                myApp.SettingsModel.Settings[attr] = myApp.Settings[attr];
            }

        }
        myApp.DBGetFavorits(ccRetailerBaseDir, function (json) {
            json.unshift({ "Key": "", "Name": "-" });
            myApp.SettingsModel.Playlists = new kendo.data.DataSource({
                data: json,
                sort: { field: "Name", dir: "asc" }
            });
            myApp.SettingsModel.set(StartMenu, true);
            getTemplate("CR-SettingsDialog-" + myReader.TemplateVersion + ".html", function (myView) {
                var mySettingsView = new kendo.View(myView.replace(ccFixTemplateContent, ""), { model: myApp.SettingsModel });
                mySettingsView.render("#ccSettingsBody");

                if (done) done();
                /*    
                _this.LoginModel.validator = $("#ccLogForm").kendoValidator({
                }).data("kendoValidator");
                */
            });
        });
    },

    showDir: function (calcSize) { // directory listen
       
        // Recursively scan a directory structure from a base path
        function getFolder(id, path, calcSize, recursiv, callback) {
            myApp.SettingsModel.set("DirInfo", "calculate path: " + path);
            myApp.BaseDir.getDirectory(path, { create: false }, function (dir) {
               
                var directoryReader = dir.createReader();
                directoryReader.readEntries(function (entries) {
                    var entryList;
                    if (entries.length > 0) {
                        id += 1;
                        entryList = {
                            id: id,
                            text: dir.name,
                            items: [],
                            spriteCssClass: "folder",
                            Size: 0
                        };
                        var myID = "f" + id;
                        myfileEntries= [];
                        function evalNextEntry() {
                            if (entries.length > 0) {
                                var myEntry = entries.shift();
                                if (!myEntry.isFile) { //directory
                                    if (recursiv) {
                                        // Get child folder and have the callback function append it to it's parent entryList from the previous call to getFolder
                                        getFolder(id, myEntry.fullPath.replace(myApp.BaseDir.fullPath, ''), calcSize, recursiv,
                                        function (folder, myfileEntries, lastID) {
                                            id = lastID;
                                            if (folder) {
                                                entryList.Size += folder.Size;
                                                entryList.items.push(folder);
                                            }
                                            evalNextEntry();
                                        });
                                    }
                                    else {
                                        evalNextEntry();
                                    }
                                }
                                else { // Add file to entryList
                                    //entryList.files.push({ "Name": myEntry.name});
                                    if (calcSize) {
                                        myEntry.file(function (fileObj) {
                                            myfileEntries.push({
                                                Filename: fileObj.name,
                                                //fullPath: fileObj.fullPath,
                                                Size: fileObj.size
                                            });
                                            entryList.Size += fileObj.size;
                                            evalNextEntry();
                                        }, function (error) {
                                            console.error('Failed to read file: ' + error.code);
                                        });
                                    }
                                    else {
                                        /*
                                        myfileEntries[myID].push({
                                            fullName: myEntry.name,
                                            Size: 0
                                        });
                                        */
                                        evalNextEntry();
                                    }
                                }
                            }
                            else {  // For loop complete, send the current entryList to the callback function
                                callback(entryList, myfileEntries, id)
                            }
                        };
                        evalNextEntry();
                    } else {
                        console.log('Folder "' + dir.name + '" was empty, skipping.');
                        evalNextEntry();
                    }
                }, function (error) {
                    console.error('Failed to read directory entries: ' + error.code);
                });
            }, function (error) {
                console.error('Failed to get directory ' + path + ': ' + error.code);
            });
        }
        //var id = 0;
        $("#ccDir").empty();
        $("#ccFilesContent").empty();

        getFolder(0, "files", calcSize, true, function (folder, fileEntries, lastID) {
            // show checked node IDs on datasource change
            folder = [folder];
            function formatSize(val) {
                if (val >= 1000000000) {
                    return (Math.round(val / 100000000) / 10) + "GB";
                }
                else if (val >= 1000000) {
                    return (Math.round(val / 100000) / 10) + "MB";
                }
                else if (val >= 1000) {
                    return (Math.round(val / 100) / 10) + "KB";
                }
                else return "1KB";
            }

            function fixSize(nodes) {
                var id;
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i]['ShowSize'] = formatSize(nodes[i].Size);
                    if (nodes[i].items && nodes[i].items.length > 0) {
                        fixSize(nodes[i].items)
                    }
                }
            };
            function ShowFileList(fileEntries, OfflineDir) {
                //DestroyKendo("#ccFilesContent");
                $("#ccFilesContent").empty();
                $("#ccFilesContent").kendoGrid({
                    dataSource: { data: fileEntries, pageSize: 50 },
                    //groupable: true,
                    sortable: true,
                    scrollable: {
                        virtual: true
                    },
                    filterable: true,
                    selectable: true,
                    columnMenu: true,
                    height: "420px",
                    columns: [{
                        field: "Filename",
                        width: 300
                    },
                    {
                        field: "Size",
                        template: function (item) {
                            return formatSize(item.Size);
                        }
                    }],
                    change: function (item) {
                        var myGrid = $("#ccFilesContent").data("kendoGrid");
                        var myData = myGrid.dataSource.getByUid(this.select().attr("data-uid"));
                        switch (myData.Filename.substring(myData.Filename.lastIndexOf(".") + 1).toUpperCase()) {
                            case "ZIP":
                                var myOfflineFile = OfflineDir + "/" + myData.Filename;
                                myApp.SettingsModel.set("DirInfo", "Open zip: " + myOfflineFile);
                                myApp.readOfflineBlobFile(myOfflineFile,
                                    function (file) {  //onSuccess
                                        myApp.CreateZipReader(file,
                                            function (reader) {     //onSuccess
                                                var myFiles = [];
                                                $.each(reader.files, function () {
                                                    myFiles.push({
                                                        Filename: this.name,
                                                        //fullPath: fileObj.fullPath,
                                                        Size: this._data.uncompressedSize
                                                    });
                                                });
                                                ShowFileList(myFiles, OfflineDir);
                                            },
                                            function (e) {     //onError
                                                debugErr(e, "CreateZipReader: " + myOfflineFile, true);
                                            }
                                        );
                                    },
                                    function (e) {
                                        debugErr(e, "readOfflineBlobFile: " + myOfflineFile, true);
                                    }
                                );
                                break;
                            default:
                                myApp.SettingsModel.set("DirInfo", "Show file: " + OfflineDir + "/" + myData.Filename);
                                var Url = Url = myApp.BaseDir.toURL() + OfflineDir + "/" + myData.Filename;
                                Url = FixOfflinePath(Url);
                                window.open(Url, "_blank", "location=no, toolbarposition=top");
                                break;
                        }
                    }
                });
                $("#ccFilesContent").show();
            };
            myApp.SettingsModel.set("DirInfo", "");
            if (calcSize) fixSize(folder);
            $("#ccDir").kendoTreeView({
                dataSource: folder,
                checkboxes: {
                    checkChildren: true
                },
                template: calcSize ? "#: item.text # (#: item.ShowSize #)" : "#: item.text #",
                select: function (e) {
                    // function that gathers IDs of checked nodes
                    function selectedNodeId(nodes, uid, foundItem) {
                        var found = false;
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i].uid == uid) {
                                foundItem.OfflineDir = nodes[i].text;
                                found = true;
                                break;
                            }
                            else {
                                if (nodes[i].hasChildren) {
                                    found = selectedNodeId(nodes[i].children.view(), uid, foundItem);
                                    if (found) {
                                        foundItem.OfflineDir = nodes[i].text + "/" + foundItem.OfflineDir;
                                        break;
                                    }
                                }
                            }
                        }
                        return found;
                    };
                    debug("Selecting", e.node);
                    var treeView = $("#ccDir").data("kendoTreeView");
                    uid = $(e.node).attr("data-uid");
                    treeView.expand($(e.node));
                    var foundItem = { id: "", OfflineDir: "" };
                    $("#ccFilesContent").empty();
                    if (selectedNodeId(treeView.dataSource.view(), uid, foundItem)) {
                        if (myApp.SettingsModel) {
                            //  z.B.  files/33/offline/CAFF00D9A32BB84D62AC5E
                            myApp.DBGetCatalogByOfflineDir(foundItem.OfflineDir, function (Retailer) {
                                myApp.SettingsModel.set("DirInfo", Retailer.length > 0 ? "Used by: " + Retailer.toString() : "Not used!");
                            });
                        }
                        if (foundItem.OfflineDir!="") {
                            getFolder(0, foundItem.OfflineDir, true, false, function (folder, fileEntries, lastID) {
                                ShowFileList(fileEntries, foundItem.OfflineDir);
                            });

                            /*
                            var myFiles = fileEntries[foundItem.id];
                            if (calcSize) fixSize(myFiles);

                            $("#ccFilesContent").kendoGrid({
                                dataSource: { data: myFiles },
                                height: "100%",
                                //groupable: true,
                                sortable: true,
                                columns: [{
                                    field: "fullName",
                                    title: "Name",
                                    width: 300
                                }, {
                                    field: "ShowSize",
                                    title: "Size"
                                }]
                        });
                        */
                        }
                    }
                }
            });
            $("#ccDir").height(420);
            //$("#dir").data("kendoTreeView").expand(".k-item");
        });
    },


    showDirOld: function () {
        $("#dir").html("");
        //$("#debug").css("display", "none");
        $("#dir").css("display", "block");
        $("#dir").append("Directory<br>");
        function getID(url) {
            return url.replace(/\//g, "_").replace(/\./g, "_").replace(":", "");
        };
        debug("showDir:" + myApp.BaseDir.toURL());
        myApp.BaseDir.getDirectory("files", { create: false }, function (dir) {
            //dir.getDirectory("33", { create: false }, function (dir) {
            //dir.getDirectory("offline", { create: false }, function (dir) {
            var myID = getID(dir.fullPath);
            $("#dir").append("<div id='" + myID + "_label' style='display: block; width: 100%; height: 30px; background-color: green'>" + dir.name + "</div><br><div id='" + myID + "' style='padding-left: 40px; display:none; width: 100%'></div>");
            $("#" + myID + "_label").click(function (e) {
                $("#" + e.target.id.replace("_label", "").replace(":", "").replace(/\//g, "\\/").replace(/\./g, "\\.")).toggle();
            });
            readFolder(myID, dir, 1);
            //}, fail);
            //}, fail);
        }, fail);

        function deleteEntry(myfullPath, isDir) {
            var myID = getID(myfullPath);
            var myDir = myfullPath.substring(0, myfullPath.lastIndexOf("/"));
            var myFilename = myfullPath.substring(myfullPath.lastIndexOf("/") + 1);
            var mySubDir = myDir.replace(myApp.BaseDir.fullPath, "");
            fileSystemHelper.checkDirectory(myApp.BaseDir, mySubDir, "",
                function (parentDir) {
                    if (isDir == "true") {
                        parentDir.getDirectory(myFilename, { create: false }, function (target) {
                            target.removeRecursively();
                            $("#" + myID).remove();
                            $("#" + myID + "_label").remove();
                            $("#" + myID + "_delButton").remove();
                        }, fail);
                    } else {
                        parentDir.getFile(myFilename, null, function (target) {
                            target.remove();
                            $("#" + myID).remove();
                            $("#" + myID + "_label").remove();
                            $("#" + myID + "_delButton").remove();
                        }, fail);
                    }
                });
        };


        function readFolder(parentID, directoryEntry, level) {
            var parentElement = $("#" + parentID);
            var directoryReader = directoryEntry.createReader();
            directoryReader.readEntries(function (entries) {
                var i;
                for (i = 0; i < entries.length; i++) {
                    var myID = getID(entries[i].fullPath);
                    parentElement.append("<a class='k-button' style='float: left; margin-left: 20px' data-fullPath='" + entries[i].fullPath + "' data-isdir='" + entries[i].isDirectory + "' id='" + myID + "_delButton'>Delete</a><div id='" + myID + "_label' style='display: block; width: 100%; height: 30px; background-color: " + (entries[i].isDirectory ? "green" : "yellow") + "'>" + entries[i].name + "</div><br><div id='" + myID + "' style='padding-left: " + level * 40 + "px; display: none; width: 100%'></div>");
                    if (entries[i].isDirectory) {
                        $("#" + myID + "_label").click(function (e) {
                            $("#" + e.target.id.replace("_label", "").replace(/\//g, "\\/").replace(/\./g, "\\.")).toggle();
                        });
                    } else {
                        $("#" + myID + "_label").click(function (e) {
                            readFile(e.target.id.replace("_label", ""), function (result) {
                                $("#dir").append("<div id='DialogBody' style='padding: 5px 5px 25px 5px; width: 700px; height: 500px'></div>");
                                $("#DialogBody").html(result);
                                $("#DialogBody").kendoWindow({
                                    modal: true,
                                    height: 500,
                                    width: 700,
                                    title: "Filecontent",
                                    actions: ["Close"],
                                    close: function () {
                                        ModalDialogClose();
                                        $("#DialogBody").remove();
                                    }
                                });
                                $("#DialogBody").data("kendoWindow").center();
                            });
                        });
                    }
                    $("#" + myID + "_delButton").click(function (e) {
                        deleteEntry($(e.target).attr("data-fullPath"), $(e.target).attr("data-isdir"));
                    });
                    console.log(entries[i].name);
                    if (entries[i].isDirectory)
                        readFolder(myID, entries[i], level + 1);
                    else {
                        entries[i].file(function (file) {
                            $("#" + file.localURL.replace(/\//g, "_").replace(/\./g, "_") + "_label").append("<span style='margin-left: 20px'>Size: " + file.size + " bytes</span><span style='margin-left: 20px'>LastUpdate: " + new Date(file.lastModifiedDate) + "</span>");
                        }, fail);
                    }
                }
            }, fail);
        };

        function fail(error) {
            debugErr(null, "showDirOld: Failed to list directory contents: " + error.code, true);
        }
    },

    //Offline Handler
    AnalyzeOfflineData: function (done) {
        checkSavedBasket(function () {
            if (!CheckOnlineConnection()) return;
            hideSpinner();
            var myDialog = "<div>" +
                   "<div class='ccAccountInfo'></div>" +
                   "<div class='ccAccountModelInfo'></div>" +
               "</div>";

            ModalDialogShow({
                "id": "ccAnalyzeDialog",
                "Body": myDialog,
                "width": "400px",
                "height": "120px",
                "title": txt("ANALYZE_VK_CATALOGS")
            });

            var catalogAccountLogins = [], onlineCatalogDBKeys = {}, TotCatalogsToCheckOffline = [], TotCatalogsToDelete = [], TotCatalogsToUpdate = [], TotNewCatalogs = [], TotCatalogsToDownload = [], doRestart = false;
            var myOnlineCatalogCount = 0, myOfflineCatalogCount = 0;
            //Kontrolliert bei installierten Modellen, ob offline.xml vorhanden ist.
            function CheckOfflineDataFile(myItem, done) {
                var myOfflineDataFile = "files/" + myItem.ServerID + "/offline_" + ShortGuid(myReader.FirstLoginDealerGUID) + "/" + myItem.OfflineDir + "/" + myItem.OfflineFilename;
                //debug("Check Offline Data " + myOfflineDataFile);
                myApp.DoesExistFile(myOfflineDataFile, 
                    function () {    //does exist
                        // ist neben der zipdatei auch die txt Datei vorhanden? (wurde diese erfolgreich entpackt?)
                        myApp.DoesExistFile(myOfflineDataFile.replace(".zip", ".txt"), done,
                            function () {    //does not exist
                                debug("OfflineDatei nicht korrekt entpackt, neu downloaden: " + myItem.Name);
                                TotCatalogsToDownload.push(myItem);
                                done();
                            }
                        );
                    },
                    function () {    //does not exist
                        debug("OfflineDatei existiert nicht, neu downloaden: " + myItem.Name);
                        TotCatalogsToDownload.push(myItem);
                        done();
                    });
            };

            function SaveCatalogOfflineImage(myItem, done) {
                if (myItem.CatalogLogo == "") done();
                else {
                    myApp.DownloadFileIfNotExist(myItem.CatalogLogo, myItem.OfflineCatalogLogo,
                        function (isNew) {
                            if (isNew) doRestart = true;
                            done();
                        },
                        done);
                }
            };
            function SaveAccountOfflineImage(myItem, done) {
                if (myItem.AccountLogo == "") done();
                else {
                    myApp.DownloadFileIfNotExist(myItem.AccountLogo, myItem.OfflineAccountLogo,
                    function (isNew) {
                        if (isNew) doRestart = true;
                        done();
                        /*
                        myApp.DownloadFileIfNotExist(
                            myItem.AccountLogo.replace(".jpg", "_LOW.jpg").replace(".png", "_LOW.png"),
                            myItem.OfflineAccountLogo.replace(".jpg", "_LOW.jpg").replace(".png", "_LOW.png"),
                            done,
                            done);
                            */
                    },
                    done);
                }
            };
            function UpdateAccount(Accountlist, i) {
                if (!CheckOnlineConnection()) {
                    ModalDialogClose("ccAnalyzeDialog");
                    return;
                }
                var myItem = null;
                function UpdateNextCatInDB() {                //Neues Modell in Offline DB eintragen
                    if (TotNewCatalogs.length > 0) {
                        myItem = TotNewCatalogs.pop();
						if (!myItem.AccountTitle || !myItem.Name)
                            debug("unknown Catalog");

                        $("#ccAnalyzeDialogBody .ccAccountModelInfo").html(txt("NEW_CATALOG").replace("%1", myItem.Name));
                        debug("Registriere Katalog " + myItem.AccountTitle + " -> " + myItem.Name);
                        SaveCatalogOfflineImage(myItem, function () {
                            myApp.DBInsertCatalog(myItem.DBKey, ccRetailerBaseDir, myItem.CatalogListAccountGUID, myItem.AccountTitle, myItem.GUID, "", myItem.Subfolder, myItem, function (key) {
                                UpdateNextCatInDB();
                            });
                        });
                    }
                    else {
                        if (TotCatalogsToUpdate.length > 0) {    //installiete modelle aktualisieren
                            myItem = TotCatalogsToUpdate.pop();
                            CheckOfflineDataFile(myItem, function () {
                                $("#ccAnalyzeDialogBody .ccAccountModelInfo").html(txt("ACTUALIZE_CATALOG").replace("%1", myItem.Name));
                                debug("Aktualisiere Katalog " + myItem.AccountTitle + " -> " + myItem.Name);
                                SaveCatalogOfflineImage(myItem, function () {
                                    myApp.DBUpdateCatalog(myItem.DBKey, ccRetailerBaseDir, myItem.CatalogListAccountGUID, myItem.AccountTitle, myItem.GUID, "", myItem.Subfolder, null, "", myItem, function (key) {
                                        UpdateNextCatInDB();
                                    });
                                });
                            });
                        }
                        else if (TotCatalogsToCheckOffline.length > 0) {    //offlinedatei installieter modelle kontrollieren
                            myItem = TotCatalogsToCheckOffline.pop();
                            CheckOfflineDataFile(myItem, UpdateNextCatInDB);
                        }
                        else {
                            UpdateAccount(Accountlist, i + 1)
                        }
                    }
                };
                if (i < Accountlist.length) {

                    var myAccount = Accountlist[i];
                    debug("Analyze Account: " + myAccount.Accountname);
                    $("#ccAnalyzeDialogBody .ccAccountInfo").html(txt("ANALYZE_CATALOGS_OF").replace("%1", myAccount.Accountname));
                    $("#ccAnalyzeDialogBody .ccAccountModelInfo").empty();
                    // Katalogliste abrufen
                    initAccountOnlineCatalogList(myAccount.AccountGUID, myReader.OnlineCataloglistURL(myAccount.AccountGUID), onlineCatalogDBKeys, myReader.getAccountName, function (onlineResult) {
                        //hasFavorits = false;
                        // Offline Daten kontrollieren / fehlende eintragen
                        if (onlineResult.Success) {
                            myOnlineCatalogCount+=onlineResult.CatalogList.length;
                            $.each(onlineResult.CatalogList, function () {
                                // kontrollieren ob alle Online Kataloge in DB eingetragen sind, wenn nicht diese jetzt eintragen
                                // Dann CatalogItem zu TotNewCatalogs hinzufügen
                                //if (this.Name == "SK-233")
                                //    debug(this.Name + " -> " + this.DBKey);
                                var myOfflineCatalogStamp = myReader.CatalogDBKeys["KEY" + this.DBKey];
                                if (myOfflineCatalogStamp == null) {
                                    debug("Neuen Katalog downloaden: " + this.Name);
                                    TotNewCatalogs.push(this);
                                    doRestart = true;
                                }
                                else {
                                    if (this.OfflineFilename != "") {
                                        if(myOfflineCatalogStamp.IsOffline) myOfflineCatalogCount += 1;
                                        if (myOfflineCatalogStamp.OfflineFilesLastUpdate != this.OfflineFilesLastUpdate ||
                                            myOfflineCatalogStamp.OfflineVersion != this.OfflineVersion) {  
                                            debug("Datenbank nicht aktuell - jetzt in Datebank aktualisieren: " + this.Name);
                                            TotCatalogsToUpdate.push(this);
                                            doRestart = true;
                                        }
                                            // wenn bereits in Datenbank vorhanden, und wenn online.OfflineFileLastUpdate != LastOfflineUpdate 
                                            // Dann CatalogItem zu TotCatalogsToDownload hinzufügen
                                        else if (myOfflineCatalogStamp.IsOffline && this.OfflineFilesLastUpdate != myOfflineCatalogStamp.OfflineFilesLastUpdate) {
                                            debug("online.OfflineFileLastUpdate != LastOfflineUpdate - Neuen Katalog downloaden: " + this.Name);
                                            TotCatalogsToDownload.push(this);
                                        }
                                        else if (myOfflineCatalogStamp.IsOffline) {
                                            TotCatalogsToCheckOffline.push(this);
                                        }
                                    }
                                }
                            });
                            SaveAccountOfflineImage(myAccount, function () {
                                if(myReader.FirstLoginUserProfile=="RETAIL") myApp.DBUpdateAccount(myAccount, ccRetailerBaseDir, function () {
                                    UpdateNextCatInDB();
                                });
                                else {
                                    UpdateNextCatInDB();
                                }
                            });
                        }
                        else {
                            ModalDialogClose("ccAnalyzeDialog");
                        }
                    });
                }
                else {  // alle Accounts analysiert!
                    initOfflineCatalogList(null, myReader.getAccountName, function (OfflineCatalogResult) {
                        // Offline Daten kontrollieren / Auslaufmodelle finden
                        function checkNextAccountLogin() {
                            //AccountLogin kontrollieren
                            if (catalogAccountLogins.length > 0) {
                                var testAccount = catalogAccountLogins.pop();
                                function checkAccountOnline(testAccount) {
                                    getJsonpData(testAccount.LoginAccountURL, false,
                                        function (json) {
                                            if (json.Success == "true") {
                                                myApp.DBUpdateData(testAccount.LoginAccountFile, $.serializeJSON(json), function (isNew) {
                                                    checkNextAccountLogin();
                                                });
                                            }
                                            else {
                                                debugErr(err, testAccount.Accountname + ": Online Account Loggin failed", true);
                                                checkNextAccountLogin();
                                            }
                                        },
                                        function (err) {
                                            debugErr(err, testAccount.Accountname + ": Online Account Loggin failed", true);
                                            checkNextAccountLogin();
                                        }
                                    );
                                };
                                myApp.DBGetData(testAccount.LoginAccountFile,
                                    function (json) {
                                        if (json.Success == "true") {
                                            checkNextAccountLogin();
                                        }
                                        else {
                                            checkAccountOnline(testAccount);
                                        }
                                    },
                                    function (err) {
                                        checkAccountOnline(testAccount);
                                    }
                                );
                            }
                            else {
                                $("#ccAnalyzeDialogBody .ccAccountInfo").html(txt("ANALYZE_OLD_CATALOGS"));
                                /*
                                if (TotCatalogsToDelete.length > 0) {    //installiete offlinemodelle löschen
                                    ConfirmDialogShow({
                                        Message: txt("DELETE_NOW"),
                                        Title: txt("OK")
                                    },
                                    function () {
                                        deleteNextCatInDB();
                                    });
                                }
                                else {
                                */
                                deleteNextCatInDB();
                                //}
                            }
                        };
                        function deleteNextCatInDB() {
                            if (TotCatalogsToDelete.length > 0) {    //installiete offlinemodelle löschen
                                myItem = TotCatalogsToDelete.pop();
                                $("#ccAnalyzeDialogBody .ccAccountModelInfo").html(txt("DELETE_CATALOG").replace("%1", myItem.Name));
                                debug("Lösche Katalog " + myItem.AccountTitle + " -> " + myItem.Name);
                                myApp.DBDeleteCatalog(myItem.DBKey, ccRetailerBaseDir, myItem.CatalogListAccountGUID, function () {
                                    deleteNextCatInDB();
                                });
                            }
                            else { //Datebank ist jetzt aktualisiert
                                ModalDialogClose("ccAnalyzeDialog");
                                myApp.Settings.LastOfflineUpdate = kendo.toString(new Date(), "dd.MM.yyyy");
                                myApp.Settings.LastAPPVersion = APPVersion;
                                if (myReader.LicenseKey != "") {
                                    myApp.DBUpdateSettings(myReader.LoginURL(myReader.LicenseKey), $.serializeJSON(myApp.Settings), function () {
                                        var myMsg = "<div>" + txt("OFFLINE_STAT").replace("%1", myOnlineCatalogCount) + "</div>"; //Auf dem Ger\u00E4t stehen %1 Modelle zur Verf\u00FCgung.
                                        var myBtn = "";
                                        if (myOfflineCatalogCount > 0 && myOnlineCatalogCount != myOfflineCatalogCount) { //Davon sind %1 Modelle auch installiert und k\u00f6nnen auch ohne Netzwerkverbindung offline genutzt werden.
                                            myMsg += "<div>" + txt("OFFLINE_TO_DOWNLOAD_INFO").replace("%1", myOfflineCatalogCount) + "</div>";
                                        }
                                        else if (myOfflineCatalogCount > 0 && myOnlineCatalogCount == myOfflineCatalogCount) {  //Alle Modlle sind installiert und k\u00f6nnen auch ohne Netzwerkverbindung offline genutzt werden."
                                            myMsg += txt("OFFLINE_ALL_INSTALLED_INFO") + "<br>";
                                        }
                                        if (myOnlineCatalogCount != myOfflineCatalogCount) {
                                            myBtn = "<a class='k-button' id='ccDownloadHelp'>" + txt("OFFLINE_DOWNLOAD_HELP") + "</a>"; //Wie installiere ich Modelle                                        }
                                        }
                                        if (TotCatalogsToDownload.length > 0) {
                                            myMsg += "<div>" + txt("DO_UPDATE_OFFLINE_MODELLS").replace("%1", TotCatalogsToDownload.length) + "</div>";
                                            myApp.AskForDownloadManager(TotCatalogsToDownload, myMsg, txt("UPDATE_OFFLINE_MODELLS"), null, txt("UPDATE_NOW"));
                                        }
                                        else {
                                            var myTitle = txt("NO_OFFLINE_DATA");
                                            if (myOfflineCatalogCount == 0) {
                                                myMsg += txt("OFFLINE_NOTHING_INSTALLED_INFO");
                                            }
                                            else {
                                                myTitle = txt("ALL_OFFLINE_DATA_ARE_ACTUAL");
                                            }

                                            if (doRestart) myMsg += "<div>" + txt("RESTART_NOW") + "</div>";

                                            var myDialogBody = "<div class='ccBodyInfo'>" + myMsg + "</div>" +
                                                "<div class='ccDialogButtons'>" + myBtn + " <a class='k-button ccBtnImportant' id='doOK'>OK</a></div>";

                                            ModalDialogShow({
                                                "id": "MsgBox",
                                                "Body": myDialogBody,
                                                "width": "400px",
                                                "height": "200px",
                                                "title": myTitle
                                            });

                                             $("#doOK").click(function () {
                                                clearTimeout(mytimer);
                                                ModalDialogClose("MsgBox");
                                                if (doRestart) document.location.reload();
                                            });
                                            $("#ccDownloadHelp").click(function () {
                                                clearTimeout(mytimer);
                                                myReader.ShowHelp("DownloadHelp");
                                            });

                                            var mytimer = setTimeout(function () {
                                                $("#doOK").trigger("click");
                                            }, 10000);
                                        }
                                        if (done) done();
                                    });
                                }
                            }
                        };
                        var myLogins = [];
                        if (OfflineCatalogResult.CatalogList && OfflineCatalogResult.CatalogList.length > 0) {
                            $.each(OfflineCatalogResult.CatalogList, function () {
                                var myCatalogStamp = onlineCatalogDBKeys["KEY" + this.DBKey];
                                if (myCatalogStamp == null) {
                                    debug("Katalog online nicht mehr vorhanden - jetzt löschen: " + this.Name);
                                    TotCatalogsToDelete.push(this);
                                    //debug("auslaufmodell " + this.Name);
                                }
                                else {
                                    if (myReader.FirstLoginUserProfile == "RETAIL") {       //AccountLogins kontrollieren
                                        var myLoginAccountFile = myReader.LoginAccountURL(true, false, this.AccountGUID, myReader.LoginUserRole);
                                        var myLoginAccountURL = myReader.LoginAccountURL(false, false, this.AccountGUID, myReader.LoginUserRole);
                                        var myAccountname = this.AccountTitle;
                                        if ($.inArray(myLoginAccountFile, myLogins) == -1) {
                                            myLogins.push(myLoginAccountFile);
                                            catalogAccountLogins.push({
                                                "Accountname": myAccountname,
                                                "LoginAccountFile": myLoginAccountFile,
                                                "LoginAccountURL": myLoginAccountURL
                                            });
                                        }
                                    }
                                }
                            });
                        }
                        $("#ccAnalyzeDialogBody .ccAccountInfo").html(txt("ANALYZE_LOGINS"));
                        $("#ccAnalyzeDialogBody .ccAccountModelInfo").html("");
                        checkNextAccountLogin();
                    });
                }
            };
            $("#ccAnalyzeDialogBody .ccAccountInfo").html(txt("GET_ONLINE_DATA"));
            switch (myReader.FirstLoginUserProfile) {
                case "DEALER":
                    UpdateAccount([{
                        "Accountname": myReader.AccountName, 
                        "AccountGUID": myReader.CatalogListAccountGUID,
                        "AccountLogo": myReader.AccountLogo,
                        "OfflineAccountLogo": myReader.OfflineAccountLogo
                    }], 0);
                    break;
                case "RETAIL":
                    initAccountlist(myReader.AccountlistURL(), function (OnlineAccounts) {
                        UpdateAccount(OnlineAccounts.Accountlist, 0);
                    });
                    break;
            }
        });
    },

    deleteOfflineData: function (done) {
        if (myApp.BaseDir) {
            myApp.BaseDir.removeRecursively();
            debug("Files removed");
            done();
        }
        else {
            myApp.onError({ "message": "Request file system failed." });
        }
    },

    DoesExistFile: function (myFile, onSuccess, onError) {
        var Err = ["OK", "FILE_NOT_FOUND_ERR", "INVALID_URL_ERR", "CONNECTION_ERR", "ABORT_ERR", "NOT_MODIFIED_ERR"];
        if(myFile && myFile!="") {
            if (myApp.BaseDir) {
                var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
                var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
                fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "", function (parentDir) {
                    fileSystemHelper.checkIfIsFile(parentDir, myFilename,
                        function() { //existiert schon
                            onSuccess(false);
                        },
                        function () { //existiert noch nicht
                            if (onError) onError(false);
                        }
                    );
                });
            }
        }
        else {
            debugErr(null, "DoesExistFile: missing parameter myFile:" + myFile);
            if (onError) onError();
        }
    },
    DownloadFileIfNotExist: function (URL, myFile, onSuccess, onError) {
        var Err = ["OK", "FILE_NOT_FOUND_ERR", "INVALID_URL_ERR", "CONNECTION_ERR", "ABORT_ERR", "NOT_MODIFIED_ERR"];
        if(URL && URL !="" && myFile && myFile!="") {
            if (myApp.BaseDir) {
                var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
                var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
                fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "", function (parentDir) {
                    fileSystemHelper.checkIfIsFile(parentDir, myFilename,
                        function() { //existiert schon
                            onSuccess(false);
                        },
                        function () { //existiert noch nicht
                            if (ccIsOnlineConnection) {
                                var target = parentDir.toURL() + "\/" + myFilename;
                                var fileTransfer = new FileTransfer();
                                fileTransfer.download(
                                    encodeURI(URL),
                                    target,
                                    function (entry) {
                                        //debug("download successfull: " + entry.fullPath);
                                        if (onSuccess) onSuccess(true);
                                    },
                                    function (error) {
                                        debugErr(null, "DownloadFileIfNotExist: download error " + Err[error.code] + " - http-status: " + error.http_status + " - " + error.body + "source:" + error.source + "target: " + error.target);
                                        if (onError) onError();
                                    },
                                    true, {}
                                );
                            }
                            else {
                                if (onError) onError();
                            }
                        }
                    );
                });
            }
        }
        else {
            debugErr(null, "DownloadFileIfNotExist: missing parameter URL:"+ URL +", myFile:"+ myFile);
            if (onError) onError();
        }
    },

    DownloadFile: function (URL, myFile, onSuccess, onError) {
        var Err = ["OK", "FILE_NOT_FOUND_ERR", "INVALID_URL_ERR", "CONNECTION_ERR", "ABORT_ERR", "NOT_MODIFIED_ERR"];
        if (myApp.BaseDir) {
            var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
            var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
            fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "", function (parentDir) {
                if (ccIsOnlineConnection) {
                    var target = parentDir.toURL() + "\/" + myFilename;
                    var fileTransfer = new FileTransfer();
                    fileTransfer.download(
                        encodeURI(URL),
                        target,
                        function (entry) {
                            //debug("download successfull: " + entry.fullPath);
                            if (onSuccess) onSuccess();
                        },
                        function (error) {
                            debugErr(null, "DownloadFile: download error " + Err[error.code] + " - http-status: " + error.http_status + " - " + error.body + "source:" + error.source + "target: " + error.target);
                            if (onError) onError();
                        },
                        true, {}
                    );
                }
                else {
                    if (onError) onError();
                }
            });
        }
    },

    saveOfflineFile: function (myFile, data, OnSuccess) {
        debug("saveOfflineFile: " + myFile);
        if (myApp.BaseDir) {
            var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
            var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
            //debug("saveOfflineFile:"+myDir);
            fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "",
                function (parent) {
                    //debug("Directory found");
                    fileSystemHelper.overwriteFile(parent, myFilename, data, OnSuccess, myApp.onError)
                },
                function (error) {
                    debugErr(null, "saveOfflineFile: Directory not found: " + myDir + " - create new..");
                }
            );
        } else {
            myApp.onError({ "message": "Request file system failed." });
        }
    },

    deleteOfflineFile: function (myFile, OnSuccess) {
        //debug("deleteOfflineFile: " + myFile);
        if (myApp.BaseDir) {
            var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
            var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
            fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "",
                function (parent) {
                    var options = {
                        create: false,
                        exclusive: false
                    };
                    parent.getFile(myFilename, options,
                        function (fileEntry) {
                            //debug("Remove Existing File! " + myFilename);
                            fileEntry.remove(
                                 function () {
                                     if (OnSuccess) OnSuccess();
                                     //debug("File Removed!");
                                 }
                            );
                        },
                        function () {
                            debugErr(null, "deleteOfflineFile: Error on Remove Existing File! ");
                        }
                    );
                    //fileSystemHelper.deleteFile(parent, myFilename, OnSuccess, myApp.onError)
                },
                function (error) {
                    debugErr(null, "deleteOfflineFile: Directory not found: " + myDir);
                }
            );
        } else {
            myApp.onError({ "message": "Request file system failed." });
        }
    },

    readOfflineBlobFile: function (myFile, onSuccess, onError) {
        debug("readOfflineBlobFile: " + myFile);
        if (!myFile||myFile == "") {
            return "";
        }
        if (myApp.BaseDir) {
            var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
            var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
            fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "",
                function (parentDir) {
                    parentDir.getFile(myFilename, {}, function (fileEntry) {
                        fileEntry.file(onSuccess);
                    }, onError);
                },
                onError
            );
        }
    },

    // nur Pakete mit API Version 4.4.4 unterstützen
    readOfflineFile: function (myFile, onSuccess, onError) {
        //debug("readOfflineFile: " + myFile);
        if (!myFile||myFile == "") {
            return "";
        }
        if (myApp.BaseDir) {
            var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
            var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
            //myDir="files";
            //debug(myDir);
            try {
                fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "",
                    function (parentDir) {
                        //fileSystemHelper.getFileURL(parentDir, myFilename, function (url) {
                        fileSystemHelper.getFileEntry(parentDir, myFilename, function (data) {
                            //alert(data);
                            onSuccess(data);
                        }, function (e) {
                            onError(e);
                        })
                        //});
                    },
                    function (error) {
                        debugErr(null, "readOfflineFile: Directory not found: " + myDir);
                        onError();
                    }
                );
            }
            catch (e) {
                debugErr(e, "readOfflineFile: Error reading offline File");
                onSuccess("");
            }
        }
        else {
            debugErr(null, "readOfflineFile: Request file system failed.");
            if (onError) onError({ "message": "Request file system failed." });
        }
    },

    readBinaryOfflineFile: function (myFile, onSuccess, onError) {
        //debug("readOfflineFile: " + myFile);
        if (myFile == "") {
            return "";
        }
        if (myApp.BaseDir) {
            var myDir = myFile.substring(0, myFile.lastIndexOf("/"));
            var myFilename = myFile.substring(myFile.lastIndexOf("/") + 1);
            //myDir="files";
            //debug(myDir);
            try {
                fileSystemHelper.checkDirectory(myApp.BaseDir, myDir, "",
                //myApp.BaseDir.getDirectory(myDir, {create: false, exclusive: false},
                    function (parentDir) {
                        //fileSystemHelper.getFileURL(parentDir, myFilename, function (url) {
                        fileSystemHelper.getBinaryFileEntry(parentDir, myFilename, function (data) {
                            //alert(data);
                            onSuccess(data);
                        }, onError)
                        //});
                    },
                    function (error) {
                        debugErr(null, "readBinaryOfflineFile: Directory not found: " + myDir);
                        onError();
                    }
                );
            }
            catch (e) {
                debugErr(e, "readBinaryOfflineFile");
                onSuccess("");
            }
        }
        else {
            debugErr(null, "readBinaryOfflineFile - Request file system failed.");
            if (onError) onError({ "message": "Request file system failed." });
        }
    },

    DeleteCatalog: function (catalogs) {
        var myCatalogsNames = "";
        var i = 0;
        $.each(catalogs, function () {
            myCatalogsNames += (myCatalogsNames == "" ? "" : ", ") + this.Name;
            i++;
            if (i > 15) {
                myCatalogsNames += ",...";
                return true;
            }
        });
        ConfirmDialogShow({ "Message": txt("CONFIRM_DELETE_OFFLINE_CATALOG").replace("%1", myCatalogsNames), "Title": txt("DELETE") },
            function () {
                function DeleteNext(i) {
                    if (i < catalogs.length) {
                        myApp.DBRemoveCatalogFromDownload(catalogs[i].DBKey, function () {
                            //myApp.DBDeleteCatalog(catalogs[i].DBKey, ccRetailerBaseDir, catalogs[i].CatalogListAccountGUID, function () {
                            //myReader.Accountlist = null;
                            DeleteNext(i + 1);
                            
                        });
                    }
                    else {
                        hideSpinner();
                        ModalDialogClose();
                        MsgBox("<div>" + txt("RESTART_NOW") + "</div>", "", "", function () {
                            document.location.reload();
                        });
                    }
                }
                DeleteNext(0);
            }
        ); 
    },

    AskForDownloadManager: function (Catalogs, msg, TitleText, DownloadLaterText, DownloadNowText, InstallLater) {
        checkSavedBasket(function () {
            var saving = false;
            var myDialog = "<div>" +
                "<div class='ccDialogInfo'>" + msg + "</div>" +
                "<div class='ccDialogButtons'><a class='k-button' id='doCancel'>" + txt("CANCEL") + "</a> " +
                (InstallLater ? "<a class='k-button' id='doInstallLater'>" + (DownloadLaterText ? DownloadLaterText : txt("REMEMBER_AND_DOWNLOAD_LATER")) + "</a>" : "") +
                "<a class='k-button ccBtnImportant' id='doInstallNow'>" + (DownloadNowText ? DownloadNowText : txt("START_DOWNLOAD_NOW")) + "</a> </div>" +
                "</div>";

            ModalDialogShow({ "id": "ConfirmDialog", "Body": myDialog, "width": "580px", "height": "140px", "title": (TitleText ? TitleText : txt("DOWNLOAD_MODELS")) });
            $("#doCancel").click(function () {
                if (!saving) ModalDialogClose("ConfirmDialog");
            });
            $("#doInstallNow").click(function () {
                if (!saving) {
                    ModalDialogClose("ConfirmDialog");
                    myApp.downloadCatalogFiles(Catalogs, true);
                }
            });
            $("#doInstallLater").click(function () {
                if (!saving) {
                    saving = true;
                    InstallLater();
                }
            });
        });
    },
    /*
    evalCatalogFiles: function (Catalogs) {
        var doCancelDownload = false;
        function StartdownloadCatalogFiles(Catalogs) {
            var DownloadErrors = [];
            var SuccessfullyLoaded = 0;
            var TotCatFileSize = 0;
            var CatalogsToDownload = [];
            var saving = false;
            debug("downloadCatalogFiles " + Catalogs.length);
            if (Catalogs.length > 0) {
                var i = 0;
                function next() {
                    i++;
                    evalDownloadNextCatalog();
                };
                function evalDownloadNextCatalog() {
                    if (!myApp.doCancelDownload && Catalogs[i]) {
                        onSelectCatalog(Catalogs[i].CatalogCodex, Catalogs[i].CatalogListAccountGUID, "ccOfflineEvalDownloadNext", "", "", false, 
                            function (myCatData) {   //Katalog wurde erfolgreich downgeloaden
                                if (!doCancelDownload) {
                                    TotCatFileSize += myCatData.CatFileSize;
                                    SuccessfullyLoaded += 1;
                                    myCatData.CatalogItem.ShortDesc = CleanJsonString(myCatData.CatalogItem.ShortDesc);
                                    CatalogsToDownload.push(myCatData.CatalogItem);
                                }
                                next();
                            }
                        );
                    }
                    else {
                        hideSpinner();
                        var msg = "<div>" + SuccessfullyLoaded + " Modelle benötigen " + formatFileSize(TotCatFileSize) + " </div>";
                        myApp.AskForDownloadManager(CatalogsToDownload, msg, function () { //InstallLater
                            showSpinner();
                            function InsertNextCatInDB() {
                                if (CatalogsToDownload.length > 0) {
                                    var myCatalogItem = CatalogsToDownload.pop();
                                    var DBKey = MD5(ccRetailerBaseDir + myCatalogItem.CatalogListAccountGUID + myCatalogItem.GUID);
                                    myApp.DBSaveCatalog(DBKey, ccRetailerBaseDir, myCatalogItem.CatalogListAccountGUID, myCatalogItem.AccountTitle, myCatalogItem.GUID, "", myCatalogItem.Subfolder, 1, "", myCatalogItem, function (key) {
                                        InsertNextCatInDB();
                                    });
                                }
                                else {
                                    ModalDialogClose("ConfirmDialog");
                                    destroyCataloglist();
                                    initAccountCatalogList(myReader.CatalogListAccountGUID, myReader.OnlineCataloglistURL(myReader.CatalogListAccountGUID),  myReader.CatalogDBKeys, myReader.getAccountName, function (result) {
                                        showCataloglist(result, "", true);
                                    });
                                }
                            };
                            InsertNextCatInDB();

                        });
                    }
                };
                evalDownloadNextCatalog();
            }
        };
        if (myApp.Settings.DownloadSource == "LAN") {
            ConfirmDialogShow({
                "Message": txt("CONFIRM_DOWNLOAD_FROM_LAN").replace("%1", myApp.Settings.DownloadMediaServerURL),
                "Title": txt("START_DOWNLOAD_NOW"),
                "OKText": txt("DOWNLOAD_NOW"),
                "CancelText": txt("CHANGE_SETTINGS")
            },
                function () { StartdownloadCatalogFiles(Catalogs); },
                function () { myApp.SettingsDialog("ShowDownloadSettings"); }
            );
        }
        else StartdownloadCatalogFiles(Catalogs);
    },
    */
    // DownloadManager ***********************************************************************
    downloadCatalogFiles: function (Catalogs, autostart, StartNow) {
        hideSpinner();
        
        myApp.DownloadManager = new kendo.observable({
            ActStep: 0,
            ActData: null,
            doScroll: false,
            SuccessfullyLoaded: 0,
            DownloadIsRunning: false,
            doCancelDownload: false,
            Errors: "",
            AddError: function(ErrorMsg) {
                myApp.DownloadManager.Errors = myApp.DownloadManager.Errors+ 
                    myApp.DownloadManager.ActData.AccountTitle + " - " +
                    myApp.DownloadManager.ActData.Name + ": " + 
                    ErrorMsg +"\n";
            },
            CancelDownloadClick: function () {
                if (myApp.DownloadManager.DownloadIsRunning) {
                    ConfirmDialogShow({ "Message": txt("CONFIRM_CANCEL_DOWNLOAD") },
                        function () {
                            myApp.DownloadManager.doCancelDownload = true;
                            //MsgBox(txt("CANCEL_DOWNLOAD_INFO"));
                        }
                    );
                }
                else ModalDialogClose();
            },
            StartDownloadButtonVisible: true,
            StartDownloadClick: function () {
                if (!myApp.DownloadManager.DownloadIsRunning) {
                    function ConfirmStartDownload() {
                        ConfirmDialogShow({ "Message": txt("CONFIRM_START_DOWNLOAD") },
                            function () {
                                myApp.DownloadManager.set("StartDownloadButtonVisible", false);
                                myApp.PreventGotoSleep();
                                myApp.DownloadManager.DownloadNextCatalog(0);
                            }
                        );
                    };
                   
                    if (myApp.Settings.DownloadSource == "LAN") {
                        ConfirmDialogShow({
                            "Message": txt("CONFIRM_DOWNLOAD_FROM_LAN").replace("%1", myApp.Settings.DownloadMediaServerURL),
                            "Title": txt("START_DOWNLOAD_NOW"),
                            "OKText": txt("DOWNLOAD_NOW"),
                            "CancelText": txt("CHANGE_SETTINGS")
                        },
                            function () { ConfirmStartDownload(); },
                            function () { myApp.SettingsDialog("ShowDownloadSettings"); }
                        );
                    }
                    else ConfirmStartDownload();
                }
            },
            StartDownloadClass:  "k-button ccBtnImportant",
            CatInfo: function (info) {
                $("#CatInfo").html(info);
            },
            MainInfo: function(info) {
                //$("#MainInfo").html(info);
                myApp.DownloadManager.ActData.set("Activity", info);
                var grid = $("#Downloads").data("kendoGrid");
                if(grid) grid.select("#Downloads tr:eq(" + (myApp.DownloadManager.ActStep + 1) + ")");
            },
            SubInfo: function(info) {
                //$("#SubInfo").html(info);
                myApp.DownloadManager.ActData.set("Result", info);
                var grid = $("#Downloads").data("kendoGrid");
                if (grid) grid.select("#Downloads tr:eq(" + (myApp.DownloadManager.ActStep + 1) + ")");
            },
            DS: new kendo.data.DataSource({
                data: Catalogs,
                sort: [{ field: "AccountTitle", dir: "asc" }, { field: "Name", dir: "asc" }],
                schema: {
                    model: {
                        id: "GUID",
                        fields: {
                            CatalogListAccountGUID: {},
                            AccountTitle: {},
                            GUID: {},
                            Name: {},  
                            Codex: {},
                            ShowDeleteButton: {},
                            Activity: {
                                parse: function (e) {
                                    if (e==undefined) return "warten...";
                                    return e;
                                }
                            },
                            Result: {},
                        }
                    }
                }
            }),
            DownloadNextCatalog: function (step) {
                myApp.DownloadManager.set("StartDownloadClass", "k-button");
                myApp.DownloadManager.set("DownloadIsRunning", true);
                myApp.DownloadManager.set("doScroll", true);
                if (!myApp.DownloadManager.doCancelDownload && step < myApp.DownloadManager.DS.view().length) {
                    var myActData = myApp.DownloadManager.DS.view().at(step);
                    myApp.DownloadManager.ActData = myActData;
                    myApp.DownloadManager.ActStep = step;
                    myActData.set("ShowDeleteButton", false);
                    
                    $("#Downloads tr[data-uid=" + myActData.uid + "] a").remove();
                    debug("Install Collection: " + myActData.AccountTitle + " - Model: " + myActData.Name + " (" + (myApp.DownloadManager.ActStep + 1) + " of " + myApp.DownloadManager.DS.view().length + ")");
                    myApp.DownloadManager.CatInfo("Installiere Kollektion: " + myActData.AccountTitle + " - Modell: " + myActData.Name + " (" + (myApp.DownloadManager.ActStep + 1) + " von " + myApp.DownloadManager.DS.view().length + ")");
                    onSelectCatalog(myActData.Codex, myActData.CatalogListAccountGUID, "ccOfflineDownloadNext", "", "", false, 
                        function (OfflineDir) {   //Katalog wurde erfolgreich downgeloaden
                            //debug("myApp.DownloadManager.DownloadNextCatalog Success");
                            if (!myApp.DownloadManager.doCancelDownload) myApp.DownloadManager.SuccessfullyLoaded += 1;
                            myApp.DownloadManager.saveStep(OfflineDir, "");
                        },
                        function (CatalogErrors) {   //Katalog wurde nicht erfolgreich downgeloaden
                            var ErrorMsg = "";
                            //debug("myApp.DownloadManager.DownloadNextCatalog Errors");
                            if (CatalogErrors && Array.isArray(CatalogErrors) && CatalogErrors.length > 0) {
                                ErrorMsg =  CatalogErrors.length + " Errors:";
                                for (var i = 0; i < CatalogErrors.length && i < 3; i++) {
                                    ErrorMsg += CatalogErrors[i];
                                };
                            }
                            else if (CatalogErrors && CatalogErrors != "") {
                                ErrorMsg = "Error:" + CatalogErrors;
                            }
                            myApp.DownloadManager.AddError(ErrorMsg);
                            myApp.DownloadManager.saveStep("", ErrorMsg);
                        }
                    );
                }
                else {
                    hideSpinner();
                    ModalDialogClose();
                    myApp.AllowSleep();
                    var msg = "<div>" + txt("MODELS_SUCCESSFULLY_UPDATED").replace("%1", myApp.DownloadManager.SuccessfullyLoaded).replace("%2", myApp.DownloadManager.DS.view().length) + "</div><div>" + txt("RESTART_NOW") + "</div>";
                    if (myApp.DownloadManager.Errors != "")
                        msg += "<textarea class='ccDialogErrors'>" + myApp.DownloadManager.Errors + "</textarea>";
                    MsgBox(msg, "", "", function () {
                        document.location.reload();
                    });
                }
            },
            saveStep: function(OfflineDir, CatalogErrors) {
                //DownloadErrors.push({ "CatalogName": CatalogName, "CatalogErrors": CatalogErrors });
                if (CatalogErrors != "") debugErr(null, CatalogErrors, false);
                if (!myApp.DownloadManager.doCancelDownload) {
                    myApp.DownloadManager.MainInfo(CatalogErrors);
                    myApp.DownloadManager.SubInfo(CatalogErrors==""?"OK":" - ");
                    var myCatalogItem = myApp.DownloadManager.ActData;
                    myCatalogItem.ShortDesc = CleanJsonString(myCatalogItem.ShortDesc);
                    CatalogErrors = encodeURI(CatalogErrors);
                    myApp.DBUpdateCatalog(myCatalogItem.DBKey, ccRetailerBaseDir, myCatalogItem.CatalogListAccountGUID, myCatalogItem.AccountTitle, myCatalogItem.GUID, OfflineDir, myCatalogItem.Subfolder, (CatalogErrors == "" ? 0 : 1), CatalogErrors, myCatalogItem.toJSON(), function (key) {
                        window.setTimeout(function () {
                            myApp.DownloadManager.DownloadNextCatalog(myApp.DownloadManager.ActStep + 1);
                        }, 500);
                    });
                }
                else {
                    myApp.DownloadManager.MainInfo("-");
                    myApp.DownloadManager.SubInfo(txt("CANCEL"));
                    myApp.DownloadManager.DownloadNextCatalog(myApp.DownloadManager.ActStep + 1);
                }
            }
        });

        var myDialog = "<div id='ccDownloadContent'></div>";
        ModalDialogShow({
            "Body": myDialog,
            "width": "720px",
            "height": "590px",
            "title": "DIVA Download-Manager"
        });

        var myDownloadView = "<div>" +
            "<div class='ccDialogOptions'><span id='CatInfo'>&nbsp;</span></div>" +
            "<div class='ccDownloadManagerButtons'>" +
			"<a data-bind='events: { click: StartDownloadClick }, visible: StartDownloadButtonVisible, attr: {class: StartDownloadClass}'>" + (StartNow ? StartNow : txt("DOWNLOAD_NOW")) + "</a>" +
            "<a class='k-button' data-bind='events: { click: CancelDownloadClick }'>" + txt("CANCEL") + "</a> " +
			"</div>" +
            "<div id='Downloads'></div>" +
            "</div>";
        /*
        if ($("script[type='text/x-kendo-template'][id='catalog-thumb']").length == 0) {
            $("head").append("<script type='text/x-kendo-template' id='catalog-thumb'>" +
            "<div class='ccGalleryItem ccItemCATALOG' data-bind='click: SelectCatalog, attr: { grouptitle: GroupDesc}, html: GalleryItem'></div>" +
            "</script>");
        }
        */
        myApp.DownloadManager.DS.fetch(function () {

            var myDownloadContent = new kendo.View(myDownloadView, { model: myApp.DownloadManager });
            myDownloadContent.render("#ccDownloadContent");

            function onChange(arg) {
                //var selected = $.map(this.select(), function (item) {
                //calculate scrollTop distance
                if (myApp.DownloadManager.doScroll) {
                    myApp.DownloadManager.set("doScroll", false);
                    /*
                    this.element.find(".k-grid-content").animate({  // use $('html, body') if you want to scroll the body and not the k-grid-content div
                        scrollTop: this.select().offset().top  //  scroll to the selected row given by 'this.select()'
                    }, 400);
                //this.element.find(".k-grid-content").scrollTop(this.select().offset().top);
                */
                    var scrollContentOffset = this.element.find("tbody").offset().top;
                    var selectContentOffset = this.select().offset().top;
                    var distance = selectContentOffset - scrollContentOffset - 200;

                    //animate our scroll
                    this.element.find(".k-grid-content").animate({
                        scrollTop: distance
                    }, 400)
                }
                //});
            };    
            $("#Downloads").kendoGrid({
                dataSource: myApp.DownloadManager.DS,
                scrollable: true,
                selectable: "row",
                height: "500px",
                change: onChange,
                columns: [
                    {
                        field: "AccountTitle", title: txt("POS_MENU_ACCOUNTS")
                    },
                    {
                        field: "Name", title: txt("NAME")
                    },
                    {
                        field: "Activity", title: txt("ACTIVITY"), width: 300
                    },
                    {
                        field: "Result", title: txt("RESULT"), width: 80
                    },
                    {
                        field: "Action", title: "&nbsp;", width: "100px", template: function(data)  {
                            if (data.ShowDeleteButton) return "<a class='k-button ccDeleteDownloadCatalog'>" + txt("DELETE") + "</a>";
                            else return "&nbsp;";
                        }
                        /*
                        command: [
                            {
                                name: txt("DELETE"), click: function (e) {
                                    
                                }
                            }
                        ]
                        */
                    }
                ]
            });
            $("#Downloads").delegate(".ccDeleteDownloadCatalog", "click", function (e) {
                //ConfirmDialogShow({ "Message": txt("CONFIRM_DELETE_USER"), "Title": txt("DELETE"), "OKText": txt("DELETE") },
                //        function () {
                var grid = $("#Downloads").data("kendoGrid");
                var myRow = $(e.currentTarget).closest("tr");
                var myData = grid.dataSource.getByUid(myRow.attr("data-uid"));
                myApp.DBRemoveCatalogFromDownload(myData.DBKey, function () {
                    grid.removeRow(myRow);
                });
            });

            if (autostart) myApp.DownloadManager.StartDownloadClick();
        });
    },


    downloadCatalog: function (myCat, onSuccess, onError) {
        hideSpinner();
        totSize = 0.0;
        debug("downloadCatalog - Account:" + myCat.AccountTitle + "  CatalogName:" + myCat.Name);
        var myOfflineDataFile = ""; //ccDealerBaseDir + myCat.OfflineDir + "/" + myCat.OfflineFilename;
        if (myReader.FirstLoginUserProfile == "DEALER")
            myOfflineDataFile = ccOfflineBaseDir + myCat.OfflineDir + "/" + myCat.OfflineFilename;
        else
            myOfflineDataFile = ccDealerBaseDir + myCat.OfflineDir + "/" + myCat.OfflineFilename;
        myApp.DownloadManager.MainInfo("Katalog Informationen werden abgerufen");
        myApp.DownloadManager.SubInfo("Herunterladen...");
        try {
            var myDealerDataDir = myOfflineDataFile.substring(0, myOfflineDataFile.lastIndexOf("/"));
            var myDataFile = myOfflineDataFile.substring(myOfflineDataFile.lastIndexOf("/") + 1);
            var myCatalogDataDir = myOfflineDataFile.substring(0, myDealerDataDir.lastIndexOf("/offline")) + "/offline/" +
                myDataFile.substring(0, myDataFile.lastIndexOf("_")).toUpperCase();
        
            var ServerFile = "/" + myDealerDataDir + "/" + myDataFile;
            if (myCat.OfflineParentDir != "") ServerFile = myCat.OfflineParentDir + "/" + myCat.OfflineDir + "/" + myDataFile;

            debug("downloadCatalogFile: " + ServerFile);
            //debug("getFileSystem");
        
            if (myApp.BaseDir) {
                //debug("do with FileSystem: " + myApp.BaseDir.toURL());
                //Verzeichnis erstellen
                
                //debug("myDealerDataDir:"+myDealerDataDir);
                fileSystemHelper.checkDirectory(myApp.BaseDir, myDealerDataDir, "",
                    function (parent) {
                        myApp.DownloadManager.MainInfo("Katalog Stammdaten aktualisieren...");
                        myApp.DownloadManager.SubInfo("Herunterladen...");
                        myApp.DownloadZip2File(myApp.BaseDir, ServerFile, myDealerDataDir, function (file) {
                            myApp.CreateZipReader(file,
                                function (reader) {     //onSuccess
                                    myApp.getJsonFileFromZip(reader, myDataFile.replace(".zip", ".txt"),
                                        function (json) {
                                            var ccOffLineDatafiles = json;
                                            if (myApp.DownloadManager.doCancelDownload || isAPIVersionHigherOrEqual(OfflineCatalogMinApiVersion, ccOffLineDatafiles.APIVersion, true, "")) {
                                                fileSystemHelper.overwriteFile(parent, myDataFile.replace(".zip", ".txt"), $.serializeJSON(json), function () {

                                                    //jetzt alte versionen löschen....

                                                    DownloadSupplierMediaFiles(ccOffLineDatafiles, function () {
                                                        //debug("DownloadSupplierMediaFiles Success");
                                                        if (myApp.DownloadManager.doCancelDownload)
                                                            onSuccess();
                                                        else {
                                                            DownloadCatalogSpecificFiles(ccOffLineDatafiles, function () {
                                                                //debug("DownloadCatalogSpecificFiles Success");
                                                                if (myApp.DownloadManager.doCancelDownload)
                                                                    onSuccess();
                                                                else {
                                                                    DownloadColorsimFiles(ccOffLineDatafiles, function () {
                                                                        onSuccess(myCatalogDataDir);
                                                                    }, onError);
                                                                }
                                                            }, onError);
                                                        }
                                                    }, onError);
                                                }, 
                                                function (error) {
                                                    onError(error.message ? error.message : "Error overwriteFile " + error);
                                                });
                                            }
                                            else {
                                                onError([txt("WARNING_WRONG_CATALOG_API_VERSION").replace("%1", myCat.Name)]);
                                            }
                                        },
                                        function (Errors) {
                                            onError(Errors);
                                        }
                                    );
                                },
                                function (Errors) {
                                    onError(Errors);
                                }
                            );
                        },
                        function (Errors) {
                            onError(Errors);
                        })
                    },
                    function (e) {
                        onError(e);
                    }
                ); //ende checkDirectory
            } 
            else {
                onError("Request file system failed.");
            }
        }
        catch (e) {
            onError(e.message ? e.message : "Error downloadCatalog " + e);
        }

        function DownloadSupplierMediaFiles(ccOffLineDatafiles, success, onError) {
            if (ccOffLineDatafiles.SupplierMediaFiles) {
                myApp.DownloadManager.MainInfo("Allgemeine Lieferantenmedien aktualisieren...");
                myApp.DownloadManager.SubInfo("Herunterladen...");
                var mySupplierGUID = ccOffLineDatafiles.SupplierMediaFiles.BaseUrl.split("/").pop();
                var mySupplierDataDir = ccOffLineDatafiles.SupplierMediaFiles.BaseUrl.substring(0, ccOffLineDatafiles.SupplierMediaFiles.BaseUrl.lastIndexOf("/")) + "/offline/SU" + ShortGuid(mySupplierGUID);
                //var BaseURL = myReader.ServerURL + ccOffLineDatafiles.SupplierMediaFiles.BaseUrl;
                var BaseURL = myReader.ApiURL.replace("api.aspx", "file.ashx?url=") + ccOffLineDatafiles.SupplierMediaFiles.BaseUrl;
                if (myApp.Settings.DownloadSource == "LAN") BaseURL = myApp.Settings.DownloadMediaServerURL + mySupplierDataDir;
                    
                myApp.DownloadFilelist(mySupplierDataDir, ccOffLineDatafiles.SupplierMediaFiles, BaseURL, success, onError);
            }
            else {
                success();
            }
        };

        function DownloadCatalogSpecificFiles(ccOffLineDatafiles, success, onError) {
            if (ccOffLineDatafiles.CatalogMediaFiles) {
                myApp.DownloadManager.MainInfo("Modelspezifische Medien aktualisieren...");
                myApp.DownloadManager.SubInfo("Herunterladen...");
                //var BaseURL = myReader.ServerURL + ccOffLineDatafiles.CatalogMediaFiles.BaseUrl;
                var BaseURL = myReader.ApiURL.replace("api.aspx", "file.ashx?url=") + ccOffLineDatafiles.CatalogMediaFiles.BaseUrl;

                if (myApp.Settings.DownloadSource == "LAN") BaseURL = myApp.Settings.DownloadMediaServerURL + "/" + myCatalogDataDir;
                myApp.DownloadFilelist(myCatalogDataDir, ccOffLineDatafiles.CatalogMediaFiles, BaseURL, success, onError);
            }
            else {
                success();
            }
        };

        function DownloadColorsimFiles(ccOffLineDatafiles, success, onError) {
            if (ccOffLineDatafiles.ColorsimFiles && ccOffLineDatafiles.ColorsimFiles.length>0) {
                myApp.DownloadManager.MainInfo("Premium-Farbberatung aktualisieren...");
                myApp.DownloadManager.SubInfo("Herunterladen...");
                var actColosimNum = -1;
                function LoadNextColorsim() {
                    actColosimNum += 1;
                    if (ccOffLineDatafiles.ColorsimFiles.length > actColosimNum) {
                        if (ccOffLineDatafiles.ColorsimFiles[actColosimNum].BaseUrl != "") {
                            var ColURL = ccOffLineDatafiles.ColorsimFiles[actColosimNum].BaseUrl;
                            // wenn ? dann aktuellen API Path vor Fragezeichen ersetzen - /api2/cs.ashx?url=/colorsimdreic/CO72dca0500b66"
                            if (ColURL.lastIndexOf("?") > -1) {
                                ColURL = ColURL.substring(ColURL.lastIndexOf("?"));
                                ColURL = myReader.ApiPath.replace("api.aspx", "cs.ashx") + ColURL;
                            }
                            var BaseURL = myReader.ServerURL + ColURL;
                            var myColorsimID = BaseURL.split("/").pop(); // ccOffLineDatafiles.ColorsimFiles[actColosimNum].BaseUrl.substring(ccOffLineDatafiles.ColorsimFiles[actColosimNum].BaseUrl.lastIndexOf("/") + 1);
                            var myColorsimDir = myCatalogDataDir + "/" + myColorsimID;
                            if (myApp.Settings.DownloadSource == "LAN") BaseURL = myApp.Settings.DownloadMediaServerURL + "/" + myColorsimDir;

                            myApp.DownloadFilelist(myColorsimDir, ccOffLineDatafiles.ColorsimFiles[actColosimNum], BaseURL, function () {
                                actColosimNum += 1;
                                if (ccOffLineDatafiles.ColorsimFiles.length > actColosimNum) {
                                    LoadNextColorsim();
                                }
                                else success();
                            }, onError);
                        }
                        else LoadNextColorsim();
                    }
                    else {
                        success();
                    }
                };
                LoadNextColorsim();
            }
            else {
                success();
            }
        };

       
    },

    DownloadFilelist: function (LocalDir, MediaFilesArr, BaseUrl, success, onError) {
        fileSystemHelper.checkDirectory(myApp.BaseDir, LocalDir, "", function (parentDir) {
            myApp.DownloadManager.SubInfo("Analyse");
            var directoryReader = parentDir.createReader();
            var s = 0, l = 0, a=0, lastFileName;
            directoryReader.readEntries(function (entries) {
                var DownloadFilesArr = [];
                MediaFilesArr.Files.sort(function (a, b) {
                    return a.Filename < b.Filename ? -1 : b.Filename < a.Filename ? 1 : 0;
                });
                debug("Analyze MediaFilesArr");
                $.each(MediaFilesArr.Files, function () {
                    var found = false, checkFileName = this.Filename.toUpperCase();
                    if (checkFileName == lastFileName) {
                        found = true;
                    }
                    else {
                        lastFileName = checkFileName;
                        for (var i = 0; i < entries.length; i++) {
                            if (entries[i].name.toUpperCase() == checkFileName) {
                                a++;
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        if (this.QueryString && this.QueryString.substring(0, 4) != "http") this.QueryString = myReader.ServerURL + "/" + this.QueryString;
                        DownloadFilesArr.push({
                            "BaseUrl": (this.QueryString ? this.QueryString.substring(0, this.QueryString.lastIndexOf("/") + 1) : BaseUrl + "/"),
                            "filename": this.Filename
                        });
                    }
                });
                l = DownloadFilesArr.length;
                debug("Download " + DownloadFilesArr.length + " files. " + a + " files already installed.");

                function DoDownload(FilesArr, maxParallelThreads, isSecondTry) {
                    var lastPerc = null, SecondTry = [], Errors=[];

                    //debug("DownloadFilelist LocalDir:" + LocalDir + " - Anzahl:" + FilesArr.length + "  maxParallelThreads:" + maxParallelThreads)
                    function doFileTransfer(URL, localFilePath, done) {
                        var Err = ["OK", "FILE_NOT_FOUND_ERR", "INVALID_URL_ERR", "CONNECTION_ERR", "ABORT_ERR", "NOT_MODIFIED_ERR"];
                        if (ccIsOnlineConnection) {
                            var fileTransfer = new FileTransfer();
                            var uri = encodeURI(URL);
                            //console.log(uri);
                            fileTransfer.download(
                                uri,
                                localFilePath,
                                function (entry) {
                                    s += 1;
                                    //if (isSecondTry) {
                                    //debug("Second try successfull: " + entry.fullPath);
                                    //}
                                    /*
                                    //Kontrolle, ob downgeloadener Dateiname mit gelistetem Dateinamen übereinstimmt!
                                    //debug(entry);
                                    var myFilename = entry.name;
                                    parentDir.getFile(myFilename, { create: false, exclusive: false },
                                        function (fileEntry) {
                                            debug(fileEntry);
                                        },
                                        function (err) {
                                            Errors.push("Warning: Filename Case Sensitivity mismatch: " + myFilename);
                                        }
                                    )
                                    */
                                    if (done) done();
                                },
                                function (error) {
                                    var err = undefined;
                                    //console.log("download error target " + error.target);
                                    //console.log("download error " + Err[error.code]);
                                    if (error.code == 3) {
                                        var myFilename = error.source.substring(error.source.lastIndexOf("/") + 1);
                                        if (isSecondTry) {
                                            //debugErr(null, "doFileTransfer - Download error " + Err[error.code] + " - Source: " + error.source);
                                            err = "Error " + Err[error.code] + "  Source:" + error.source;
                                            Errors.push("Source not found: " + error.source);
                                            //leere Datei jetzt löschen!

                                            parentDir.getFile(myFilename, { create: false, exclusive: false },
                                                function (fileEntry) {
                                                    //debug("Remove file " + myFilename);
                                                    fileEntry.remove(
                                                         function () {
                                                             //debug("File " + myFilename + " Removed!");
                                                         }
                                                    );
                                                },
                                                function () {
                                                    debugErr(null, "doFileTransfer - Remove Existing File: " + myFilename);
                                                }
                                            );
                                        }
                                        else
                                            SecondTry.push({ "BaseUrl": error.source.substring(0, error.source.lastIndexOf("/") + 1), "filename": myFilename });
                                    }
                                    if (done) done(err);
                                },
                                true,
                                {
                                    //headers: {
                                    //    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                    //}
                                }
                            );
                        }
                        else if (onError) onError();
                    };

                    var t = 0, i = 0, f = FilesArr.length, lastD=0;
                    function downloadNextFile() {
                        //debug("downloadNextFile");
                        if (!myApp.DownloadManager.doCancelDownload && t < maxParallelThreads && FilesArr.length > 0) {
                            //debug("t:" + t + "  i:" + i+ "  f:" + f + "  l:" + l);
                            var loadFile = FilesArr.shift();
                            if (loadFile) {
                                var target = parentDir.toURL() + "\/" + loadFile.filename;
                                //debug("source:" + loadFile.BaseUrl + loadFile.filename);
                                //debug("target:" + target);
                                t += 1;
                                doFileTransfer(
                                    loadFile.BaseUrl + loadFile.filename,
                                    target,
                                    function (err) {
                                        //debug("A" + myApp.doCancelDownload + " isSecondTry:" + isSecondTry + "t:"+t);
                                        i += 1;
                                        t = t - 1;
                                        if (err) {
                                            debug(s + " of " + l + " -  " + err);
                                        }
                                        else {
                                            var newPerc = Math.round(s / l * 100);
                                            if (newPerc != lastPerc) {
                                                myApp.DownloadManager.SubInfo(newPerc + "%");
                                                lastPerc = newPerc;
                                                if (Math.round(newPerc / 10) == (newPerc / 10)) {
                                                    debug(newPerc + "%");
                                                }
                                            }
                                        }
                                        if (i == f) {
                                            if (SecondTry.length > 0) {
                                                debug("SecondTry:" + SecondTry.length);
                                                DoDownload(SecondTry, 1, true);
                                            }
                                            else {
                                                if (Errors.length>0) {
                                                    onError(Errors);
                                                }
                                                else success();
                                            }
                                        }
                                        else {
                                            if (myApp.DownloadManager.doCancelDownload && t == 0) {
                                                if (Errors.length > 0) {
                                                    onError(Errors);
                                                }
                                                else success();
                                            }
                                            else if (FilesArr.length > 0) downloadNextFile();
                                        }
                                    }
                                );
                                if (t < maxParallelThreads && FilesArr.length > 0) {
                                    downloadNextFile();
                                }
                            }

                        }
                    }
                    downloadNextFile();
                };
                if (!myApp.DownloadManager.doCancelDownload && DownloadFilesArr.length > 0) {
                    DoDownload(DownloadFilesArr, DownloadFirstWithMaxParallelThreads, false);
                }
                else {
                    //debug("download success");
                    success();
                }
            });
        },
        myApp.onError);
    },
    
    CreateZipReader: function (file, onSuccess, onError) {
        var reader = new FileReader();
        var myFile = file.name;
        reader.onloadend = function (evt) {
            try {
                var new_zip = new JSZip(evt.target.result);
                // more files !
                //new_zip.load(myBinary);
                // you now have every files contained in the loaded zip
                //new_zip.file("CA16f073322fc64c90b15e_v009.txt").asText(); // "Hello World\n"
                //$.parseJSON(new_zip.file("CA16f073322fc64c90b15e_v009.txt").asText())
                onSuccess(new_zip);
            }
            catch(e) {
                debugErr(e, "CreateZipReader", false);
                if (onError) onError("CreateZipReader: " + myFile);
            }
        };
        /*
        reader.onerror = function (err) {
            debugErr(null, "CreateZipReader: " + myFile, false);
            if (onError) onError("CreateZipReader: " + myFile);
        };
        */
        reader.readAsArrayBuffer(file);
        //reader.readAsBinaryString(file);
    },

    getJsonFileFromZip: function (ZipReader, useFilename, onSuccess, onError) {
        debug("getJsonFileFromZip:" + useFilename);

        var myFile = ZipReader.file(useFilename);
        if (myFile) {
            try {
                onSuccess(parseJSON(myFile.asText()));
            }
            catch (e) {
                onError("getJsonFileFromZip Filename: " + useFilename);
            }
        }
        else {
            onError("getJsonFileFromZip Filename " + useFilename + " not found!");
        }
    },

    DownloadZip2File: function (BaseDir, ZipFile, TargetDir, onSuccess, onError) {

        //var uri = encodeURI(myReader.ServerURL + ZipFile);
        var uri = encodeURI(myReader.ApiURL.replace("api.aspx", "file.ashx?url=") + ZipFile);

        if (ZipFile.substring(0, 1) == "/") ZipFile = ZipFile.substring(1);
        //var myDir = ZipFile.substring(0, ZipFile.lastIndexOf("/"));
        var myFile = ZipFile.substring(ZipFile.lastIndexOf("/") + 1);
        fileSystemHelper.checkDirectory(myApp.BaseDir, TargetDir, "", function (parentDir) {

            var Err = ["OK", "FILE_NOT_FOUND_ERR", "INVALID_URL_ERR", "CONNECTION_ERR", "ABORT_ERR", "NOT_MODIFIED_ERR"];
            if (ccIsOnlineConnection) {
                var fileTransfer = new FileTransfer();
                var target = parentDir.toURL() + "\/" + myFile;
                fileTransfer.download(
                    uri,
                    target,
                    function (entry) {
                        //entry.file(onSuccess, onError);
                        parentDir.getFile(myFile, {},
                            function (fileEntry) {
                                fileEntry.file(onSuccess);
                            },
                            function (err) {
                                onError(err);
                            }
                        );
                    },
                    function (error) {
                        var err = undefined;
                        console.log("DownloadZip2File: error " + Err[error.code] + " - Source: " + error.source);
                        if (onError) onError(["DownloadZip2File: error " + Err[error.code] + " - Source: " + error.source]);
                    },
                    true,
                    {
                        // headers: {
                        //     "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                        // }
                    }
                );
            }
            else if (onError) onError();
        });
    },

    ShowDocument: function (Url, done) {
        debug("ShowDocument: " + Url);

        /*handleDocumentWithURL(
            function () {
                if (done) done();
            },
            function (error) {
                if (error == 53) {
                    if (Url.toLowerCase().substring(Url.lastIndexOf(".") + 1) == "pdf" && device.platform.toLowerCase() === "android") {
                        MsgBox("<div>" + txt("NO_PDF_READER_INSTALLED") + "</div>", "", "", function () {
                            window.open("https://play.google.com/store/apps/details?id=com.adobe.reader", "_blank", "location=yes,hidden=no");
                        });
                    }
                    else {
                       debugErr(null, 'No app installed, that handles this file type: ' + Url.substring(Url.lastIndexOf(".") + 1), true);
                    }
                }
                else debugErr(null, 'handleDocumentWithURL: ' + Url, true);
            },
            Url.toLowerCase()
        );
        */ 
         
        var FileName = Url.substring(Url.lastIndexOf("/") + 1);

        if (device.platform.toLowerCase() === "android") { 
            // file:///storage/emulated/0/Android/data/<app-id>/files/
            // Directory has to be public, for the default pdf viewer to read it.
            TempURL = cordova.file.externalDataDirectory + "/" + FileName;
            window.resolveLocalFileSystemURL(            // Check whether the sample PDF file exists.
                TempURL,
                myApp.loadDocFromFileEntry, // wenn vorhanden gleich öffnen
                function (error) {          // wenn nicht vorhanden zuerst kopieren
                    myApp.copyFile(
                        Url, //myApp.getWorkingFolderFileURL(FileName),
                        TempURL,
                        myApp.loadDocFromFileEntry, // dann öffnen
                        function (error) {
                            alert("Error copying file.");
                            console.log("Error: " + JSON.stringify(error, null, 4));
                        }
                    );
                }
            );
        } 
        else {
            myApp.loadDoc(Url);
        }
    },

    loadDoc: function(targetUrl) {
        windowTarget = device.platform.toLowerCase() === "ios" ? "_blank" : "_system";
        console.log("Loading PDF file from: " + targetUrl);
        var w = window.open(targetUrl, windowTarget, "location=yes,hidden=no");


        /*
        w.addEventListener('exit', function () {
            alert("exit " + event.url);
        });
        w.addEventListener('loaderror', function () {
            alert("loaderror " + event.url);
        });
        w.addEventListener('loadstart', function () {
            alert("loadstart " + event.url);
        });
        w.addEventListener('loadstop', function () {
            alert("loadstop " + event.url);
        }); 
        */
        /*window.setTimeout(function () {       // geht so leider nicht..
            if (!w) {
                MsgBox("<div>" + txt("NO_PDF_READER_INSTALLED") + "</div>", "", "", function () {
                    window.open("https://play.google.com/store/apps/details?id=com.adobe.reader", "_blank", "location=yes,hidden=no");
                });
            }
        }, 500);*/
    },

    loadDocFromFileEntry: function(fileEntry) {
        myApp.loadDoc(fileEntry.toURL());
    },

    getWorkingFolderURL: function () {
	    var indexUrl = window.location.href;
        return indexUrl.substring(0, indexUrl.indexOf("index.html"));
    },

    getWorkingFolderFileURL: function (filePath) {
        return myApp.getWorkingFolderURL().replace("http://", "file://") + filePath;
    },

    copyFile: function (sourceUri, targetUri, successFunction, errorFunction) {
        var fileTransfer = new FileTransfer();
        console.log("Copying PDF file from: " + sourceUri + " to: " + targetUri);	
        fileTransfer.download(encodeURI(sourceUri),encodeURI(targetUri),successFunction,errorFunction);
    },

    CheckOfflineGroup: function (BaseDir, Files, myDir, DownloadFiles, done) {
        var totSize = 0.0;
        if (myDir.substring(0, 1) == "/") myDir = myDir.substring(1);
        debug("myDir: " + myDir);

        fileSystemHelper.checkDirectory(BaseDir, myDir, "",
            function (myParent, data) {
                $.each(Files, function () {
                    var myFilename = this.Filename;
                    var myIsBinary = this.IsBinary;

                    //debug("check:"+ myFilename)
                    fileSystemHelper.checkFileEntry(myParent, myFilename,
                        function (file) {
                            if (!file) {
                                DownloadFiles.push({ "Filename": myFilename, "Dir": myDir, "Parent": myParent, "IsBinary": myIsBinary });
                                totSize += this.FileSize;
                            }
                        }
                    );
                });
                done();

                //done(totSize);
                //debug("Download "+DownloadFiles.length+" files - Size: "+((Math.floor(totSize/10000)/100))+"MB");

            },
            function () {
                debug("Directory not created!");
                count--;
            }
        );
    },


    onSuccess: function (value) {
        if (value)
            debug("onSuccess: " + value);
    },
    onError: function (err) {
        var msg = "myApp.onError: ";
        if (err && err.code) msg+="Errorcode: " + err.code+", ";
        if (err && err.message) msg += "Errormessage: " + err.message + ", ";
        if (err && err.error) msg += "Errormessage: " + err.error + ", ";
        if (msg == "myApp.onError: " && err) {
            for (var e in err) {
                msg += e + "  " + err[e] + ", ";
            }
        }
        debugErr(null, msg, true);
    },

    //Printer Functions
    checkAvailable: function () {
        if (!this.checkSimulator("printer")) {
            window.plugin.printer.isServiceAvailable(
                function (isAvailable) {
                    alert(isAvailable ? 'Service is available' : 'Service not available');
                }
            );
        }
    },

    printThisPage: function () {
        var myBody = "<body class='ccPrintBody'>" + $("body").html() + "</body>";
        var myStyles = "";

        var cssScripts = [];

        var links = $("link[type='text/css']");
        for (var i = 0; i < links.length; i++) {
            cssScripts.push($(links[i]).attr("href"));
        }

        function loadCssScripts() {
            if (cssScripts.length > 0) {
                var nextScript = cssScripts.shift();
                $.ajax({
                    url: nextScript,
                    type: "GET",
                    error: function (xhr, ajaxOptions, thrownError) {
                        ajaxError(xhr, ajaxOptions, thrownError);
                    },
                    success: function (data) {
                        myStyles += "<style type='text/css'>" + data + "</style>";
                        loadCssScripts();
                    }
                });
            }
            else {
                var myPage = "<html>" + myStyles + myBody + "</html>";
                if (myApp.checkSimulator("printer")) {
                    window.print();
                }
                else {
                    // note: for the layout to look nice on iOS you need to include all <style> rules inside the printed html
                    window.plugin.printer.print(
                        myPage,
                        {}, // options, not currently used
                        function (msg) { console.log('ok: ' + msg) },
                        function (msg) {
                            debugErr(null, "window.plugin.printer.print: " + msg, true);
                        }
                    );
                }
            }
        }
        loadCssScripts();
    },

    printParagraph: function () {
        if (!this.checkSimulator("printer")) {
            window.plugin.printer.print(
                document.getElementById('printParagraph').innerHTML,
                {}, // options, not currently used
                function (msg) { console.log('ok: ' + msg) },
                function (msg) {
                    debugErr(null, "printParagraph: " + msg, true);
                }
            );
        }
    },

    // Prevent Sleep 
    PreventGotoSleep: function () {
        if (!this.checkSimulator("insomnia")) {
            window.plugins.insomnia.keepAwake(
                function () { debug("insomnia.keepAwake successfully"); },
                function (e) { debugErr(e, "insomnia.keepAwake", false); }
            );
        }
    },
    AllowSleep: function () {
        if (!this.checkSimulator("insomnia")) {
            window.plugins.insomnia.allowSleepAgain(
                function () { debug("insomnia.allowSleepAgain successfully"); },
                function (e) { debugErr(e, "insomnia.allowSleepAgain", false); }
            );
        }
    },

    // check if plugin is installed
    checkSimulator: function (what) {
        if (window.navigator.simulator === true) {
            alert('This plugin '+what+ ' is not available in the simulator.');
            return true;
        }
        else if (window.plugin === undefined || window.plugin[what] === undefined) {
            if (window.plugins === undefined || window.plugins[what] === undefined) {
                alert('Plugin ' + what + ' not found. Maybe you are running in AppBuilder Companion app which currently does not support this plugin.');
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    },

    
    //Status + NavigationBar Handler
    goFullscreen: function(hideAllBars) {
        if (hideAllBars) {
            //debug("hideAllBars");
            //window.navigationbar.hide();
            //if (StatusBar) StatusBar.hide();

        }
        else {
            //debug("showAllBars");
            //window.navigationbar.show();
            //if (StatusBar) StatusBar.show();
        }
    },
     
    //DB Handler
    DBopen: function () { 
        try { 
            if (window.navigator.simulator === true) {  // For debugin in simulator fallback to native SQL Lite
                //console.log("Use built in SQL Lite");
                myApp.DB = window.openDatabase("DIVA", "1.0", "dbDIVA", 4000000);
                return true; 
            }
            else {
                myApp.DB = window.sqlitePlugin.openDatabase({ name: "DIVA" });
                if(myApp.DB) {    
                    console.log("SQLite opend successfull");
                    return true;
                }
                else {
                    console.log("SQLite failed");
                    myApp.DB = window.openDatabase("DIVA", "1.0", "dbDIVA", 4000000);
                    return true;
                }
            }
        }
        catch (e) {
            alert("Error opening Database! " + e.message);
        }
        return false;
    },
    DBdropAlltables: function (done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("DROP TABLE DivaData", [], function () {
                tx.executeSql("DROP TABLE DivaAccounts", [], function () {
                    tx.executeSql("DROP TABLE DivaBaskets", [], function () {
                        tx.executeSql("DROP TABLE DivaCatalogs", [], function () {
                            done();
                        }, myApp.onError);
                    }, myApp.onError);
                }, myApp.onError);
            }, myApp.onError);
        });
    },
    DBUpdateIfNotExist: function (tablename, field, type) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM sqlite_master where name=? and type=?", [tablename,"table"],
                function (transaction, results) {
                    if (results.rows.length == 1) {
                        var row = results.rows.item(0);
                        if (row["sql"].lastIndexOf(field) == -1) {
                            tx.executeSql("ALTER TABLE "+tablename+" ADD COLUMN "+field+" "+ type, [],
                                function (transaction, results) {
                                    console.log("Tabelle " + tablename+" erfolgreich aktualisiert!");
                                },
                                function (transaction, results) {
                                    myApp.onError(results);
                                }
                            );
                        }
                    }
                }
            );
        });
    },
    DBcreateTable: function() {
        //myApp.DBdropAlltables(function () {
            var db = myApp.DB;
            db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS DivaData(key TEXT PRIMARY KEY, Settings TEXT, json TEXT, added_on DATETIME)", []);
                myApp.DBUpdateIfNotExist("DivaData", "Settings", "TEXT");            // In Tabelle DivaCatalogs Feld OfflineDir ergänzen
                myApp.AddDebugTable("DivaData");

                tx.executeSql("CREATE TABLE IF NOT EXISTS DivaCatalogs(key TEXT PRIMARY KEY, Retailer TEXT, Account TEXT, CatalogGUID TEXT, Codex TEXT, OfflineDir TEXT, json TEXT, added_on DATETIME)", []);
                myApp.DBUpdateIfNotExist("DivaCatalogs", "OfflineDir", "TEXT");            // In Tabelle DivaCatalogs Feld OfflineDir ergänzen
                myApp.DBUpdateIfNotExist("DivaCatalogs", "SupplierGUID", "TEXT");            // In Tabelle DivaCatalogs Feld SupplierGUID ergänzen
                myApp.DBUpdateIfNotExist("DivaCatalogs", "ToDownLoad", "INTEGER");            // In Tabelle DivaCatalogs Feld ToDownLoad ergänzen 1= ist noch herunterzuladen
                myApp.DBUpdateIfNotExist("DivaCatalogs", "Errors", "TEXT");
                myApp.DBUpdateIfNotExist("DivaCatalogs", "Collection", "TEXT");
                myApp.AddDebugTable("DivaCatalogs");

                tx.executeSql("CREATE TABLE IF NOT EXISTS DivaAccounts(key TEXT PRIMARY KEY, Retailer TEXT, json TEXT, added_on DATETIME)", []);
                myApp.AddDebugTable("DivaAccounts");
                tx.executeSql("CREATE TABLE IF NOT EXISTS DivaBaskets(key TEXT PRIMARY KEY, Retailer TEXT, Account TEXT, json TEXT, added_on DATETIME)", []);
                myApp.AddDebugTable("DivaBaskets");
                tx.executeSql("CREATE TABLE IF NOT EXISTS DivaFavorits(key TEXT PRIMARY KEY, Retailer TEXT, Name TEXT, json TEXT, added_on DATETIME)", []);
                myApp.AddDebugTable("DivaFavorits");
                //tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME)", []);
            });
        //});
    },

    // DownloadFiles
    ShowDBTable: function (parentID, tableName) {
        var db = myApp.DB, mySql = "SELECT * FROM " + tableName;
        myApp.SettingsModel.set("ShowTableName", tableName);
        db.transaction(function (tx) {
            if ((tableName == "DivaCatalogs" || tableName == "DivaAccounts" || tableName == "DivaBaskets") && myApp.SettingsModel.ActBaseDir != "")
                mySql += " Where Retailer='" + myApp.SettingsModel.ActBaseDir + "'";
            tx.executeSql(mySql, [],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        $(parentID).html("No entries!");
                    }
                    else {
                        $(parentID).html(results.rows.length + " entries:");
                        var myLine = "<table class='grid'><tr>";
                        var row = results.rows.item(0);
                        for (var item in row) {
                            myLine += "<th>" + item + "</th>"
                        }
                        myLine += "</tr>";
                        for (var i = 0; i < results.rows.length; i++) {
                            myLine += "<tr>";
                            var row = results.rows.item(i);
                            for (var item in row) {
                                if (item == "json") {
                                    myLine += "<td class='ccDebugJson'><span>" + row[item].substring(0, 40) + "..</span><div style='display:none;'>" + row[item] + "</div></td>"
                                }
                                else
                                    myLine += "<td>" + row[item] + "</td>"
                            }
                            myLine += "</tr>";
                        }
                        myLine += "</table>";
                        $(parentID).append(myLine);
                        $(parentID+" .grid").kendoGrid({
                            sortable: true,
                            scrollable: {
                                virtual: true
                            },
                            filterable: true,
                            selectable: "cell",
                            columnMenu: true,
                            change: function (e) {
                                /*var selected = $.map(this.select(), function (item) {
                                    return $(item).text();
                                });
                                debug(selected);*/
                                var grid = $(parentID + " .grid").data("kendoGrid");
                                if (grid) {
                                    if ($(this.select()).find("div").length > 0) {
                                        var myText = $(this.select()).find("div").html();
                                        var myJson = parseJSON(myText);
                                        var myHeader = "Parameter:\r" +
                                                (myJson.ServerURL ? "ServerURL: " + myJson.ServerURL + "\r" : "") +
                                                (myJson.DealerGUID ? "DealerGUID: " + myJson.DealerGUID + "\r" : "") +
                                                (myJson.DealerGuid ? "DealerGuid: " + myJson.DealerGuid + "\r" : "") +
                                                (myJson.DealerName ? "DealerName: " + myJson.DealerName + "\r" : "") +
                                                (myJson.UserName ? "UserName: " + myJson.UserName + "\r" : "") +
                                                (myJson.UserRoles ? "UserRoles: " + myJson.UserRoles + "\r" : "") +
                                                (myJson.Mode ? "Mode: " + myJson.Mode + "\r" : "") +
                                                (myJson.AccountGUID ? "AccountGUID: " + myJson.AccountGUID + "\r" : "") +
                                                (myJson.Accountname ? "Accountname: " + myJson.Accountname + "\r" : "") +
                                                (myJson.AccountTitle ? "AccountTitle: " + myJson.AccountTitle + "\r" : "") +
                                                (myJson.Name ? "Name: " + myJson.Name + "\r" : "") +
                                                (myJson.Codex ? "Codex: " + myJson.Codex + "\r" : "") +
                                                (myJson.GUID ? "GUID: " + myJson.GUID + "\r" : "") +
                                                (myJson.LastUpdate ? "LastUpdate: " + myJson.LastUpdate + "\r" : "") +
                                                (myJson.OfflineFilename ? "OfflineFilename: " + myJson.OfflineFilename + "\r" : "") +
                                                (myJson.OfflineFileSize ? "OfflineFileSize: " + myJson.OfflineFileSize + "\r" : "") +
                                                (myJson.OfflineVersion ? "OfflineVersion: " + myJson.OfflineVersion + "\r" : "");

                                        showInputBox({
                                            title: "Json",
                                            defaultValue: myHeader + "\r\r" + myText,
                                            cols: 50,
                                            rows: 40,
                                            height: "500px"
                                        });
                                    }
                                    else
                                        grid.editRow($(this.select()).closest("tr"));
                                }
                            },
                            editable: "popup"
                        });
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
    AddDebugTable: function (tableName) {
        $("#debug").append("<div id='TBL" + tableName + "'><span>" + tableName + "</span><div></div></div>")
        $("#TBL" + tableName + " span").click(function () {
            myApp.ShowDBTable("#TBL" + tableName + " div", tableName);
        });
    },

    //Favorits    
    DBGetFavorits: function (Retailer, onSuccess) {
        var db = myApp.DB;
        var myFavorits = [];
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaFavorits where Retailer=?", [Retailer],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        onSuccess(myFavorits);
                    }
                    else {
                        for (var i = 0; i < results.rows.length; i++) {
                            var row = results.rows.item(i);
                            myFavorits.push({ "id": i+1, "parentId": null, "Name": row.Name, "Key": row.key });   //parseJSON(row.json));
                        }
                        onSuccess(myFavorits);
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
     
    DBGetFavorit: function (key, onSuccess) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaFavorits where key=?", [key],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        onSuccess(null);
                    }
                    else {
                        onSuccess(parseJSON(results.rows.item(0).json));
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
    DBUpdateFavorit: function (key, Retailer, Name, insertOnly, json, done, InsertOnlyError) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaFavorits where key=?", [key],
                function (transaction, results) {
                    var addedOn = new Date();
                    if (results.rows.length == 0) {     //insert new
                        debug("INSERT INTO DivaFavorits: " + key);
                        tx.executeSql("INSERT INTO DivaFavorits(key, Retailer, Name, json, added_on) VALUES (?,?,?,?,?)",
                                        [key, Retailer, Name, $.serializeJSON(json), addedOn],
                                        function () {
                                            done(true);
                                        },
                                        function (transaction, results) {
                                            myApp.onError(results);
                                        });
                    }
                    else {      //update existing
                        if (insertOnly) InsertOnlyError();
                        else {
                            debug("UPDATE DivaFavorits: " + key);
                            tx.executeSql("UPDATE DivaFavorits set Retailer=?, Name=?, json=?,added_on=? where key=?;",
                                            [Retailer, Name, $.serializeJSON(json), addedOn, key],
                                            function () {
                                                done(false);
                                            },
                                            function (transaction, results) {
                                                myApp.onError(results);
                                            });  // array of values for the ? placeholders
                        }
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
    DBDeleteFavorit: function (key, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("DELETE FROM DivaFavorits WHERE key=?", [key],
                            function () { if (done) done() },
                            myApp.onError);
        });
    },


    //Baskets
    DBGetBaskets: function (Retailer, onSuccess) {
        var db = myApp.DB;
        var myBaskets = [];
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaBaskets where Retailer=?", [Retailer],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        onSuccess(myBaskets);
                    }
                    else {
                        for (var i = 0; i < results.rows.length; i++) {
                            var row = results.rows.item(i);
                            myBaskets.push(parseJSON(row.json));
                        }
                        onSuccess(myBaskets);
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
    DBUpdateBaskets: function (key, Retailer, json, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaBaskets where key=?", [key],
                function (transaction, results) {
                    var addedOn = new Date();
                    if (results.rows.length == 0) {     //insert new
                        debug("INSERT INTO DivaBaskets: " + key);
                        tx.executeSql("INSERT INTO DivaBaskets(key, Retailer, json, added_on) VALUES (?,?,?,?)",
                                        [key, Retailer, $.serializeJSON(json), addedOn],
                                        function () {
                                            done(true);
                                        },
                                        function (transaction, results) {
                                            myApp.onError(results);
                                        });
                    }
                    else {      //update existing
                        debug("UPDATE DivaBaskets: " + key);
                        tx.executeSql("UPDATE DivaBaskets set Retailer=?, json=?,added_on=? where key=?;",
                                        [Retailer, $.serializeJSON(json), addedOn, key],
                                        function () {
                                            done(false);
                                        },
                                        function (transaction, results) {
                                            myApp.onError(results);
                                        });  // array of values for the ? placeholders
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
    DBDeleteBasket: function (key, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("DELETE FROM DivaBaskets WHERE key=?", [key],
                          function () { if (done) done() },
                          myApp.onError);
        });
    },


    /// UserAccounts  
    DBGetUserAccounts: function (onSuccess) {
        var db = myApp.DB;
        var myUserAccounts = [];
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaData where Settings NOT NULL", [],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        onSuccess(myUserAccounts);
                    }
                    else {
                        for (var i = 0; i < results.rows.length; i++) {
                            var row = results.rows.item(i);
                            var myUserAccount = parseJSON(row.json);
                            myUserAccount.BaseDir = "files/" + myUserAccount.ServerID + "/offline_" + ShortGuid(myUserAccount.DealerGuid) + "/";
                            myUserAccounts.push(myUserAccount);
                        }
                        onSuccess(myUserAccounts);
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },


    /// Accounts  
    DBGetAccounts: function (Retailer, onSuccess) {
        var db = myApp.DB;
        var myAccounts={"Accounts":[], "CacheFile": "","LastUpdate": "","ThereAreWarnings": "False", "UserRole": ""};
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaAccounts where Retailer=?", [Retailer],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        onSuccess(myAccounts);
                    }
                    else {
                        for (var i = 0; i < results.rows.length; i++) {
                            var row = results.rows.item(i);
                            try {
                                var myAccount = parseJSON(row.json);
                                if (myAccount.AccountGUID)
                                    myAccounts.Accounts.push(myAccount);
                                else {
                                    debugErr(null, "DBGetAccounts: Invalid Offline Account: " + row.json, false)
                                    myApp.DBDeleteCatalog("", ccRetailerBaseDir, row.key);
                                }

                            }
                            catch (e) {
                                debugErr(e, "DBGetAccounts: Invalid Offline Account: " + row.json, false)
                                myApp.DBDeleteCatalog("", ccRetailerBaseDir, row.key);
                            }
                        }
                        onSuccess(myAccounts);
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
    DBUpdateAccount: function (myAccount, Retailer, done) {
        var db = myApp.DB;
        if (!myAccount) done();
        myAccount["Warning"] = "";
        myAccount["Error"] = "";
        myAccount["AccountStatus"] = "";
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaAccounts where key=?", [myAccount.AccountGUID],
                function (transaction, results) {
                    var addedOn = new Date();
                    if (results.rows.length == 0) {     //insert new
                        debug("INSERT INTO DivaAccounts: " + myAccount.AccountGUID);
                        tx.executeSql("INSERT INTO DivaAccounts(key, Retailer, json, added_on) VALUES (?,?,?,?)",
                                        [myAccount.AccountGUID, Retailer, $.serializeJSON(myAccount), addedOn],
                                        function () {
                                            done(true);
                                        },
                                        function (transaction, results) {
                                            myApp.onError(results);
                                        });
                    }
                    else {      //update existing
                        debug("UPDATE DivaAccounts: " + myAccount.AccountGUID);
                        tx.executeSql("UPDATE DivaAccounts set Retailer=?, json=?,added_on=? where key=?;",
                                        [Retailer, $.serializeJSON(myAccount), addedOn, myAccount.AccountGUID],
                                        function () {
                                            done(false);
                                        },
                                        function (transaction, results) {
                                            myApp.onError(results);
                                        });  // array of values for the ? placeholders
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },

    DBDeleteAccount: function (key, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("DELETE FROM DivaAccounts WHERE key=?", [key],
                function () {
                    if (done) done();
                },
                myApp.onError);
        });
    },

    /// Catalogs  
    DBGetCatalogByOfflineDir: function (OfflineDir, onSuccess) {
        var db = myApp.DB; Retailer=[];
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaCatalogs where OfflineDir=?", [OfflineDir],
                function (transaction, results) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var row = results.rows.item(i);
                        Retailer.push(row.Retailer);
                    }
                    onSuccess(Retailer);
                }
            );
        });
    },
    DBGetCatalogs: function (Retailer, Account, ToDownload, onSuccess) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            var myQuery = "SELECT * FROM DivaCatalogs where Retailer='" + Retailer+"'";
            if (Account != "") myQuery += " and Account='"+Account+"'";
            if (ToDownload != "") myQuery += " and ToDownload=" + ToDownload;
            tx.executeSql(myQuery, [],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        onSuccess(null);
                    }
                    else {
                        var myCatalogs = [];
                        for (var i = 0; i < results.rows.length; i++) {
                            var row = results.rows.item(i);
							var replacer = new RegExp(":undefined", "g");
                            var json = row.json.replace(replacer, ":\"\"");
                            var myCat = parseJSON(json);
                            if (myCat) {
                                myCat.ToDownLoad = row.ToDownLoad;
                                myCat.CatalogListAccountGUID = row.Account;
                                myCat.DBKey = row.key;
                                myCatalogs.push(myCat);
                            }
                        }
                        onSuccess(myCatalogs);
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },
    DBInsertCatalog: function (key, Retailer, Account, Collection, CatalogGUID, OfflineDir, SupplierGUID, myCatalogItem, done) {
        var db = myApp.DB;

        db.transaction(function (tx) {
            debug("INSERT INTO DivaCatalogs: " + key);
            var addedOn = new Date();
            var json = $.serializeJSON(myCatalogItem);
            tx.executeSql("INSERT INTO DivaCatalogs(key, Retailer, Account, Collection, CatalogGUID, OfflineDir, SupplierGUID, json, added_on) VALUES (?,?,?,?,?,?,?,?,?)",
            [key, Retailer, Account,Collection, CatalogGUID, OfflineDir, SupplierGUID, json, addedOn],
            function () {
                done(true);
            },
            function (transaction, results) {
                myApp.onError(results);
            });
        });
    },
    DBUpdateCatalog: function (key, Retailer, Account, Collection, CatalogGUID, OfflineDir, SupplierGUID, ToDownLoad, CatalogErrors, myCatalogItem, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            debug("UPDATE DivaCatalogs: " + key);
            var mySQL = "UPDATE DivaCatalogs set Retailer=?, Collection=?, CatalogGUID=?, OfflineDir=?, SupplierGUID=?, Errors=?";
            var myValues = [Retailer, Collection, CatalogGUID, OfflineDir, SupplierGUID, CatalogErrors];
            if (myCatalogItem) {
                mySQL += ", json=?";
                myValues.push($.serializeJSON(myCatalogItem));
            }
            if (ToDownLoad != null) {
                mySQL += ", ToDownLoad=?";
                myValues.push(ToDownLoad);
            }
            tx.executeSql(mySQL + " where key='"+key+"' and Account='"+Account+"'", myValues,
                function () {
                    done(false);
                },
                function (transaction, results) {
                    myApp.onError(results);
                });  // array of values for the ? placeholders
        });
    },

    DBSaveCatalog: function (key, Retailer, Account, Collection, CatalogGUID, OfflineDir, SupplierGUID, ToDownLoad, CatalogErrors, myCatalogItem, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaCatalogs where key=? and Account=?", [key, Account],
                function (transaction, results) {
                    var addedOn = new Date();
                    var json = $.serializeJSON(myCatalogItem);
                    if (results.rows.length == 0) {     //insert new
                        debug("INSERT INTO DivaCatalogs: " + key);
                        tx.executeSql("INSERT INTO DivaCatalogs(key, Retailer, Account, Collection, CatalogGUID, OfflineDir, SupplierGUID, ToDownLoad, Errors, json, added_on) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                            [key, Retailer, Account,Collection, CatalogGUID, OfflineDir, SupplierGUID, ToDownLoad, CatalogErrors, json, addedOn],
                            function () { done(true); },
                            function (transaction, results) {
                                myApp.onError(results);
                            });
                    }
                    else {      //update existing
                        debug("UPDATE DivaCatalogs: " + key);
                        tx.executeSql("UPDATE DivaCatalogs set Retailer=?, Collection=?, CatalogGUID=?, OfflineDir=?, SupplierGUID=?, ToDownLoad=?, Errors=?, json=?, added_on=? where key=? and Account=?;",
                            [Retailer, Collection, CatalogGUID, OfflineDir, SupplierGUID, ToDownLoad, CatalogErrors, json, addedOn, key, Account],
                            function () { done(false); },
                            function (transaction, results) {
                                myApp.onError(results);
                        });  // array of values for the ? placeholders
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },

    DBRemoveCatalogFromDownload: function (key, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            debug("Remove Catalogs from Download" + key);
            tx.executeSql("UPDATE DivaCatalogs set OfflineDir='', ToDownLoad=null, Errors='' where key=?;",
                [key],
                function () {
                    if(done) done(false);
                },
                function (transaction, results) {
                    myApp.onError(results);
                }
            );
        });
    },
    
    DBDeleteCatalog: function (key, Retailer, Account, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            function GoOn() {
                tx.executeSql("SELECT * FROM DivaCatalogs where Account='" + Account + "'", [],
                   function (transaction, results) {
                       if (results.rows.length == 0) {     //wenn keine Kataloge eines Accounts mehr vorhanden auch Account löschen...
                           myApp.DBDeleteAccount(Account, done)
                       }
                       else {
                           if (done) done();
                       }
                   },
                   function (transaction, results) {
                       myApp.onError(results);
                   });
            };
            if(key=="")
                tx.executeSql("DELETE FROM DivaCatalogs WHERE Account=?", [Account], GoOn, myApp.onError);
            else
                tx.executeSql("DELETE FROM DivaCatalogs WHERE key=? and Account=?", [key, Account], GoOn, myApp.onError);
        });
    },

    /// Common DataTable    
    
    DBGetSettings: function (onSuccess) {
        var db = myApp.DB;
        db.transaction(function (tx) {

            tx.executeSql("SELECT Settings FROM DivaData where key=?", [myReader.LoginURL(myReader.LicenseKey)],
                function (transaction, results) {
                    if (results.rows.length == 1) {
                        var row = results.rows.item(0);
                        try {
                            var mySettings = parseJSON(row.Settings);
                            for (var attr in mySettings) {
                                myApp.Settings[attr] = mySettings[attr];
                            }
                        }
                        catch (e) {
                            DebugErr(e, "No valid DB settings! - " + myReader.LoginURL(myReader.LicenseKey), false);
                        }
                    }
                    else {
                        debugErr(null, "No DB settings defined! - " + myReader.LoginURL(myReader.LicenseKey), false);
                    }
                    onSuccess();
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },

    DBUpdateSettings: function(key, Settings, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            debug("UPDATE DivaData: " + key);
            tx.executeSql("UPDATE DivaData set Settings=? where key=?;", [Settings, key],
                    function (transaction, results) {
                        done(true);
                    },
                    function (transaction, results) {
                        myApp.onError(results);
                    }
            );  
        });

    },
    DBGetData: function (key, onSuccess, onError) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaData where key='" + key + "'", [],
                function (transaction, results) {
                    if (results.rows.length == 0) {
                        onError("Offline Data not found!");
                    }
                    else {
                        var row = results.rows.item(0);
                        var json = parseJSON(row.json);
                        onSuccess(json);
                    }
                },
                function (transaction, results) {
                    myApp.onError(results);
                });
        });
    },

    DBUpdateData: function (key, json, done) {
        var db = myApp.DB;
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM DivaData where key='"+key+"'", [],
                function (transaction, results) {
                    var addedOn = new Date();
                    if (results.rows.length == 0) {     //insert new
                        debug("INSERT INTO DivaData: " + key);
                        tx.executeSql("INSERT INTO DivaData(key, json, added_on) VALUES (?,?,?)",
                                    [key, json, addedOn],
                                    function (transaction, results) {
                                        done(true);
                                    },
                                    function (transaction, results) {
                                        myApp.onError(results);
                                    });
                    }
                    else {      //update existing
                        debug("UPDATE DivaData: " + key);
                        tx.executeSql("UPDATE DivaData set json=?, added_on=? where key=?;",
                                    [json, addedOn, key],
                                    function (transaction, results) {
                                        done(false);
                                    },
                                    function (transaction, results) {
                                        myApp.onError(results);
                                    });  // array of values for the ? placeholders
                    }
                },
                 function (transaction, results) {
                     myApp.onError(results);
                 });
        });
    }

};

$(document).ready(function () {
    myApp.initialize();
});
