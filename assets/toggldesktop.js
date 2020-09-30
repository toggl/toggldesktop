var os = ["mac", "win", "linux"],
 releaseUrl = "https://github.com/toggl-open-source/toggldesktop/releases/tag/v"
 downloadUrl = "https://github.com/toggl-open-source/toggldesktop/releases/download/v",
 changelogDataFolder = "https://toggl-open-source.github.io/toggldesktop/assets/changelog/";

var loadImg = function(tab) {
  var imgs = tab.querySelectorAll("img");
  for (var i = imgs.length - 1; i >= 0; i--) {
    if (!!imgs[i].src) {
      return;
    }
    imgs[i].src = imgs[i].getAttribute("data-src");
  }
}

var showOs = function(os) {
  var hash = os.split("/"),
    tab,
    osname,
    item;

  osname = hash[0];
  tab = document.querySelector(".pages ." + hash[0]);

  if (!tab) {
    return;
  }
  if (!!document.querySelector(".pages .active")) {
    document.querySelector(".pages .active").classList.remove("active");
  }
    
  tab.classList.add("active");

  if (!!document.querySelector(".platform-links .current")) {
    document.querySelector(".platform-links .current").classList.remove("current");
  }
  document.querySelector(".platform-links ." + osname).classList.add("current");

  if (hash.length > 1) {
    item = document.querySelector("#" + osname + "-" + hash[1].replace(/\./g,'-'));
    if (!!item) {
      item.scrollIntoView();
    }
  }
}

var detectOs = function() {
  if (navigator.appVersion.indexOf("Win")!=-1) showOs("win")
  if (navigator.appVersion.indexOf("Mac")!=-1) showOs("mac")
  if (navigator.appVersion.indexOf("X11")!=-1 
    || navigator.appVersion.indexOf("Linux")!=-1) showOs("linux");
}

var detectHash = function(hash) {
  if (!!hash) {
    showOs(window.location.hash.substr(1));
  } else {
    detectOs();  
  }
}

var generateChangelog = function() {
  for (var i = 0; i < os.length; i++) {
    readJSON(os[i]);
  }
}

var fillChangelog = function(os, json) {
  var div = document.querySelector(".os." + os),
    html = "",
    item,
    img;

  for (var i = 0; i < json.versions.length; i++) {
    item = json.versions[i];
    html += 
      '<div class="version">' +
      '  <h3>' +
      '    <a id="mac-' + item.version.replace('.','-') +'" class="anchor" href="#mac/' + item.version + '" aria-hidden="true">' +
      '      <span class="octicon octicon-link">' + item.version + '</span>' +
      '    </a>';

    // if changelog is beta add label
    if (!!item.beta) {
      html += 
      '    <span class="beta"></span>';
    }
    
    // Generate download link for each os
    if (os == "mac") {
        html += 
          '    <a class="download-link" href="' + downloadUrl + item.version + '/TogglDesktop-' + item.version.replace(/\./g,"_") + '.dmg" title="Download ' + os + ' version ' + item.version + '">download</a>' +
          '    <span class="date">' + item.date + '</span>' +
          '  </h3>' +
          '  <ul>';
    } else if (os == "win") {
        html += 
          '    <a class="download-link" href="' + downloadUrl + item.version + '/TogglDesktopInstaller-' + item.version + '.exe" title="Download ' + os + ' version ' + item.version + '">32-bit</a>'
          if (item.has64bit) {
            html += '    <a class="download-link" href="' + downloadUrl + item.version + '/TogglDesktopInstaller-x64-' + item.version + '.exe" title="Download win 64-bit version ' + item.version + '">64-bit</a>'
          }
          html += '    <span class="date">' + item.date + '</span>' +
          '  </h3>' +
          '  <ul>';
    } else if (os == "linux") {
        html += 
        '    <a class="download-link" href="' + downloadUrl + item.version + '/toggldesktop_linux_' + item.version + '_x86_64.tar.gz" title="Download linux tarball version ' + item.version + '">tar.gz</a>'
        html += 
          '    <a class="download-link" href="' + downloadUrl + item.version + '/toggldesktop_' + item.version + '_ubuntu1604_amd64.deb" title="Download linux deb version ' + item.version + '">deb 64-bit</a>'
        html +=
        '    <a class="download-link" href="' + releaseUrl + item.version + '" title="See all packages for version ' + item.version + '">GitHub</a>'
        html +=
          '    <span class="date">' + item.date + '</span>' +
          '  </h3>' +
          '  <ul>';
    }

    // if (os ==) {}


    for (var j = 0; j < item.rows.length; j++) {
      html += '<li>' + item.rows[j] + '</li>';
    }

    html +=
      '  </ul>';

    // if changelog has screenshots add them
    if (!!item.screenshots) {
      html += '<div class="screenshots">';
      for (var j = 0; j < item.screenshots.length; j++) {
        img = item.screenshots[j];
        html +=
          '<p>' + img.text + '</p>' +
          '<img data-src="' + img.img + '"/>' +
          '</br>' +
          '</br>';
      }
      html += '</div>';
    }
    html += '</div>';
  }

  div.innerHTML = html;

  loadImg(div);
}

function readJSON(os) {
    var xhr = new XMLHttpRequest(),
      json;
    xhr.open('GET', changelogDataFolder + os + ".json", true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) { 
      if (this.status == 200) {
          var file = new File([this.response], 'temp');
          var fileReader = new FileReader();
          fileReader.addEventListener('load', function(){
               json = JSON.parse(fileReader.result);
               fillChangelog(os, json);
          });
          fileReader.readAsText(file);
      } else {
        showError()
      }
    }
    xhr.send();
}

window.onload = function(){ 
  detectHash(window.location.hash)
  generateChangelog();
}

function locationHashChanged() {
  detectHash(window.location.hash)
}

window.onhashchange = locationHashChanged;
