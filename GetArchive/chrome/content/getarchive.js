var wait = 200;
var getarchive_website = "";

var getarchive = {
    /*openurl: function(){
		var currentLocation=gBrowser.contentDocument.location.href;
		var pageLocation = "";
		
		try{
			pageLocation = gContextMenu.linkURL;
		}catch(err){
			pageLocation = "";
		}
		
		pageLocation = this.getLinkFromMediaWikiSelection(currentLocation, pageLocation);
		
		if(pageLocation != ""){
			gBrowser.selectedTab = gBrowser.addTab(pageLocation);
		}
	},*/
	
	getarchiveorglink: function(buttoncode) {
		var currentLocation=gBrowser.contentDocument.location.href;
		var archiveOrgBaseURL = "http://web.archive.org/web/2005/"; //0000000000
		var pageLocation = "";

		getarchive_website="archive.org"
		
		try{
			pageLocation = gContextMenu.linkURL;
		}catch(err){
			pageLocation = "";
		}
		//currentLocation = currentLocation.replace("http://archive.today/", "");

		if(currentLocation.indexOf("web.archive.org/web/*/") > -1){
			window.content.location.href = this.cleanurl(currentLocation.replace("web.archive.org/web/*/", "web.archive.org/web/2005/"));
			this.copytoclipboard();
			//pageLocation = "";
			//currentLocation = "";
			return;
		}

		// get URL from HTML
		var linkToPage = this.getlocationfrompage();
		if(linkToPage != ""){
			pageLocation = linkToPage;
		}
		
		pageLocation = this.getLinkFromMediaWikiSelection(currentLocation, pageLocation);

		if(currentLocation.indexOf("Overleg:") > -1 && gContextMenu == null){
			temp = this.getPageLocation();
			if (temp != "" && temp != "NONE"){ //TODO: check this
				pageLocation = temp;
			}
		}

		if(pageLocation != ""){
			// right click / action-submit / action-edit

			if(buttoncode > 0 || currentLocation.indexOf("wiki") > -1){
				try{
					gBrowser.selectedTab = gBrowser.addTab(archiveOrgBaseURL+decodeURI(this.cleanurl(pageLocation))); //can fail (invalid URI)
				}catch(err){
					gBrowser.selectedTab = gBrowser.addTab(archiveOrgBaseURL+this.cleanurl(pageLocation));
				}
			}else{
				window.content.location.href = archiveOrgBaseURL+this.cleanurl(pageLocation);
			}
			this.copytoclipboard();
		}else{
			//alert("no pageLocation");
			if(currentLocation.indexOf("Overleg:") == -1){
			    pageLocation = gBrowser.contentDocument.location.href;
				pageLocation = pageLocation.replace("http://archive.today/", "");
				pageLocation = pageLocation.replace("https://archive.today/", "");
				pageLocation = pageLocation.replace("http://archive.is/", "");
				pageLocation = pageLocation.replace("https://archive.is/", "");
				
				window.content.location.href = archiveOrgBaseURL+this.cleanurl(pageLocation);
				this.copytoclipboard();
			}
		}
		//pageLocation = "";
		//currentLocation = "";
	},
	getPageLocation: function(){
		// this should only work on talk pages -> ca-talk with class selected indicates this is a talk page
		var talkPageObject=content.document.getElementById("ca-talk");
		var pageLocation = "NONE";
		
		if(talkPageObject != null && talkPageObject != undefined){
			if(talkPageObject.getAttribute("class") == "selected"){
				return pageLocation; // archive.is is fooling us, this is not a talk page
			}
		}

		contentText = content.document.getElementById("mw-content-text").innerHTML;
		if(contentText != undefined){
			var count = contentText.match(/mw-headline/g).length;
			try {
				var countDodeLink = contentText.match(/id=\"Dode_/g).length;
			}
			catch(err){
				var countDodeLink = 0;
			}
			try {
				var countLinks = contentText.match(/external/g).length;
			}catch(err){
				var countLinks = 0;
			}

			if (countDodeLink == 1 && (count == 1 || count == undefined || countLinks == 1)){
				var startExternalLink = contentText.indexOf("external free");
				var endExternalLink = contentText.indexOf(">",startExternalLink);
				pageLocation = contentText.substring(startExternalLink + 21, endExternalLink - 1);
			}else{
				if(countDodeLink == 1 && countLinks > 1){
					var startHeadline = contentText.indexOf("\"Dode_");
					var startExternalLink = contentText.indexOf("external free", startHeadline)
					var endExternalLink = contentText.indexOf(">",startExternalLink);
					pageLocation = contentText.substring(startExternalLink + 21, endExternalLink - 1);
				}
			}
		}else{
			return pageLocation;
		}
		
		return pageLocation.split('amp;').join('');
	},
	isurlloaded: function(){
		if(gBrowser.contentDocument.location.href.indexOf("archive.today") > -1 || gBrowser.contentDocument.location.href.indexOf("archive.is") > -1){
			if(getarchive_website=="archive.org"){
				return false; // probably still loading
			}
			if(gBrowser.contentDocument.location.href.length < 28){ //is this needed?
				return this.isurlvalid();
			}
		}
		
		if(gBrowser.contentDocument.location.href.indexOf("archive.org") > -1){
			if(getarchive_website=="archive.is"){
				return false; // probably still loading
			}
			
			if(gBrowser.contentDocument.location.href.indexOf("archive.org") > -1 && gBrowser.contentDocument.location.href.indexOf("archive.org/web/2005/") == -1){
				if(content.document.body == null){
					return false;
				}
				//var contentText = this.getcontenttext();
				//if(contentText != ""){
					//if(contentText.indexOf("Redirecting to...") > -1){
					//	return false;
					//}
					// disabled until further testing is done
					//if(contentText.indexOf("The machine that serves this file is down. We're working on it.") > -1){
					//	var locationNextDateText = contentText.indexOf("Would you like to try the "); // would you like to try the next date?
					//	var locationNextDateDate = contentText.indexOf("date", locationNextDateText);
					//	var nextDateText = contentText.substring(locationNextDateText, locationNextDateDate - locationNextDateText);
					//	alert(nextDateText);
						//gBrowser.contentDocument.location.href = ;//get next date
					//	return false;
					//}
				//}
				return this.isurlvalid();
			}
		}
		return false;
	},
	getcontenttext: function(){
		contentText = "";
		try{
			contentText = content.document.body.textContent;
		}catch(err){}
		return contentText;
	},
	isurlvalid: function(){
		// Checks if page is valid. Used to stop the counter on invalid pages.
		
		try{
			var documentTitle = content.document.title.toLowerCase();
			var contentText = this.getcontenttext();
			var contentTextLower = contentText.toLowerCase();
			
			if(documentTitle.indexOf("404 not found") > -1){
				return false;
			}
			if(documentTitle.indexOf("page not found") > -1){
				return false;
			}
			if(documentTitle.indexOf("cannot be found") > -1){
				return false;
			}
			if(documentTitle.indexOf("object not found") > -1){
				return false;
			}
			if(documentTitle.indexOf("403 forbidden") > -1){
				return false;
			}
			if(contentText.indexOf("Wayback Machine doesn't have that page archived.") > -1){
				return false;
			}
			if(contentText.indexOf("The machine that serves this file is down. We're working on it.") > -1){
				return false;
			}
			if(contentText.indexOf("errorBorder") > -1){ //unknown archive.org error
				return false;
			}
			if(contentTextLower.indexOf("cannot be found") > -1){
				return false;
			}
			if(contentTextLower.indexOf("page not found") > -1){
				return false;
			}
			if(contentText.indexOf("404 - File or directory not found.") > -1){
				return false;
			}
			if(contentTextLower.indexOf("buy this domain") > -1){
				return false;
			}
			if(contentText.indexOf("404 Not Found") > -1){
				return false;
			}
		}catch(ex){
			//alert("documentTitle is null or undefined")
		}
		return true;
	},
	copytoclipboard: function(){
		//var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
		that=this;
		copied=false;
		var maxtries = 20 * (1000 / wait); // wait 200ms means 5 per second, so do this 15 seconds
		var tries = 0;
		
		var func = function(){
			if(copied && content.document.title.indexOf("+") == 0 || tries + 1 == maxtries){
				return; // already copied
			}
			if(that.isurlloaded()){
				//clipboard.copyString(gBrowser.contentDocument.location.href);
				if(content.document.title == "" && content.document.title == "Internet Archive Wayback Machine"){
					tries++;
					window.setTimeout(func, wait);
				}else{
					if(that.isurlvalid()){
						if(content.document.title == "Internet Archive Wayback Machine"){
							// let's hope this is "Redirecting to..." (no reliable way to check)
							tries++;
							window.setTimeout(func, wait);
						}else{
							that.copytoclipboardv2(gBrowser.contentDocument.location.href);
							copied = true;
							content.document.title = "+" + content.document.title;
						}
					}
				}
			}else{
				if(that.isurlvalid()){

					// this is the same as (!document.readyState === "complete") (but better)
					// that.getcontenttext()==""{ // valid page, not loaded yet
					tries++;
					window.setTimeout(func, wait);
					
					//if(that.getcontenttext()==""){ //not loaded yet
						// valid page (keeps loading?)
					//	window.setTimeout(func, wait);
					//}else{
					//	if(gBrowser.contentDocument.location.href.indexOf("archive.is") > -1 && gBrowser.contentDocument.location.href.length < 30){
					//		that.copytoclipboardv2(gBrowser.contentDocument.location.href);
					//		copied = true;
					//		content.document.title = "+" + content.document.title;
					//	}
					//}
					
				}else{
					// Invalid page (focus wrong?)
					// Stop here (we cannot pass the URL between page loads)
				}
			}
		};
		window.setTimeout(func,800); // one to start with
	},
	copytoclipboardv2: function(text){
		var str = Components.classes["@mozilla.org/supports-string;1"].
		createInstance(Components.interfaces.nsISupportsString);
		if (!str) return false;
		str.data = text;

		var trans = Components.classes["@mozilla.org/widget/transferable;1"].
		createInstance(Components.interfaces.nsITransferable);
		if (!trans) return false;

		trans.addDataFlavor("text/unicode");
		trans.setTransferData("text/unicode", str, text.length * 2);

		var clipid = Components.interfaces.nsIClipboard;
		var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
		if (!clip) return false;

		clip.setData(trans, null, clipid.kGlobalClipboard);
	},
	getpartialurl: function(fullurl){
		var locationHttp = fullurl.indexOf("://", 20); // second occurence
		var locationHttpStart = -1;
		if(locationHttp > 1){
			locationHttpStart = fullurl.indexOf("http", locationHttp - 6);
		}
		return fullurl.substring(locationHttpStart);
	},
	getlocationfrompage: function(){
		// get URL from HTML
		var pageLocation = "";
		
		if(gBrowser.contentDocument.location.href.indexOf("archive.today") > -1 || gBrowser.contentDocument.location.href.indexOf("archive.is") > -1){
			var inputElements = window.content.document.body.getElementsByTagName("input");
			for (i = 0; i < inputElements.length; i++) {
				var contentText = this.getInnerBody();
				var redirectedFromPos = contentText.indexOf("Redirected from");
				
				if(redirectedFromPos > -1){ // prefer "Redirected from"
					var httpPos = contentText.indexOf("http", redirectedFromPos);
					var httpPosEnd = contentText.indexOf("\"", httpPos);
					pageLocation = contentText.substring(httpPos, httpPosEnd);
				}
				
				if(inputElements[i].getAttribute("name") == "q" && pageLocation == ""){ // q can occur multiple times
					pageLocation = this.getpartialurl(inputElements[i].getAttribute("value"));
				}
			}
		}
		return pageLocation;
	},
	getLinkFromMediaWikiSelection: function(currentLocation, pageLocation){
		if((currentLocation.indexOf("action=submit") > -1 || currentLocation.indexOf("action=edit") > -1) && pageLocation == "") {
			var content = readFromClipboard();
			if(content != undefined){
				var protocolPos = content.indexOf("://");
				var ampersand = content.indexOf("&");
				if(ampersand == -1){
					ampersand = content.length;
				}
				var otherPos = this.getInnerBody().indexOf(content.substring(0,ampersand));
				
				if(protocolPos > -1 && otherPos > -1){  // sometimes copying to clipboard fails (for no reason)
					pageLocation = content;
				}
			}else{
				this.showMessage("Try again after reloading the page");
			}
		}
		return pageLocation;
	},
	gettodayarchive: function(buttoncode){
		var pageLocation = "";
		var linkToPage = null;
		var currentLocation=gBrowser.contentDocument.location.href;

		getarchive_website="archive.is"
		try{
			pageLocation = gContextMenu.linkURL;
		}catch(err){
		    pageLocation = "";
		}
		
		/*currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");*/
		//currentLocation = currentLocation.replace("http://web.archive.org/web/");
				
		if(this.getcontenttext().indexOf("No results") > -1 && currentLocation.indexOf("archive.is") > -1){
			return; // no need for this
		}
		
		// http://archive.is/http://link-to.url/page -> http://archive.is/ixIyjm		
		if(currentLocation.indexOf("archive.today") > -1 || currentLocation.indexOf("archive.is") > -1){
			try{
				//linkToPage = content.document.getElementsByClassName("TEXT-BLOCK")[0].getElementsByTagName("a")[0].getAttribute("href");
				linkToPage = content.document.getElementsByClassName("THUMBS-BLOCK")[0].getElementsByTagName("a")[0].getAttribute("href");
				window.content.location.href = linkToPage;
				this.copytoclipboard();
				return;
			}catch(e){
				
			}
		}
		
		pageLocation = this.getLinkFromMediaWikiSelection(currentLocation, pageLocation);

		var indexLocation = pageLocation; // make a new variable that won't conflict with the code below
		if (pageLocation == ""){
			indexLocation = currentLocation;
		}
		if(indexLocation.indexOf("web.archive.org/web/") > -1 || indexLocation.indexOf("http://web.archive.org/save/_embed/") > -1){
			// we have some kind of filled in link
			var indexHttp = indexLocation.indexOf("http", 20);
			if(indexHttp > -1){
				window.content.location.href = "https://archive.is/" + this.cleanurl(indexLocation.substring(indexHttp));
				this.copytoclipboard(); //added
				return;
			}/*else{
				currentLocation = window.content.location.href; // works good so far
			}*/
		}
	
		if (pageLocation.length < 4){
			//alert("currentLocation is " + currentLocation);
			pageLocation = currentLocation;
			if(currentLocation.indexOf("Overleg:") > -1){
				temp = this.getPageLocation();
				if (temp != "NONE"){
					//alert("Lets use the page location");
					//alert("Page location is now " + temp);
					pageLocation = temp;
				}
			}
		}

		if(window.content.location.href.indexOf("wiki") > -1 || buttoncode > 0){
			gBrowser.selectedTab = gBrowser.addTab("http://archive.is/"+this.cleanurl(pageLocation));
		}else{
			window.content.location.href = "https://archive.is/" + gBrowser.contentDocument.location.href;
		}
		this.copytoclipboard(); //added
	},
	prefs: function(){
		return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
	},
	gosearch: function(buttoncode){
		var currentLocation=gBrowser.contentDocument.location.href;
		
		currentLocation = currentLocation.replace("http://archive.today/", "");
		currentLocation = currentLocation.replace("https://archive.today/", "");
		currentLocation = currentLocation.replace("http://archive.is/", "");
		currentLocation = currentLocation.replace("https://archive.is/", "");

		if(currentLocation.indexOf("web.archive.org/web/2") > -1 || currentLocation.indexOf("web.archive.org/web/1") > -1 || currentLocation.indexOf("http://web.archive.org/save/_embed/") > -1){
			var indexHttp = currentLocation.indexOf("http", 20);
			if(indexHttp > -1){
				currentLocation = currentLocation.substring(indexHttp);
			}
		}

		var engine = "google";
		try{
			engine = this.prefs().getCharPref("extensions.getarchive.engine");
		}catch(ex){
			this.showMessage("Please set your favorite search engine in the GetArchive preferences.");
		}
		var baseURL = "";
		
		switch(engine){
			case "auto":
				// TODO: get current search engine URL
				//browser.search.defaultenginename
				//baseURL =
				break;
			case "duckduckgo":
				baseURL = "https://duckduckgo.com/?q="; break;
			case "google":
				baseURL = "https://google.com/search?q="; break;
			case "bing":
				baseURL = "https://bing.com/search?q="; break;
			default:
				if(engine.indexOf("http") > -1){
					baseURL = engine;
				}
				break;
		}
		
		var linkToPage = this.getlocationfrompage(); //archive.today
		if(linkToPage != ""){
			currentLocation = linkToPage;
		}
		
		if(window.content.location.href.indexOf("wiki") > -1 || buttoncode > 0){
			gBrowser.selectedTab = gBrowser.addTab(baseURL+currentLocation);
		}else{
			window.content.location.href = baseURL + currentLocation;
		}     
	},
	paste: function(){
		goDoCommand('cmd_paste');
	},
	readclipboardv2: function(){
		var trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
		trans.init(null)
		trans.addDataFlavor("text/unicode");

		Services.clipboard.getData(trans, Services.clipboard.kGlobalClipboard);

		var str       = {};
		var strLength = {};

		trans.getTransferData("text/unicode", str, strLength);

		if (str) {
		  return str.value.QueryInterface(Ci.nsISupportsString).data;
		}
		return ""
	},
	pastecomment: function(){
		// paste with <!-- Archieflink: -->
		var	clipboardText = this.readclipboardv2();

		if(clipboardText != ""){
			if(window.content.location.href.indexOf("nl.wikipedia.org") > -1){
				newClipboardText = "<!-- Archieflink: " + clipboardText + " -->"
				this.copytoclipboardv2(newClipboardText); // we can't paste random text, only from clipboard
				goDoCommand('cmd_paste');
				this.copytoclipboardv2(clipboardText); //restore url to clipboard
			}else{
				goDoCommand('cmd_paste');
			}
		}	
	},
	getInnerBody: function(){
		return window.content.document.body.innerHTML;
	},
	cleanurl: function(url){
		if(url.indexOf("[") == 0){
			url = url.substring(1);
		}
		if(url.indexOf("ttp") == 0 && url.indexOf("://") > -1){
			url = "h" + url;
		}
		if(url.indexOf("tp") == 0 && url.indexOf("://") > -1){
			url = "ht" + url;
		}
		
		return url.trim();
	},
	showMessage: function(message){
		var alertsService = Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService);
		var title = "Get Archive";

		alertsService.showAlertNotification("", "Get Archive", message, true, "", this, "");
	},
}
