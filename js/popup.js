// Main .js file which essentially handles everything regarding the extension's tab management outside of the popup.html and tabstates.html files


var savedTabStates = []; // global array intended to provide easy access to existing TabStates

// Function which is called when the user clicks on the main "save TabState" button and handles the storing of the current set of tabs
function submitTabs() {
    var tabfield = document.getElementById("NewTabState");
    var tabname = tabfield.value;

    var spaceCheck = tabname.replace(/\s/g, '').length; // counts spaces/empty? characters in given string to check for valid input


    if (spaceCheck && tabname.length <= 36) // 36 is max length of TabState name
    {
      // ADD SUPPORT FOR SYNC STORAGE LATER; TRY ONLY USING URL/FAVICON INFO
      chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT }, function (tabs) { // or currentWindow: true
        chrome.storage.local.set({[tabname] : tabs}, function() {
            // Notify that we saved.
            //console.log('Settings saved');
            //console.log(tabs);
          });
      });


      // resets textbox
      tabfield.value = "";

      //console.log("Saved new tab group so checking tab states");
      if (savedTabStates.includes(tabname))
      {
        //console.log("TabState already exists");
      }
      else
      {
        savedTabStates.push(tabname);
        //console.log(tabname);
      }

      document.getElementById("tabsframe").contentWindow.document.location.reload(); // imperfect JavaScript solution which simply refreshes the i-frame and repopulates the TabStates (which includes the newly-saved tabs). Not ideal
    }
    else // field is emptpy so do nothing
    {
      tabfield.value = "";
    }
}

// Main function which populates i-frame with saved TabStates every time the i-frame loads, including refreshes
function populateTabStates() {
  var ListView = document.getElementById("tabsframe").contentWindow.document.getElementById("expand"); // the main div which all TabState elements should be appended to
  var spanArray = [];
  var k = 0;

  chrome.storage.local.get(null, function (obj) {
    //console.log(obj);
    for (property_index in obj) // property index is the key of each array
    {
        if (savedTabStates.includes(property_index)) // if the TabState was already added to the array then do nothing
        {

        }
        else // otherwise push the TabState to the savedTabStates array
        {
          savedTabStates.push(property_index);
        }


        //
        // Large block of code which creates the title/buttons for each TabState element of the i-frame
        //
        var span = document.createElement('span');
        span.className = "open";
        span.textContent = property_index;
        span.innerHTML = property_index;
        span.title = "Click to view/collapse tabs in TabState"

        var buttons = document.createElement('div');
        buttons.className = "buttons";

        var openBtn = document.createElement('img');
        openBtn.className = "openBtn";
        openBtn.title = "Open tabs in a new window";
        openBtn.alt = "Open tabs in a new window";
        openBtn.src = "/images/NewWindow.png";

        var openBtnNew = document.createElement('img');
        openBtnNew.className = "openBtnNew";
        openBtnNew.title = "Open tabs in current window";
        openBtnNew.alt = "Open tabs in current window";
        openBtnNew.src = "/images/SameWindow.png";

        var rmvBtn = document.createElement('img');
        rmvBtn.className = "rmvBtn";
        rmvBtn.title = "Remove TabState";
        rmvBtn.alt = "Remove TabState";
        rmvBtn.src = "/images/RemoveHover.png";

        var edtBtn = document.createElement('img');
        edtBtn.className = "edtBtn";
        edtBtn.title = "Edit TabState Name";
        edtBtn.alt = "Edit TabState Name";
        edtBtn.src = "/images/Edit.png";

        // appends buttons in specific order after creating them to the main button container div
        buttons.appendChild(openBtnNew);
        buttons.appendChild(openBtn);
        buttons.appendChild(edtBtn);
        buttons.appendChild(rmvBtn);

        span.appendChild(buttons);
        ListView.appendChild(span);


        spanArray.push(span.offsetWidth); // the width of the span element used later for click detection

        var ul = document.createElement('ul');
        ul.className = "tabs";



        //
        // Large block of code which allows for the listing of TabState contains within the i-frame by accessing the relevant information from the obj in the callback of chrome.storage call
        //
        for (index in obj[property_index])
        {
          var li = document.createElement('li');
          var a = document.createElement('a');
          var img = document.createElement('img');

          // LOOK INTO ADDING EVENT HANDLER FOR CHROME:// LINKS AS THEY CURRENTLY WON'T WORK
          // INFORM USER ABOUT CHROME API LIMITATIONS

          a.textContent = obj[property_index][index].title;
          a.setAttribute("href", obj[property_index][index].url);
          a.setAttribute("target", "_blank");

          img.className = "icon";

          if (obj[property_index][index].favIconUrl == null) // some links don't have a favicon stored so assign them an empty doc icon
          {
              //console.log("favicon is null for page so assigning filler icon");
              img.src = "/images/EmptyFavIcon.png";
          }
          else
          {
            img.src = obj[property_index][index].favIconUrl;
            if(obj[property_index][index].url.toLowerCase().includes("chrome://")) // temporary solution since certain chrome pages like "extensions, settings" have favicons that are inaccessible due to API limitations
            {
              // can use nested ifs for specific images
              img.src = "/images/googleFavIcon.png"; // currently using generic google image as stock favicon for forbidden chrome pages
            }

          }

          //img.src = "chrome://favicon/https://www.yahoo.com/"; way to use favicons
          li.appendChild(img);
          li.appendChild(a);

          ul.appendChild(li);
        }

        ListView.appendChild(ul);
    }

  });


setTimeout(function(){ // test/look for alternative here

    //
    // Grabbing classes in doc (i-frame) and storing them accordingly
    //
    var openClasses = document.getElementById("tabsframe").contentWindow.document.getElementsByClassName("open");
    //console.log(openClasses, openClasses.length);

    var tabsClasses = document.getElementById("tabsframe").contentWindow.document.getElementsByClassName("tabs");
    //console.log(tabsClasses, tabsClasses.length);

    var buttonClasses = document.getElementById("tabsframe").contentWindow.document.getElementsByClassName("buttons");
    //console.log(buttonClasses, buttonClasses.length);

    var openBtnClasses = document.getElementById("tabsframe").contentWindow.document.getElementsByClassName("openBtn");
    //console.log(openBtnClasses, openBtnClasses.length);

    var openBtnNewClasses = document.getElementById("tabsframe").contentWindow.document.getElementsByClassName("openBtnNew");
    //console.log(openBtnNewClasses, openBtnNewClasses.length);

    var rmvBtnClasses = document.getElementById("tabsframe").contentWindow.document.getElementsByClassName("rmvBtn");
    //console.log(rmvBtnClasses, rmvBtnClasses.length);

    var edtBtnClasses = document.getElementById("tabsframe").contentWindow.document.getElementsByClassName("edtBtn");
    //console.log(textContainerClasses, textContainerClasses.length);


    // Loop uesd to set all event listeners for every TabState and its components
    for (i = 0; i < openClasses.length; i++){ // could also be tabsClasses or buttonClasses, etc; can assume that they're all equal
      openClasses[i].addEventListener("click", matchLists.bind(null, null, tabsClasses[i], spanArray, i));

      openClasses[i].addEventListener("mouseover", handleButtons.bind(null, buttonClasses[i], "s"));

      openClasses[i].addEventListener("mouseout", handleButtons.bind(null, buttonClasses[i], "h"));

      openBtnClasses[i].addEventListener("click", handleButtonClicks.bind(null, openClasses[i].textContent, tabsClasses[i], "nw"));

      openBtnNewClasses[i].addEventListener("click", handleButtonClicks.bind(null, openClasses[i].textContent, tabsClasses[i], "sw"));

      rmvBtnClasses[i].addEventListener("click", handleButtonClicks.bind(null, openClasses[i].textContent, tabsClasses[i], "rm"));

      edtBtnClasses[i].addEventListener("click", handleButtonClicks.bind(null, openClasses[i].textContent, tabsClasses[i], "rn"));

  }
}, 50); // waits 50ms for dynammically-added elements to load
}

// Function which allows for an expanded/collapsable view of the saved TabStates on click
function matchLists (und, list, spanlist, counter, e)
{
  // 8 < x < spanwidth + 8 then valid, but if less than 8 or greater than spanheight, nothing (old method but saving just in case)
  // 8 is the margin value on the body element

  var width = spanlist[counter]; // spanlist contains height/width of span element located at "counter" index among the other span elements

  if (e.clientX >= 8 && e.clientX <= width - 5) // 8 due to margin on left side, 5 due to right side issues with click detection
  {
    if (list.style.display == "block")
    {
      list.style.display = "none";
    }
    else
    {
      list.style.display = "block";
    }
  }

  else
  {

  }
}

// Function which handles the display of the management buttons corresponding to a saved TabState on mouseover/mouseout
function handleButtons(buttons, flag)
{
  if (flag == "s")
  {
    buttons.style.display = "inline-block";
  }
  if (flag == "h")
  {
    buttons.style.display = "none";
  }

}

// Function which deals with button clicks regarding a corresponding TabState (ie opening in same/new window, editing TabState name, and removing TabState)
function handleButtonClicks(name, tabs, flag)
{
  if (flag == "nw")
  {
    chrome.storage.local.get(null, function (obj) { // change local to sync if adding as feature
      // could also do var tabs = obj[Object.keys(obj)[0]], then for(i in tabs), tabs[i] but probably not as efficient
      //console.log("Detected button click so should open tabs now");

      for (property_index in obj) // property index is the key of each array
      {

          if (property_index == name)
          {
            var i;
            var tabURLs = new Array(obj[property_index].length);

            for (i = 0; i < obj[property_index].length; i++)
            {
              //console.log(LoadBox.options[i].text);
              tabURLs[i] = obj[property_index][i].url;
            }

            chrome.windows.create({url: tabURLs, state: 'maximized'});

            //console.log(tabURLs);
          }
          else
          {

          }

      }

    });
  }
  else if (flag == "sw")
  {
    chrome.storage.local.get(null, function (obj) { // change local to sync if adding as feature
      // could also do var tabs = obj[Object.keys(obj)[0]], then for(i in tabs), tabs[i] but probably not as efficient
      //console.log("Detected button click so should open tabs now");

      for (property_index in obj) // property index is the key of each array
      {

          if (property_index == name)
          {
            var i;
            var tabURLs = new Array(obj[property_index].length);

            for (i = 0; i < obj[property_index].length; i++)
            {
              //console.log(LoadBox.options[i].text);
              tabURLs[i] = obj[property_index][i].url;
              chrome.tabs.create({url: obj[property_index][i].url, active: false});
            }

            //console.log(tabURLs);
          }
          else
          {

          }

      }

    });
  }
  else if (flag == "rm")
  {
    chrome.storage.local.get(null, function (obj) { // change local to sync if adding as feature
      // could also do var tabs = obj[Object.keys(obj)[0]], then for(i in tabs), tabs[i] but probably not as efficient
      //console.log("Detected button click so should open tabs now");

      for (property_index in obj) // property index is the key of each array
      {

          if (property_index == name)
          {
            var j;

            for (j = 0; j < savedTabStates.length; j++) // if the TabState-to-be-edited is found, then remove its entry in the savedTabStates array
            {
              if (savedTabStates[j] == name)
              {
                savedTabStates.splice(j, 1);
                break;
              }
            }

            // removes old TabState entry
            chrome.storage.local.remove(property_index);
            break;
          }
          else
          {

          }

      }
      document.getElementById("tabsframe").contentWindow.document.location.reload(); // imperfect JavaScript solution which simply refreshes the i-frame and repopulates the TabStates (which includes the newly-updated set of TabStates). Not ideal
    });
  }
  else if (flag == "rn")
  {
    var editTabState = document.getElementById("editTabState");
    var focusEditWindow = document.getElementById("focusEditWindow");
    var editTabStateTextBox = document.getElementById("editTabStateTextBox");

    // buttons
    var saveTabName = document.getElementById("saveTabName");
    var cancelWindow = document.getElementById("cancelWindow");

    editTabState.style.display = "block";
    focusEditWindow.style.display = "block";

    //console.log(editTabState.style.display);
    //console.log(focusEditWindow.style.display);

    // event handler function which deals with a user trying to press the save button within the "editTabState" window
    function saveElementFunc(event){
      var newTabStateName = editTabStateTextBox.value;
      var spaceCheck = newTabStateName.replace(/\s/g, '').length; // counts spaces/empty? characters in given string to check for valid input


      if (spaceCheck && newTabStateName.length <= 36) // 36 is max length of TabState name
      {
        if(savedTabStates.includes(newTabStateName))
        {
          // alert may not be an ideal solution so this may potentially change to something less intrusive later on
          alert("That name already exists"); // alerts the user if they're trying to save the TabState with a name for another/or the same TabState that already exists
          //console.log("That name already exists.")
        }
        else
        {
          chrome.storage.local.get(null, function (obj) { // change local to sync if adding as feature
            // could also do var tabs = obj[Object.keys(obj)[0]], then for(i in tabs), tabs[i] but probably not as efficient
            //console.log(obj);
            //console.log("name", name);

            for (property_index in obj) // property index is the key of each array
            {

                if (property_index == name) // replace with given new name
                {

                  //console.log("property_index", property_index);
                  var j;

                  // if the TabState-to-be-edited is found, then remove its entry and add the newTabStateName as its replacement value in the savedTabStates array
                  for (j = 0; j < savedTabStates.length; j++)
                  {
                    if (savedTabStates[j] == name)
                    {
                      savedTabStates.splice(j, 1, newTabStateName);
                      break;
                    }
                  }

                  // sets the newTabStateName as a new key in the chrome.storage.local environment, which seems to be the only way to "replace" an element as it doesn't seem possible to rename a key
                  chrome.storage.local.set({[newTabStateName] : obj[property_index]}, function() {
                      // Notify that we saved.
                      console.log('Settings saved');
                      //console.log(tabs);
                    });

                  // removes old TabState entry after adding its replacement
                  chrome.storage.local.remove(property_index);
                  break;
                }
                else
                {

                }

            }
            document.getElementById("tabsframe").contentWindow.document.location.reload(); // imperfect JavaScript solution which simply refreshes the i-frame and repopulates the TabStates (which includes the newly-renamed TabState). Not ideal
            editTabState.style.display = "none";
            focusEditWindow.style.display = "none";
            editTabStateTextBox.value = "";
          });
      }
    }
      else
      {
        editTabStateTextBox.value = "";
      }
    }

    // event handler function which closes the "editTabState" window and also gets rid of the invisible "focusEditWindow" when the user clicks the cancel button. Also resets "editTabStateTextBox" value to empty
    function cancelWindowFunc(event){
      editTabState.style.display = "none";
      focusEditWindow.style.display = "none";
      editTabStateTextBox.value = "";
    }


    saveTabName.addEventListener("click", saveElementFunc);
    cancelWindow.addEventListener("click", cancelWindowFunc);


    // this event check is used to continually check for when the "editTabState" window is closed, because there are two independent event handlers
    // on that page; this check removes the event handlers after the user has closed the window. Not sure if this is an ideal solution
    // but removing the event handlers from within each event handler proved to be a bit difficult
    var eventCheck = setInterval(function(){
      if(editTabState.style.display == "none" && focusEditWindow.style.display == "none")
      {
        saveTabName.removeEventListener("click", saveElementFunc);
        cancelWindow.removeEventListener("click", cancelWindowFunc);
        //console.log("removed listeners and clearing interval");
        clearInterval(eventCheck); // gets rid of setInterval function after window has been closed
      }
      //console.log("polling");
    }, 1000); // checks every second

  }

}

// defines onload function for i-frame; specifically, the onload function just loads the saved TabStates whenever the i-frame is loaded by calling the populateTabStates function
window.frames['tabsframe'].onload = function(){
  //console.log("frame onload");
  populateTabStates();
}

// defines onload function for main html page; specifically, the onload function sets an event listener for the save button which exists outside of the i-frame
window.onload=function(){
    //console.log("popuphtml onload");
    var SaveButton = document.getElementById("SaveTabsButton");
    SaveButton.addEventListener("click", submitTabs);

    // for debugging/checking storage; may also be useful to user so leaving it in for now
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
          var storageChange = changes[key];
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
      });
}
