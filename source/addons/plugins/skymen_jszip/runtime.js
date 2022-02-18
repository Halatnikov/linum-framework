// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.skymen_jszip = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.skymen_jszip.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;
		this.loadProgress = 0;
		this.loadError = "";
		this.downloadProgress = 0;
		this.downloadError = "";
		this.unzipProgress = 0;
		this.unzipError = "";
		this.zipfile = null;
		this.loadProcess = null;
		this.downloadProcess = null;
		this.unzipProcess = null;
		this.cancelledLoad = false;

		this.isNWjs = this.runtime.isNWjs;
		if (this.isNWjs) {
			this.path = require("path");
			this.fs = require("fs");
		}
	};

	instanceProto.loadGetBinaryContent = function (err, data) {
		if (err) {
			if (this.cancelledLoad) {
				err.message = "Load was cancelled";
				this.cancelledLoad = false;
			}
			this.loadProcess = null;
			this.loadError = err.message;
			this.loadProgress = 0;
			this.Trigger(cr.plugins_.skymen_jszip.prototype.cnds.OnZipLoadFail);
		} else {
			var self = this;
			JSZip.loadAsync(data)
			.then(this.loadFlAsync.bind(this))
			.catch(function (e) {
				self.loadProcess = null;
				self.loadProgress = 0;
				self.loadError = e.message;
				self.Trigger(cr.plugins_.skymen_jszip.prototype.cnds.OnZipLoadFail);
			});
		}
	};

	instanceProto._createWriteStream = function (path) {
		var getDirname = this.path["dirname"];
		var dirPath = getDirname(path);
		if (!this.fs["existsSync"](dirPath)) {
			this.fs["mkdirSync"](dirPath, {
				recursive: true
			});
		}
		return this.fs["createWriteStream"](path);
	};

	instanceProto.loadUpdate = function (progress) {
		if (!progress || !progress.loaded || !progress.total) return;
		this.loadProgress = progress.loaded / progress.total;
	};

	instanceProto.loadFlAsync = function (zip) {
		this.zipfile = zip;
		this.loadProgress = 1;
		this.loadProcess = null;
		this.Trigger(cr.plugins_.skymen_jszip.prototype.cnds.OnZipLoaded);
	}

	instanceProto.Trigger = function (method) {
		this.runtime.trigger(method, this);
	}

	instanceProto.getPath = function (path) {
		if (path.length === 0 || path[path.length - 1] !== '/')
			path += '/';
		return path;
	}

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.OnZipLoaded = function () {
		return true;
	};

	Cnds.prototype.OnZipLoadFail = function () {
		return true;
	};

	Cnds.prototype.OnUnzip = function () {
		return true;
	};

	Cnds.prototype.OnUnzipFail = function () {
		return true;
	};

	Cnds.prototype.OnDownload = function () {
		return true;
	};

	Cnds.prototype.OnDownloadFail = function () {
		return true;
	};

	Cnds.prototype.IsLoading = function () {
		return !!this.loadProcess;
	};
	
	Cnds.prototype.IsDownloading = function () {
		return !!this.downloadProcess;
	};
	
	Cnds.prototype.IsUnzipping = function () {
		return !!this.unzipProcess;
	};

	Cnds.prototype.HasZipLoaded = function () {
		return !!this.zipfile;
	};
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.LoadZipFromURL = function (url) {
		JSZipUtils.getBinaryContent(url, this.loadGetBinaryContent.bind(this), this.loadUpdate.bind(this), this);
	};

	Acts.prototype.DownloadZip = function (path_) {
		if (!this.zipfile || !this.isNWjs) return;
		this.downloadProgress = 0;
		var self = this
		var nodeStream = this.zipfile.generateNodeStream({
			type: 'nodebuffer',
			streamFiles: true,
			compression: "DEFLATE",
			compressionOptions: {
				level: 9
			}
		}, function (chunk) {
			self.downloadProgress = chunk.percent / 100;
		});
		var stream = nodeStream.pipe(this._createWriteStream(path_));

		this.downloadProcess = stream;
		stream.on('finish', function() {
			// JSZip generates a readable stream with a "end" event,
			// but is piped here in a writable stream which emits a "finish" event.
			self.downloadProgress = 1;
			self.downloadProcess = null;
			self.Trigger(cr.plugins_.skymen_jszip.prototype.cnds.OnDownload);
		});

		stream.on('error', function(e) {
			self.fs["unlinkSync"](path_);
			self.downloadProgress = 0;
			self.downloadProcess = null;
			self.downloadError = e.message;
			self.Trigger(cr.plugins_.skymen_jszip.prototype.cnds.OnDownloadFail);
		});
	};

	Acts.prototype.UnzipZip = function(path) {
		if (!this.zipfile || !this.isNWjs) return;

		var realPath = this.getPath(path);
		var error = false;
		var nbFiles = Object.keys(this.zipfile.files).length;
		var progress = new Array(nbFiles);
		var self = this;
		var updateProgress = function() {
			self.unzipProgress = 0;
			progress.forEach(function(x) {
				self.unzipProgress += x / nbFiles;
			})
		}

		var onUpdate = function (id, chunk) {
			progress[id] = chunk.percent / 100;
			updateProgress();
		};

		var done = 0;
		var i = 0;

		var finishedFiles = [];
		var folders = [realPath];

		var pruneFiles = function () {
			for (let i = 0; i < finishedFiles.length; i++) {
				const _path = finishedFiles[i];
				self.fs["unlinkSync"](_path);
			}
			setTimeout(function() {
				for (let i = 0; i < folders.length; i++) {
					const _path = folders[i];
					try {
						self.fs["rmdirSync"](_path);
					} catch (_) {}
				}
				folders = [];
			}, 10);
			
			finishedFiles = [];
		}

		this.unzipProcess = [];

		this.zipfile.forEach(function (relativePath, file) {
			if (file.dir) {
				onUpdate(i, {
					percent: 100,
				});
				folders.unshift(realPath + relativePath);
				done++;
				i++;
				return;
			}

			var stream = file.nodeStream('nodebuffer', onUpdate.bind(self, i))
				.pipe(self._createWriteStream(realPath + relativePath));

			var processId = self.unzipProcess.length;
			self.unzipProcess.push(stream);

			stream.on('error', function (e) {
				self.fs["unlinkSync"](realPath + relativePath);
				if (!error) {
					pruneFiles();
					self.unzipProgress = 0;
					self.unzipProcess = null
					self.unzipError = e.message;
					error = true;
					self.Trigger(cr.plugins_.skymen_jszip.prototype.cnds.OnUnzipFail);
				}
			});

			stream.on('finish', function () {
				done++;
				if (!error) {
					finishedFiles.push(realPath + relativePath);
					self.unzipProcess[processId] = null;
				} else {
					self.fs["unlinkSync"](realPath + relativePath);
				}
				if (done === nbFiles) {
					if (!error){
						self.unzipProcess = null
						self.unzipProgress = 1;
						self.Trigger(cr.plugins_.skymen_jszip.prototype.cnds.OnUnzip);
					}
				}
			});
			i++;
		});	
	};

	Acts.prototype.CancelLoad = function () {
		if (!this.loadProcess) return;
		this.cancelledLoad = true;
		this.loadProcess.abort();
	};
	
	Acts.prototype.CancelDownload = function () {
		if(!this.downloadProcess) return;
		this.downloadProcess.destroy(new Error("Download was cancelled"));
	};
	
	Acts.prototype.CancelUnzip = function () {
		if(!this.unzipProcess) return;
		this.unzipProcess.forEach(function(process) {
			if (process) process.destroy(new Error("Unzipping was cancelled"));
		})
	};

	Acts.prototype.UnloadZip = function () {
		this.zipfile = null;
	};
	
	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	// the example expression
	Exps.prototype.LoadProgress = function (ret) {
		ret.set_float(this.loadProgress);
	};
	
	Exps.prototype.LoadError = function (ret) {
		ret.set_string(this.loadError);
	};

	Exps.prototype.DownloadProgress = function (ret) {
		ret.set_float(this.downloadProgress);
	};

	Exps.prototype.DownloadError = function (ret) {
		ret.set_string(this.downloadError);
	};

	Exps.prototype.UnzipProgress = function (ret) {
		ret.set_float(this.unzipProgress);
	};

	Exps.prototype.UnzipError = function (ret) {
		ret.set_string(this.unzipError);
	};

	Exps.prototype.EntryCount = function (ret) {
		if (this.zipfile)
			ret.set_int(Object.keys(this.zipfile.files).length);
		else
			ret.set_int(0);
	};
	Exps.prototype.EntryName = function (ret, id) {
		if (this.zipfile){
			ret.set_string(Object.keys(this.zipfile.files)[id]);
		} else {
			ret.set_string('');
		}
	};
	Exps.prototype.EntryIsDir = function (ret, id) {
		if (this.zipfile && Object.values(this.zipfile.files)[id]) {
			ret.set_int(Object.values(this.zipfile.files)[id].dir ? 1 : 0);
		} else {
			ret.set_int(0);
		}
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());