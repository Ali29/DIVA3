
function FileSystemHelper() { 
}

FileSystemHelper.prototype = {
    getFileSystem: function (onSuccess, onError) {
        var that = this;
        var grantedBytes = 0;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, grantedBytes,
								 function (fs) {
								     //debug("LocalFileSystem found!");
								     //if(device.platform == 'Android'){
								     if (false) { //@replace
								         fs.root.getDirectory("Icenium/com.telerik.DIVA2__1", { create: true, exclusive: false },
                                             function (dir) {
                                                 //debug(dir.fullPath+" found!");
                                                 onSuccess.call(that, dir);
                                             },
                                             function (error) {
                                                 error.message = "Request file system failed.";
                                                 onError.call(that, error);

                                             });
								     } else {
								         fs.root.getDirectory("DIVA2", { create: true, exclusive: false },
                                             function (dir) {
                                                 //debug(dir.fullPath+" found!");
                                                 onSuccess.call(that, dir);
                                             },
                                             function (error) {
                                                 error.message = "Request file system failed.";
                                                 onError.call(that, error);

                                             });
								     }
								 },
								 function (error) {
								     error.message = "Request file system failed.";
								     onError.call(that, error);
								 });
    },
    overwriteFile: function (entry, fileName, text, onSuccess, onError) {
        //debug("FileSystemHelper.overwriteFile");

        var that = this;

        var options = {
            create: false,
            exclusive: false
        };
        entry.getFile(fileName, options,
            function (fileEntry) {
                //debug("Remove Existing File! "+fileName);
                fileEntry.remove(
                    function () {
                        //debug("File Removed!");
                        that.createFile.call(that, entry, fileName, text, function () {
                            onSuccess();
                        }, onError)
                    },
                    function (error) {
                        error.message = "Failed deleting existing file.";
                        onError.call(that, error);
                    }
                );
            },
            function (error) {
                //debug("Create file");
                that.createFile.call(that, entry, fileName, text, onSuccess, onError);
            });

    },

    checkIfIsFile: function (entry, fileName, onSuccess, onError) {
        //debug("FileSystemHelper.checkIfIsFile");

        var that = this;

        var options = {
            create: false,
            exclusive: false
        };
        entry.getFile(fileName, options, onSuccess, onError);
    },



    createFileIfNotExists: function (entry, fileName, text, onSuccess, onError) {
        //debug("FileSystemHelper.createFileIfNotExists");

        var that = this;

        var options = {
            create: false,
            exclusive: false
        };
        entry.getFile(fileName, options, onSuccess,
           function (error) {
               that.createFile.call(that, entry, fileName, text, onSuccess, onError);
           });

    },



    createFile: function (entry, fileName, text, onSuccess, onError) {
        //debug("FileSystemHelper.createFile");
        var that = this;

        var options = {
            create: true,
            exclusive: false
        };

        entry.getFile(fileName, options,
								function (fileEntry) {
								    that.createFileWriter.call(that, fileEntry, text, onSuccess, onError);
								},
								function (error) {
								    error.message = "Failed creating file.";
								    onError.call(that, error);
								});
    },

    createFileWriter: function (fileEntry, text, onSuccess, onError) {
        //debug("FileSystemHelper.createFileWriter");
        var that = this;
        fileEntry.createWriter(function (fileWriter) {
            var len = fileWriter.length;
            fileWriter.seek(len);
            fileWriter.write(text + '\n');
            //var message = "Wrote: " + text;
            onSuccess.call(that, "createFileWriter done");
        },
                    			function (error) {
                    			    error.message = "Unable to create file writer.";
                    			    onError.call(that, error);
                    			});

    },

    //Reading operations
    /*    
	readTextFromFile : function(fileName, onSuccess, onError) {
        //debug("FileSystemHelper.getFilreadTextFromFileeSystem");
		var that = this;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
								 function(fileSystem) {
									 that.getFileEntry.call(that, fileSystem, fileName, onSuccess, onError);
								 },
								 function(error) {
									 error.message = "Unable to request file system.";
									 onError.call(that, error);
								 });
	},*/
    checkDirectory: function (entry, SubPath, someData, onSuccess, onError) {
        var that = this;
        //var d=entry.fullPath+SubPath;
        //debug("FileSystemHelper.checkDirectory: "+entry.fullPath);
        //debug("FileSystemHelper.checkDirectory: "+SubPath);
        entry.getDirectory(SubPath, { create: true, exclusive: false },
            function (parent) {
                //debug("FileSystemHelper.Direcory found!: "+SubPath);
                onSuccess.call(that, parent, someData);
            },
            function (error) {
                //debug("Directory not found: "+SubPath+" - create new..");
                var s = SubPath.split("/")
                that.createSubDirectories(entry, s, s[0] == "" ? 1 : 0,
                    function (parent) {
                        //debug("success:checkDirectory"+parent.fullPath); 
                        onSuccess.call(that, parent, someData);
                    },
                    function (error) {
                        onError(that, error);
                    }
                );
            }
        );
    },

    createSubDirectories: function (parent, SubDirs, i, onSuccess, onError) {
        //debug("FileSystemHelper.createSubDirectories "+i+"  "+SubDirs[i]);
        var that = this;
        if (i < SubDirs.length) {
            //debug("createSubDirectories "+SubDirs[i]);
            parent.getDirectory(SubDirs[i], { create: true, exclusive: false },
                function (parent) {
                    that.createSubDirectories(parent, SubDirs, (i + 1),
                        function (NewParent) {
                            //debug("success:"+i+" "+NewParent.name); 
                            onSuccess.call(that, NewParent);
                        },
                        function (error) {
                            onError.call(that, error);
                        }
                    )
                },
                function (error) {
                    error.message = "Unable to Create SubFolder:" + SubDirs[i] + " in parent" + parent;
                    onError.call(that, error);
                }
           );

        }
        else {
            onSuccess.call(that, parent);
        }
    },

    getDirectory: function (entry, directoryName, onSuccess, onError) {
        //debug("FileSystemHelper.getDirectory");
        var that = this;
        // Get existing file, don't create a new one.
        entry.getDirectory(directoryName, { create: true, exclusive: false },
								function (parent) {
								    onSuccess.call(that, parent);
								},
								function (error) {
								    error.message = "Unable to get file entry for reading.";
								    onError.call(that, error);
								});

    },

    checkFileEntry: function (entry, fileName, done) {
        //debug("FileSystemHelper.getFileEntry");

        var that = this;
        // Get existing file, don't create a new one.
        entry.getFile(fileName, null,
								function (fileEntry) {
								    done(fileEntry)
								},
								function (error) {
								    done(null);
								});
    },

    getFileEntry: function (entry, fileName, onSuccess, onError) {
        //debug("FileSystemHelper.getFileEntry");

        var that = this;
        // Get existing file, don't create a new one.
        entry.getFile(fileName, null,
								function (fileEntry) {
								    that.getFile.call(that, fileEntry, onSuccess, onError);
								},
								function (error) {
								    error.message = "Unable to get file entry for reading.";
								    onError.call(that, error);
								});
    },

    getFile: function (fileEntry, onSuccess, onError) {
        //debug("FileSystemHelper.getFile");
        var that = this;
        fileEntry.file(
			function (file) {
			    that.getFileReader.call(that, file, onSuccess);
			},
			function (error) {
			    error.message = "Unable to get file for reading.";
			    onError.call(that, error);
			});
    },

    getFileReader: function (file, onSuccess) {
        //debug("FileSystemHelper.getFileReader");
        var that = this;
        /*var reader = new FileReader();
		reader.onloadend = function(evt) { 
			var textToWrite = evt.target.result;
            onSuccess.call(that, textToWrite);
		};
        
		reader.readAsText(file,"UTF8");*/
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            var textToWrite = evt.target.result;
            onSuccess.call(that, textToWrite);
        };
        reader.readAsText(file);
    },

    //Deleting operations
    deleteFile: function (fileName, onSuccess, onError) {
        //debug("FileSystemHelper.deleteFile");
        var that = this;

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                                function (fileSystem) {
                                    that._getFileEntryForDelete.call(that, fileSystem, fileName, onSuccess, onError);
                                }, function (error) {
                                    error.message = "Unable to retrieve file system.";
                                    onError.call(that, error);
                                });
    },

    _getFileEntryForDelete: function (fileSystem, fileName, onSuccess, onError) {
        //debug("FileSystemHelper._getFileEntryForDelete");
        var that = this;
        fileSystem.root.getFile(fileName,
                                null,
								function (fileEntry) {
								    that._removeFile.call(that, fileEntry, onSuccess, onError);
								},
								function (error) {
								    error.message = "Unable to find the file.";
								    onError.call(that, error)
								});
    },

    _removeFile: function (fileEntry, onSuccess, onError) {
        //debug("FileSystemHelper._removeFile");
        var that = this;
        fileEntry.remove(function (entry) {
            var message = "File removed.";
            onSuccess.call(that, message);
        }, function (error) {
            error.message = "Unable to remove the file.";
            onError.call(that, error)
        });
    }

    /*
    //Writing operations
    writeLine: function(fileName, text, onSuccess, onError) {
		var that = this;
		var grantedBytes = 0;

		window.requestFileSystem(LocalFileSystem.PERSISTENT, grantedBytes,
								 function(fileSystem) {
									 that._createFile.call(that, fileSystem, fileName, text, onSuccess, onError);
								 },
								 function(error) {
									 error.message = "Request file system failed.";
									 onError.call(that, error);
								 });
	},
    
	_createFile: function(fileSystem, fileName, text, onSuccess, onError) { 
		var that = this;
		var options = {
			create: true, 
			exclusive: false
		};

		fileSystem.root.getFile(fileName, options,
								function(fileEntry) {
									that._createFileWriter.call(that, fileEntry, text, onSuccess, onError);
								},
								function (error) {
									error.message = "Failed creating file.";
									onError.call(that, error);
								});
	},
    
	_createFileWriter: function(fileEntry, text, onSuccess, onError) {
		var that = this;
		fileEntry.createWriter(function(fileWriter) {
                                    var len = fileWriter.length;
                                    fileWriter.seek(len);
                                    fileWriter.write(text + '\n');
                                    var message = "Wrote: " + text;
                                    onSuccess.call(that, message);
                                },
                    			function(error) {
                    				error.message = "Unable to create file writer.";
                    				onError.call(that, error);
                    			});
        
	},
    
    //Reading operations
	readTextFromFile : function(fileName, onSuccess, onError) {
		var that = this;
        
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
								 function(fileSystem) {
									 that._getFileEntry.call(that, fileSystem, fileName, onSuccess, onError);
								 },
								 function(error) {
									 error.message = "Unable to request file system.";
									 onError.call(that, error);
								 });
	},
    
	_getFileEntry: function(fileSystem, fileName, onSuccess, onError) {
        
		var that = this;
		// Get existing file, don't create a new one.
		fileSystem.root.getFile(fileName, null,
								function(fileEntry) {
									that._getFile.call(that, fileEntry, onSuccess, onError);
								}, 
								function(error) {
									error.message = "Unable to get file entry for reading.";
									onError.call(that, error);
								});
	},

	_getFile: function(fileEntry, onSuccess, onError) { 
		var that = this; 
		fileEntry.file(
			function(file) { 
				that._getFileReader.call(that, file, onSuccess);
			},
			function(error) {
				error.message = "Unable to get file for reading.";
				onError.call(that, error);
			});
	},

	_getFileReader: function(file, onSuccess) {
		var that = this;
		var reader = new FileReader();
		reader.onloadend = function(evt) { 
			var textToWrite = evt.target.result;
			onSuccess.call(that, textToWrite);
		};
        
		reader.readAsText(file);
	},
   
    //Deleting operations
	deleteFile: function(fileName, onSuccess, onError) {
		var that = this;
       
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
                                function(fileSystem) {
                        			that._getFileEntryForDelete.call(that, fileSystem, fileName, onSuccess, onError);
                        		}, function(error) {
                        			error.message = "Unable to retrieve file system.";
                        			onError.call(that, error);
                        		});
	}, 
    
	_getFileEntryForDelete: function(fileSystem, fileName, onSuccess, onError) { 
		var that = this;
		fileSystem.root.getFile(fileName, 
                                null, 
								function (fileEntry) {
									that._removeFile.call(that, fileEntry, onSuccess, onError);
								},
								function(error) {
									error.message = "Unable to find the file.";
									onError.call(that, error)
								});
	},
    
	_removeFile : function(fileEntry, onSuccess, onError) {
		var that = this;
		fileEntry.remove(function (entry) {
                			var message = "File removed.";
                			onSuccess.call(that, message);
                		}, function (error) {
                			error.message = "Unable to remove the file.";
                			onError.call(that, error)
                		});
	}
    */
};