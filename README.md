# Head Counts Update Form

This generates a form for entering head count statistics into LibInsight. Its layout mimics the paper forms in use in Access Services.

The fullLocations object indexes the full name of a location for which headcounts are taken by the number assigned to it by the LibInsight dataset.

If updates are needed, upload the file in the LibGuides Custom JS/CSS area, and tell access services they will need to refresh the page to get the new JS (alternatively go to the form page in LibGuides and add a query string to force reload after uploading new file).

Access Services does counts at different times and we have to account for extended and overnight hours during finals times, so that makes the code slightly more complicated. Otherwise it is a fairly direct "Here is an input with data the way LibInsight expects it".