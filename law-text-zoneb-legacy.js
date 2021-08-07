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
<div class="curatedEventsWrapper" id="id<t4 type='meta' meta='content_id' />">
  <div class="curatedEvents">
    
    <div class="curatedEventsTitle">
      <h3>
        <span><t4 type="content" name="Box Title" output="normal" modifiers="striptags,htmlentities" /></span>
      </h3>
    </div>  
    <div class="curatedEventsList">
      <div class="arrow-red"></div>
	    <ul> 

	      <!-- Curated Events go here -->
	        
	    </ul>
    </div>
  </div>
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
	var CID = 237; // The ID of the "Curated Event" content type
	var SSID = null;
	if (content.hasElement('Event Section')) {
		var match = String(content.get('Event Section')).match(/sslink_id="(\d+)"/);
		if (match) {
			SSID = match[1];
		}
	}

	// Open the Curated Events Box
	document.write('<div class="curatedEventsWrapper" id="id' + content.getID() + '"><div class="curatedEvents"><div class="curatedEventsTitle"><h3><span>' + content.get('Box Title') + '</span></h3></div><div class="curatedEventsList"><div class="arrow-red"></div><ul>');

	// Get event section
	var oSection = null;
	if (SSID) {
		var oSSLM = ServerSideLinkManager.getManager();
		var mySectionLinkID = Number(SSID);
		var myLink = oSSLM.getLink(dbStatement.getConnection(), mySectionLinkID, section.getID(), content.getID(), language);
		var sectionID =  myLink.getToSectionID();
		var oC = ApplicationContextProvider.getBean(Cache);
		oSection = oC.get(sectionID);
	}
	else {
		var sectionChildren = section.getChildren(); // CachedSection[]
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
			if (content.getContentTypeID() == CID && content.get('Event End Date and time').getValue().compareTo(now) > 0)
				events.push(content);
		}
	}

	// If events past the current date were found
	if (events)
	{
		/** Scope variables **/
		var FORMATTER = 'seattleu/curatedEvents'; // Name of Curated Event's content layout
		var EVENT_LIMIT = 3; // Limits number of events displayed
		var templateManager = TemplateManager.getManager();
		var format = templateManager.getFormat(dbStatement, CID, FORMATTER);
		var formatString = format.getFormatting();
		// Sort content by "Event Date and time" element, earliest first, and write to document
		events.sort(gregorianCompare);
		for (var i = 0; i < events.length && i < EVENT_LIMIT; i++) {
			document.write(com.terminalfour.publish.utils.BrokerUtils.processT4Tags(dbStatement, publishCache, oSection, events[i], language, isPreview, formatString));
		}
	}

	// Close the Curated Events Box
	document.write('</ul></div></div></div>');
}
catch (err) {
	document.write('<!--' + err + '-->');
}