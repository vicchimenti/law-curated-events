/**
 * Programmable layout for getting top content from a child section
 * in the same way that a related content nav object would.
 *
 * List of Java objects available as variables:
 * https://community.terminalfour.com/documentation/core/current/assets/content-types/programmable-layouts/
 *
 * TerminalFour Java API for cross-referencing variables and their functions
 * https://community.terminalfour.com/info/api/sitemanager-7.3/
 *
 * Examples of programmable layouts
 * https://community.terminalfour.com/how-to/-/programmable-layouts/
 *
 * Forum thread that helped bridge differences between V7 and V8
 * (because API documentation only existed for V7 at the time...)
 * https://community.terminalfour.com/forum/index.php?topic=498
 *
 * Contents are as follows:
 * -HTML layout of Curated Events Box (because document.write string is hard to understand)
 * -gregorianCompare(), for comparing the date of two Curated Events
 * -Main method
 */

 /** HTML layout
<t4 type="meta" meta="html_anchor" />
<div class="curatedEventsWrapper contentItem bgColor<t4 type='content' name='Background Color' output='normal' display_field='value' />" id="id<t4 type='meta' meta='content_id' />" data-position-default="ZoneB" data-position-selected="<t4 type='content' name='Zone Option' output='normal' display_field='value' />">
  <div class="curatedEvents col-md-8 col-md-offset-2">
    
    <div class="curatedEventsTitle">
      <h3>
        <span><t4 type="content" name="Box Title" output="normal" modifiers="striptags,htmlentities" /></span>
      </h3>
    </div>  
    <div class="curatedEventsList">
	    <ul> 

	      <!-- Curated Events go here -->
	        
	    </ul>
    </div>
  </div>
  <div class="clearfix"></div>
</div> 
 */

/**
 * Function that compares two Content objects based on the GregorianCalendar object
 * stored in its "Event Date and time" element.
 *
 * This function is explicitly designed to work with the "Curated Event" content type,
 * but will work with any content type that has a data element named "Event Date and time".
 *
 * @param a First Content object
 * @param b Second Content object
 */
 function gregorianCompare(a, b) {
	var dateA = a.get('Event Start Date and time').getValue(); // GregorianCalendar object from Content a
	var dateB = b.get('Event Start Date and time').getValue(); // GregorianCalendar object from Content b
	return dateA.compareTo(dateB); // compareTo() is a Java function that works with two GregorianCalendar objects
}


// Import relevant Java classes
importClass(com.terminalfour.sitemanager.cache.CachedContent);
importClass(com.terminalfour.spring.ApplicationContextProvider);
importClass(com.terminalfour.content.IContentManager);
importClass(com.terminalfour.template.TemplateManager);
importClass(com.terminalfour.navigation.ServerSideLinkManager);
importClass(com.terminalfour.sitemanager.cache.Cache);

try {
	/** Global variables **/
	var CID = 5568; // The ID of the "Curated Event" content type for law is 5568 and edu is 237
	var SSID = null;
	if (content.hasElement('Event Section')) {
		var match = String(content.get('Event Section')).match(/sslink_id="(\d+)"/);
		if (match) {
			SSID = match[1];
            //document.write('<span style="display:none;">CuratedSSID Found ' + content + '</span>');
		}
	}
    var bgImage = com.terminalfour.publish.utils.BrokerUtils.processT4Tags(dbStatement, publishCache, section, content, language, isPreview, "<t4 type='content' name='Background Image' output='imageurl' />");
    var bgColor = String(content.get('Background Color').publish());
    var bgRGBA = "rgba(51,51,51,0)"; 

    switch (bgColor) {
      case "Black": 
        bgRGBA = "rgba(51,51,51,.5)";
        break;
      case "Red": 
        bgRGBA = "rgba(170,0,0,.8)";
        break;
      case "Orange": 
        bgRGBA = "rgba(239,65,53,.8)";
        break;
      case "Gold": 
        bgRGBA = "rgba(253,185,19,.8)";
        break;
      case "Green": 
        bgRGBA = "rgba(85,179,27,.8)";
        break;
      case "DarkGreen":
        bgRGBA = "rgba(18, 74, 18, .8)";
        break;
      case "Brown":
        bgRGBA = "rgba(128, 112, 96, .8)";
        break;
      case "White":
        bgRGBA = "rgba(247, 247, 247, .8)";
        break;
      case "Emerald":
        bgRGBA = "rgba(0,155,122,.8)";
        break;
      case "LightBlue":
        bgRGBA = "rgba(4,169,197,.8)";
        break;
      case "DarkBlue":
        bgRGBA = "rgba(0,50,130,.8)";
        break;
      default:
        bgRGBA = "rgba(51,51,51,0)";
    }
      
    // Open the Curated Events Box
  document.write('<div style="background-image:linear-gradient(' + bgRGBA + ',' + bgRGBA + '),url(' + bgImage + ');" class="featuredCuratedEventsWrapper contentItem curatedEventsBox' + content.get('Background Color').publish() + ' noGap" data-position-default="Main" data-position-selected="Main" id="id' + content.getID() + '" aria-labelledby="labelForFeaturedEvents"><div class="curatedEventsTitle"><h2 id="labelForFeaturedEvents"><span>' + content.get('Box Title') + '</span></h2></div><div class="featuredCuratedEvents standardContent"><ul class="curatedEventsList">');

	// Get event section
	var oSection = null;
	if (SSID) {
		var oSSLM = ServerSideLinkManager.getManager();
		var mySectionLinkID = Number(SSID);
		var myLink = oSSLM.getLink(dbStatement.getConnection(), mySectionLinkID, section.getID(), content.getID(), language);
		var sectionID =  myLink.getToSectionID();
		var oC = ApplicationContextProvider.getBean(Cache);
		oSection = oC.get(sectionID);       
      //Added 12/15/17 By Max, To check if right section was seelcted under event section; Deactivated by Jason 6/22/18
//        if(oSection.getName('en') != "Curated Events"){
//			document.write("<div class='featuredCuratedEventsError'> Could not find Curated Events section, please update your selection under 'Event Section'.</div>");
//        }
      //Added 12/15/17 By Max
	}
	else {
		var sectionChildren = section.getChildren(); // CachedSection[]
      	//document.write('<span style="display:none;"> childList ' + sectionChildren + '</span>');
		for (var i = 0; i < sectionChildren.length && !oSection; i++) {
			if (sectionChildren[i].getName('en') == "Curated Events")
				oSection = sectionChildren[i];
		}	
	}
	
	// If event section exists
	if (oSection)
	{
		/** Scope variables **/
		var contentList = oSection.getContent(language, CachedContent.APPROVED); // CachedContent[] of content in the section
		var oCM = ApplicationContextProvider.getBean(IContentManager); // Replaces ContentManager from V7
		var events = []; // Will be populated with events occurring after the current date
		var now = new java.util.GregorianCalendar(); // Current date, used for comparison with date from "Curated Event" content
		// For each content item in the section
		for (var i = 0; i < contentList.length; i++) {
			var content = oCM.get(contentList[i].ID, language);
			// If content is of type "Curated Event" and the event's date is after the current date, push event to array
			// Note: getContentTypeID() in V8 was getTemplateID() in V7
			//if (content.getContentTypeID() == CID && content.get('Event End Date and time').getValue().compareTo(now) > 0) added checking if status is approved.
          //Added 12/15/17 By Max, check that status is approved.
          	if (content.getContentTypeID() == CID && content.get('Event End Date and time').getValue().compareTo(now) > 0 && content.getStatus() == 0)
				events.push(content);
		}
    }else{
      //Added 12/15/17 By Max
      document.write("<div class='featuredCuratedEventsError'> Could not find Curated Events section, please be sure it exists.</div>");
      //Added 12/15/17 By Max
    }

	// If events past the current date were found
	if (events)
	{
		/** Scope variables **/
		var FORMATTER = 'law/curatedEventsBox/eventsFeatured'; // Name of Curated Event's content layout
		var EVENT_LIMIT = 3; // Limits number of events displayed
		var templateManager = TemplateManager.getManager();
		var format = templateManager.getFormat(dbStatement, CID, FORMATTER);
		var formatString = format.getFormatting();
		// Sort content by "Event Date and time" element, earliest first, and write to document
		events.sort(gregorianCompare);
		for (var i = 0; i < events.length && i < EVENT_LIMIT; i++) {
			document.write(com.terminalfour.publish.utils.BrokerUtils.processT4Tags(dbStatement, publishCache, oSection, events[i], language, isPreview, formatString));
          
		}
    }else{
      //Added 12/15/17 By Max
      document.write("<div class='featuredCuratedEventsError'> Could not find a list of Curated Events, please be sure they exist.</div>");
      //Added 12/15/17 By Max
    }

	// Close the Curated Events Box
	document.write('<div class="clearfix"></div></ul></div><div class="clearfix"></div></div>');
}
catch (err) {
	document.write('<!--' + err + '-->');
}