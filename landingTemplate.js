const STYLESHEET = `
* {
   box-sizing: border-box;
}

body,
html {
   margin: 0;
   padding: 0;
   width: 100%;
   height: 100%
}

html {
   background-size: auto 100%;
   background-size: cover;
   background-position: center center;
   background-repeat: repeat-y;
}

body {
   display: flex;
   background-color: transparent;
   font-family: 'Open Sans', Arial, sans-serif;
   color: white;
}

h1 {
   font-size: 4.5vh;
   font-weight: 700;
}

h2 {
   font-size: 2.2vh;
   font-weight: normal;
   font-style: italic;
   opacity: 0.8;
}

h3 {
   font-size: 2.2vh;
}

h1,
h2,
h3,
p,
label {
   margin: 0;
   text-shadow: 0 0 1vh rgba(0, 0, 0, 0.15);
}

p {
   font-size: 1.75vh;
}

ul {
   font-size: 1.75vh;
   margin: 0;
   margin-top: 1vh;
   padding-left: 3vh;
}

a {
   color: green
}

a.install-link {
   text-decoration: none
}

button {
   border: 0;
   outline: 0;
   color: white;
   background: #8A5AAB;
   padding: 1.2vh 3.5vh;
   margin: auto;
   text-align: center;
   font-family: 'Open Sans', Arial, sans-serif;
   font-size: 2.2vh;
   font-weight: 600;
   cursor: pointer;
   display: block;
   box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2);
   transition: box-shadow 0.1s ease-in-out;
}

button:hover {
   box-shadow: none;
}

button:active {
   box-shadow: 0 0 0 0.5vh white inset;
}

#addon {
   width: 90vh;
   margin: auto;
   padding-left: 10%;
   padding-right: 10%;
   background: rgba(0, 0, 0, 0.60);
}

.logo {
   height: 14vh;
   width: 14vh;
   margin: auto;
   margin-bottom: 3vh;
}

.logo img {
   width: 100%;
}

.name, .version {
   display: inline-block;
   vertical-align: top;
}

.name {
   line-height: 5vh;
}

.version {
   position: absolute;
   line-height: 5vh;
   margin-left: 1vh;
   opacity: 0.8;
}

.contact {
   left: 0;
   bottom: 4vh;
   width: 100%;
   margin-top: 1vh;
   text-align: center;
}

.contact a {
   font-size: 1.4vh;
   font-style: italic;
}

.separator {
   margin-bottom: 4vh;
}

.label {
  font-size: 2.2vh;
  font-weight: 600;
  padding: 0;
  line-height: inherit;
}

.btn-group, .multiselect-container {
  width: 100%;
}

.btn {
  text-align: left;
}

.multiselect-container {
  border: 0;
  border-radius: 0;
}

.input, .btn {
  height: 3.8vh;
  width: 100%;
  margin: auto;
  margin-bottom: 10px;
  padding: 6px 12px;
  border: 0;
  border-radius: 0;
  outline: 0;
  color: #333;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2);
}
`;
function landingTemplate(){

const regions = require('./regions.json');

const manifest = require("./manifest.json");
var functionHTML =`function generateInstallLink() {
			  var providers = {};
			  var regions = [];`;



var scriptHTML =`<script type="text/javascript">
	  
          $(document).ready(function() {`;
		  
  var regionsHTML = '<br>';
  var i = 0;
  for (let region in regions){  
	  regionsHTML +=`<input type="checkbox" id="${region}" value="${region}" checked> ${regions[region].name}</input><br>`;
	  
	  scriptHTML +=` $('#${region}').click(function() {
		generateInstallLink()
	});`;
			  
	functionHTML +=` if($('#${region}').is(':checked')){
	regions.push($('#${region}').val());
	
    
	}else{
		regions = regions.filter(function(value, index, arr){ 
        return value != $('#${region}').val();
	})	
	}
	;`;
	i++;
  }
  
  
	 functionHTML +=`providers['regions']=regions.join(',');
	 providers['costume']=btoa($('#costume').val());
	 
	 configurationValue = Object.keys(providers).map(key => key + '=' + providers[key]).join('|');



	console.log(configurationValue);
	 const configuration = configurationValue && configurationValue.length ? '/' + configurationValue : '';
	 const location = window.location.host + configuration + '/manifest.json'
              navigator.clipboard.writeText('https://' + location);
              installLink.href = 'stremio://' + location;
	 }`
  
  
  scriptHTML += `
		  $('#costume').change(function() {
		  generateInstallLink()
		});
			  generateInstallLink();
          });`
  
  
  
	
	const stylizedTypes = manifest.types
      .map(t => t[0].toUpperCase() + t.slice(1) + (t !== 'series' ? 's' : ''));
	  
	  

  return `
   <!DOCTYPE html>
   <html style="background-image: url(${manifest.background});">

   <head>
      <meta charset="utf-8">
      <title>${manifest.name} - Stremio Addon</title>
      <link rel="shortcut icon" href="${manifest.logo}" type="image/x-icon">
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&display=swap" rel="stylesheet">
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" >
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.15/js/bootstrap-multiselect.min.js"></script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.15/css/bootstrap-multiselect.css" rel="stylesheet"/>
      <style>${STYLESHEET}</style>
   </head>

	<body>
      <div id="addon">
         <div class="logo">
            <img src="${manifest.logo}">
         </div>
         <h1 class="name">${manifest.name}</h1>
         <h2 class="version">${manifest.version || '0.0.0'}</h2>
         <h2 class="description">${manifest.description || ''}</h2>

         <div class="separator"></div>
        
		<h3 class="gives">This addon has more :</h3>
         <ul>
            ${stylizedTypes.map(t => `<li>${t}</li>`).join('')}
         </ul>
		 
		 <div class="separator"></div>
         
		 <label class="label" for="community">Community IPTVs:</label>
		 <br><h3 class="gives">For anyone that wants to contribute please <a href="mailto:${manifest.contactEmail}">email me</a> or check my  <a href="https://www.reddit.com/r/StremioAddons/comments/x4scnn/iptv_addon/">reddit post</a>.</h3>
		  ${regionsHTML}
		  <div class="separator"></div>
		 
		  <label class="label" for="costume">Costume M3U8 list:</label>
		 <br>
			<input type="url" id="costume">
		 <div class="separator"></div>
		 
		 
         <div class="separator"></div>

         <a id="installLink" class="install-link" href="#">
            <button name="Install">INSTALL</button>
         </a>
         <div class="contact">
           <p>Or paste into Stremio search bar after clicking install</p>
        </div>
        
        <div class="separator"></div>
		<h3 class="contact">
		    To contact add-on creator:
		    <a href="mailto:${manifest.contactEmail}">${manifest.contactEmail}</a>
		</h3>
		<div class="separator"></div>
      </div>
	  
	  
		  ${scriptHTML}
          
		  ${functionHTML}
		  
          
      </script>
	  
	</body>

	</html>`
}

module.exports = landingTemplate;