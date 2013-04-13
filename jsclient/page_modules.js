/*
	Layout definitions of pages like Profile, Stream etc.
*/

// Derive following pages of this template:




// Extend close function to remove events!
Backbone.View.prototype.close = function(){


   /* if (this.onClose) {
        this.onClose();
    }
    this.remove();
    this.undelegateEvents();*/
}

/***
	Name:
	sendMessageForm

	Info:
	Generate a new message box with the specified receivers

	Params:
	receivers:JSON Object:Receiver list in format [{id: 'alice@myserver.com', name: 'Alice'},{id: "bob@myserver.com", name: "Bob"}]
	Location:
	apl/page_modules.js

	Code:JS:
	// Send a message to Alice
	sendMessage(Form(
		[
			{id: 'alice@myserver.com', name: 'Alice'}
		]);)
*/

function sendMessageForm(receivers)
{

	$.get("templates/box_messageForm.html", function (d)
	{
	
		var templateData = {receivers: receivers};

		_.templateSettings.variable = "rc";
		var template = _.template(d, templateData); 
		
	
		ui_showBox( template , function()
			{
		

				$("#inp_newmsg").focus();
		});


		//alert("http://"+charmeUser.server+"/charme/auto.php");
	$('#inp_receivers').tokenInput([
                {id: 7, name: "Ruby"},
                {id: 11, name: "Python"},
                {id: 13, name: "JavaScript"},
                {id: 17, name: "ActionScript"},
                {id: 19, name: "Scheme"},
                {id: 23, name: "Lisp"},
                {id: 29, name: "C#"},
                {id: 31, name: "Fortran"},
                {id: 37, name: "Visual Basic"},
                {id: 41, name: "C"},
                {id: 43, name: "C++"},
                {id: 47, name: "Java"}
            ], {
                prePopulate: receivers, tokenValue: "id"} );
	




	});
}

function sendAnswer()
{
	var aeskey = ($('#msg_aeskey').data("val"));
	var conversationId = ($('#msg_conversationId').data("val"));
	var message = $('#inp_newmsginstant').val();
	var encMessage = sjcl.encrypt(aeskey, message);
	var messagePreview = sjcl.encrypt(aeskey, message.substring(0,127));


	apl_request(
	    {"requests" : [
	    {"id" : "message_distribute_answer", "conversationId" : conversationId , "encMessage" : encMessage, "messagePreview" : messagePreview}

	    ]
		}, function(d2){
				
				
				
				$(".talkmessages").css("margin-bottom", ($(".instantanswer").height()+48)+"px");

				$.get("templates/control_messageview.html", function (d)
			{
				// RSA Decode, for each:
				// d2.messages_get_sub

				_.templateSettings.variable = "rc";
				var tmpl = _.template(d, {messages: [{msg: message, sender: charmeUser.userId}]}); 

				$(".talkmessages").append(tmpl);

				$('#moremsg2').remove();
			 
				$("html, body").animate({ scrollTop: $(document).height() }, "slow");

				

				});
			
		});

}

/***
	Name:
	sendMessage

	Info:
	Submit the form generated with `sendMessageForm()`. Warning: Should only be called after a message form
	has been generated with `sendMessageForm()`
	exists.

	The function itself uses a hybrid cryptosystem to encode the message.
	First a random AES key is generated with `randomAESKey()` and 
	the  message itself is encoded with this key.

	Then the AES Key is encoded with the public RSA key of each receiver.
	Then the encoded AES keys are send to the users server which distributes
	the messages.

	Location:
	page_modules.js

*/

function sendMessage()
{
	var all;
	var message ;




	 all = $('#inp_receivers').val().split(",");	
	var count = 0;
	 message = $('#inp_newmsg').val();

	// make random key for hybrid encryption
	// probably more secure, but how to use?: var randKey  = sjcl.random.randomWords(4, 0);

  	

	
	var receivers = new Array();

	jQuery.each(all, function() {
		var str = this;

		// Get public key for each receiver
	apl_request(
		    {"requests" : [
		    {"id" : "profile_pubKey", "profileId" : this}

		    ]
		}, function(d1){
			
			var pk = (jQuery.parseJSON(d1.profile_pubKey));
			count++;
			console.log(pk);
			// Encrypt random key  with public key

			var aesEnc = "";
 			var rsa = new RSAKey();

			var aeskey = randomAesKey(32);
			rsa.setPublic(pk.n,pk.e);
			// RSA encrypt aes key with pubKey:
			aesEnc = rsa.encrypt(aeskey);
		
			

 			receivers.push({charmeId: str, aesEnc: aesEnc});


 			// Send if last public key is here.
 			if (count == all.length) // Encrypted all random keys -> send to my server for distribution
 			{
 				var encMessage = sjcl.encrypt(aeskey, message);
 				var messagePreview = sjcl.encrypt(aeskey, message.substring(0,127));

	 				apl_request(
			    {"requests" : [
			    {"id" : "message_distribute", "receivers" : receivers, "encMessage" : encMessage, "messagePreview": messagePreview,  "sender": charmeUser.userId}

			    ]
				}, function(d2){
						
					
						ui_closeBox();
				});

 			}
		});
	});

}

/***
	Name:
	view_page

	Info:
	Default page class. Build new pages on this model. `postRender` is called after rendering is complete.


	Properties:
	options.template:string:Which template from templates folder do we us?
	options.needLogin:bool:Only for registred users? (Default: true)
	options.useSidebar:bool:Sidebar enabled? (Default: false)
	options.navMatch:string:Which element of main navigation should be highlighted? 

	Location:
	apl/crypto.js

	Code:JS:

	// Generate a page extending view_page
	var view_test= view_page.extend({

	events: 
	{
		'click #mybutton': 'myevent'
	},
	function myevent()
	{
		alert("!!!");
	},
	postRender: function()
	{
		$('#login_user').focus();
	}

	});
	
	// Open page
	var pa = new view_test({template: "welcome",  needLogin: false});

*/

view_page = Backbone.View.extend({   



	subPage: null,
	el : '#page',
	

	options: {
		template:'none',
		useSidebar:false,
		navMatch: '',
		needLogin: true
	},

	events: {
	
	//	"click  a" : "testClick"
	},
	
	

	initialize: function() {
	 

		 
	},


	// Warning: do not add initlize function, because passing arguments does not work then!

    getData: function()
    {

	},
	 setSub: function(s)
    {
   
    	// Close old subView first
    	if (this.sub != null)
    	{
    		//Problem: #page is removed
    	
    		this.sub.undelegateEvents();
    	}
    	this.sub = s;

	},
	testClick: function()
    {alert();
    	
	},

    finishRender: function(d, d2)
    {
		console.log("finishRender()");

//alert("find"+this.options.useSidebar);

    	if (this.options.navMatch != '')
    	{
    	
    		$(".sbAlpha ul li").removeClass("active");
    		$(".sbAlpha ul li a[data-topic='"+this.options.navMatch+"']").parent().addClass("active");
    	}

    	if (this.options.useSidebar)
		{
			

			$('.page_content').css("width", "700px");
			$('.page_content').css("margin-left", "150px");
			$('.sbBeta').show();


			$('.subCont').html($('div[title=submenu_items]').html());

			// Do this after sidebar items were initialised:
			$(".subCont").append('<div id="colorbg"></div>');
			// call init sidebar function

			// init action bar (TODO!)
			/*
			$('.sbBeta .actionBar').html(""); // Remove existing buttons
			$('.subCont').html($('div[title=submenu_items]').html());
			$('.sbBeta .actionBar').html($('div[title=action_bar]').html());*/


		}
		else
		{
			$('.page_content').css("width", "850px");
			$('.page_content').css("margin-left", "0");
			$('.sbBeta').hide();
		}	

			if (this.postRender != null)
			{
				this.postRender();
			}

		

    },

	render: function(){

		/*
			Warning: Do not render subViews here if not yet rendered!
			http://stackoverflow.com/questions/9604750/backbone-js-firing-event-from-a-view-inside-a-view
		*/  
		


		if (this.options.needLogin && charmeUser == null)
		{	
  		
			logout();
			return;
			
		}
		//alert("render");

		// Page has changed not changed. Only subpage.
	 	if (container_main.currentViewId == this.options.template)
        {
   
            // Just update SubView, we are allowed to render it here as parent view is already rendered
            this.sub.render();

        }
        else
        {
        	
        	if (this.options.optionbar!= null)
			{

				$(".sbBeta .actionBar").html(this.options.optionbar);
			}
			else
			$(".sbBeta .actionBar").html("");


	        container_main.currentViewId =  this.options.template;

			var that = this;


			$.get("templates/"+this.options.template+".html", function (d)
			{
			
				var templateData = that.getData();

				_.templateSettings.variable = "rc";
				var template = _.template(d, templateData); 
				
				$(that.$el).html(template);


				that.finishRender(d);

				if (that.sub != null)
				{
					if (!that.sub.asyncRenderMode)
					that.sub.render();
				}
				//else
				{
					
					that.delegateEvents();
				}
				//console.log("delegateEvents() in view");
				
		


			});
		}

	},

});

//view_subpage

view_test = Backbone.View.extend({ 

options: {useSidebar : true, la2: 15},
initialize: function() {
	//  this.options = _.extend(this.defaults, this.options);
	},
});




view_subpage = Backbone.View.extend({   
	el: '#page',
	options: {},

	initialize: function() {
	
	},

	render: function(){
		// Done in parent page!

		var that = this;

		


		$.get("templates/"+this.options.template+".html", function (d)
		{

				var templateData = {};

				if (that.getData != null)
				{
				
					templateData = that.getData();
			
					_.templateSettings.variable = "rc";
					
				}
				//console.log(templateData);

				var template = _.template(d, templateData); 

	

				console.log(that.$el);

				// Problem: Selector may be okay, but element may have changed -> choose $el.selector in stead of el??
				$(that.$el.selector).html(template);//that.$el.selector
			
			
				if (that.postRender != null)
				{ 
					that.postRender();
				}
				// important:!!


				// mouse down effect for 32x32 imge buttons
				$(".actionIcon").mousedown(function(){
					var x = $(this).data("bgpos");

					if (!$(this).hasClass("active"))
					$(this).css("background-position",x+"px -48px");
				}).mouseup(function(){
					
					if (!$(this).hasClass("active"))
					$(this).css("background-position", $(this).data("bgpos")+"px -0px");
					
				}).mouseleave(function(){
					
					if (!$(this).hasClass("active"))
					$(this).css("background-position", $(this).data("bgpos")+"px -0px");
					
				});
			
			
				that.delegateEvents();
				



		});
		// Set sb beta
		//alert(that.options.navMatch);

		$(".sbBeta ul li, .profileTabs ul li, .navMatch ul li").removeClass("active");
		$(that.options.navMatch).addClass("active");

		// call prototype.finishredner();


		// if this.getData != null render...
	}
});


function setSCHeight()
{
	$(".msgScrollContainer").css("height", ($(window).height()-82)+"px");
	$('.nano').nanoScroller();
}

$(window).resize(function() {
setSCHeight();
});




/*

	The List Page views

*/

var view_lists = view_page.extend({


	options: {template:'profile', optionbar: '<a style="background-position: -60px 0px;" data-bgpos="-60" id="addListButton" class="actionButton"></a>'},
	viewId : 'listView',


	getData: function()
	{
		var templateData = {globaldata : []};
		templateData["listitems"] = apl_postloader_getLists();
		console.log(templateData);
		return templateData;
	},
	postRender: function()
	{

		// Problem: if opening another list form sidebar event gets unregistred.
		$('#addListButton').click(function(){
			var n = prompt("Enter a Name", "New List");

			// TODO: apl request to get id...

		apl_request(
		    {"requests" : [
		    {"id" : "lists_add", "name" : n}

		    ]
		}, function(d1){
		
			apl_postloader_lists.items.push({ '_id': {'$id': d1.lists_add.id.$id} , name: n});

			// Add item to Sidebar
			$(".sbBeta .subCont").append('<li id="nav_'+d1.lists_add.id.$id+'"><a href="#lists/'+d1.lists_add.id.$id+'">'+n+'</a></li>');

			//

		});


	});
	}

});


var view_lists_subpage = view_subpage.extend({
	options: {template:'lists_'},
	events: {

		"click  #but_renameList" : "renameList",
		"click  #but_deleteList" : "deleteList",
	
	},
	postRender: function()
	{
		// Hide Edit/delete button when showing all lists
		if (this.options.listId == ""){
			$('#listOptions').hide();

	}
	},
	renameList: function()
	{
		var that = this;
		$.get("templates/box_editlist.html", function (d)
		{
			var template = _.template(d, {}); 

			ui_showBox( template , function()
			{	
					var oldName = $("#nav_"+that.options.listId).text();
					$("#inp_listNameEdit").val(oldName).focus().select();
					
					$('#but_editListOk').click(function()
					{  
						// Notify user server about the changed name
						apl_request(
					    {"requests" : [
					    {"id" : "lists_rename", "listId" : that.options.listId , "newName" : $("#inp_listNameEdit").val()}

					    ]}
						, function(){

						// Update sidebar item with new Text
						$("#nav_"+that.options.listId+" a").text($("#inp_listNameEdit").val());

						// Update Name
						apl_postloader_editList(that.options.listId, $("#inp_listNameEdit").val());

						// Close box dialog
						ui_closeBox();
						}
						);
						
					
						
					});
			});
		});
	},
	deleteList: function()
	{
		var that = this;
		$.get("templates/box_deletelist.html", function (d)
		{
			var template = _.template(d, {}); 

			ui_showBox( template , function()
			{
				$("#but_deleteList").select().focus();
					$('#but_deleteList').click(function()
					{  
						apl_request(
					    {"requests" : [
					    {"id" : "lists_delete", "listId" : that.options.listId}

					    ]}
						, function(d){
						ui_closeBox();
						$("#nav_"+that.options.listId).remove();
						$("#page").text("");

						// Delete from script cache:
						apl_postloader_deleteList(that.options.listId);

				
						});

					});
			});
		});

	},
	getData: function()
	{
		var templateData = {lists: apl_postloader_getLists() };
	    return templateData;
	},


});

/*
	The registration view

*/


var view_register = view_page.extend({
	options: {template:'signup'},
	events: {

		"click  #but_makecert" : "makecert",
		"click  #but_signupok" : "signup"
	},
	initialize: function()
	{
;
},


	postRender: function(){
		
		console.log("set talks height");
$("#box_errors div").hide();
$("#box_errors").hide();
	}
,
	signup: function()
	{

		var s = $("#form_signup").serializeObject();
	
		var serverurl = $('#inp_server').val();

		apl_request(
		    {"requests" : [
		    {"id" : "user_register", "data" : s}

		    ]
		}, function(d){
			var data = d.user_register;
		
        
		  	if (data.error != null)
		  	{	
		  		$("#box_errors").hide();
		  		$("#box_errors").show();
		  		$("#error"+data.error).show();
		  		// TODO: Scroll to bottom to make show errors are shown
		  		$(window).scrollTop(999999);
		  	}
		  	else if (data.success == 1)
		  	{

	



		  		 location.replace('#signup_success');

		  	}

		}, "", serverurl);

/*
		var u = 'http://'+$('#inp_server').val()+'/charme/req.php?action=newUser.register&'+s+'&callback=?';
		console.log("Loading JSON: "+u);
		$.ajax({
		  dataType: "jsonp",
		  url: u,
		  data: "",
		  success: function(data) {
		  
		  }
		});*/



		



	

	},
	makecert: function()
	{




  var worker = new Worker("lib/crypto/thread_makeSignature.js");
  $("#but_makecert").text("Please Wait...");


//alert(rsa.n.toString(16));


worker.onmessage = function(e) {
    
	console.log(e.data);


	// 

	//alert(e.data.n.toString());

	//n, e, d, p, q, dmp1, dmq1, coeff
	var certificate={version:1,rsa:{
		n: e.data.n.toString(), 
		e: e.data.e.toString(), 
		d: e.data.d.toString(), 
		p: e.data.p.toString(), 
		q: e.data.q.toString(), 
		dmp1: e.data.dmp1.toString(), 
		dmq1: e.data.dmq1.toString(), 
		coeff: e.data.coeff.toString(), 


	}};
	console.log("certificate is");
	console.log( JSON.stringify(certificate));


 	$('#template_certok').show();
	$('#template_certhint').hide();


    var passphrase = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        passphrase += possible.charAt(Math.floor(Math.random() * possible.length));





    // Encrypt certificate with passpharse
	var tt  = sjcl.encrypt(passphrase, JSON.stringify(certificate));

	var pub = {"n": e.data.n, "e" : e.data.e};

  	$("#pubkey").val(JSON.stringify(pub));





    $("#template_certkey").text(passphrase);
   $("#rsa").val(tt);






};


   worker.postMessage("");





		/*  */


	}

});


/*

	The Profile Page views

*/


var view_profilepage = view_page.extend({


	options: {template:'profile'},
	viewId : 'profileView', // important f

	
	 events: {
	    'click #but_sendMsg': 'sendMsg'
	   
	  },
	postRender: function()
	{
		// ,  name: container_main.currentView.username
		var that = this

		 if (typeof this.username === 'undefined')
		{
			
			;

			apl_request(
		    {"requests" : [
		    {"id" : "profile_get_name", "userId" : container_main.currentView.options.userId},
		    ]
			}, function(d){

				container_main.currentView.username = d.profile_get_name.info.firstname+ " " + d.profile_get_name.info.lastname;
				
				$(".profile_name").text(container_main.currentView.username);


			});

		}

		
	},
  	sendMsg: function()
  	{
		sendMessageForm( [
                    {id: this.options.userId}
                   
                ]);//
  	},
	getData: function()
	{

		  return {uid: this.options.userIdRaw,  server: this.options.userId.split("@")[1]};

	}

});

// Post field, user can post from here
 control_postField = Backbone.View.extend({   
 	 events: {
	    'click #mypostbutton': 'doPost'
	   
	  },
	  doPost : function()
	  {

	  	var txt = $("#textfield").val();
	 	var collectionId = (this.options.collectionId == "");
	 	var that = this;
	 	if (this.options.collectionId == "") // If collection Seletor enabled, get value from collection selector
	 		collectionId = $("#postOptions select").val(); 

	 	var repostdata;

	 	if ( $('#repostContainer').is(':visible') )
	  		 repostdata = $('#repostContainer').data("postdata");


	  		

	  	apl_request(
	    {"requests" : [
	    {"id" : "collection_post", "content" : txt, "collectionId" : collectionId, "repost" :  repostdata},
	    { "id": "profile_get_name", userId: charmeUser.userId}
	    ]
		}, function(d){

	

			var name = d.profile_get_name.info.firstname+ " " + d.profile_get_name.info.lastname;

			var elid, layout;
			if (that.options.collectionId != "")
			{
				
				elid = ".collectionPostbox";
			}
			else
			{
				layout = "stream";
				elid = "#streamContainer";
			}

			// TODO: Add username
			var p2 = new control_postItem({repost: repostdata, postId: d.collection_post.id,username: name, layout: layout, userId: charmeUser.userId, content: txt, time: "the time", el: $(elid), prepend: true});
			p2.render();




		});

	  },
	render: function()
	{
		
		if (this.options.collectionId == "")
		{
			var that = this;
			// Get collections json....
			apl_request(
		    {"requests" : [
		    {"id" : "collection_getAll", "userId" : charmeUser.userId},
		    ]
			}, function(d){
				
				var items = "";

				jQuery.each(d.collection_getAll, function() {
					items += "<option value='"+this._id.$id+"'>"+xssText(this.name)+"</option>";
					

				});
				$('#postOptions').html(" in <select style='width:100px;' id='collectionSelector'>"+items+"</select>");
			

			});

			
		}
		
		this.$el.append("<textarea class='box' id='textfield' style=' width:100%;'></textarea><div style='margin-top:8px;'><a type='button' id='mypostbutton' class='button but_postCol' value='Post'>Post</a><span id='postOptions'></span></div>");


	},
	render2: function()
	{
		
	}

});


var uniIdCounter = 1; // Belongs to control_postItem below:
var repostTemp = null;

 control_postItem = Backbone.View.extend({ 
 	options : {prepend: false},
 	

 
 	render: function() 
 	{

 		// Needed for generating unique element identifiers.
 		var uniId = uniIdCounter;
 		uniIdCounter++;


 		var repoststr = "";
 		var liksstr = "<div class='likes'><span class='counter'>917</span><img src='http://server.local/charme/fs.php?u=schuldi%40server.local&s=24'></div>";

 		if (this.options.repost != null)
 			repoststr = " reposts <a href='#user/"+encodeURIComponent(this.options.repost.userId)+"'>"+this.options.repost.username+"'s post</a> <div class='repost'>"+this.options.repost.content+"</div>";
 	


 		var str ;
 		if (this.options.layout == "stream")
 		{

 			var postUser = new apl_user(this.options.userId);

 			// 
 		 str = "<div class='collectionPost'>"+
 		 "<a href='#user/"+postUser.userIdURL+"'><img class='profilePic' src='"+postUser.getImageURL(64)+"'></a>"
 		 +"<div class='subDiv'>"+liksstr+"<a href='#user/"+postUser.userIdURL+"'>"+xssText(this.options.username)+"</a>"+repoststr+"<div class='cont'>"+xssText(this.options.content)+"</div><div><a id='doLove"+uniIdCounter+"'>Love</a> - <a id='doRepost"+uniIdCounter+"'>Repost</a> - <a id='doCommentAction"+uniIdCounter+"'>Comment</a><span class='time'>"+this.options.time+"</span></div></div></div>";
		}
		else
 		 str = "<div class='collectionPost'>"+repoststr+"<div class='cont'>"+xssText(this.options.content)+"</div><div><a id='doLove"+uniIdCounter+"'>Love</a> - <a id='doRepost"+uniIdCounter+"'>Repost</a> - <a id='doCommentAction"+uniIdCounter+"'>Comment</a><span class='time'>"+this.options.time+"</span></div></div>";

 		if (this.options.prepend)
 			this.$el.prepend(str);
 		else
 			this.$el.append(str);

 		var that = this;
 		// Bind events:
 		$("#doCommentAction"+uniIdCounter).click(function()
 			{
 				alert("..."+uniIdCounter);
 			});

 		$("#doRepost"+uniIdCounter).click(function()
 			{

 				repostTemp = {userId: that.options.userId, postId: that.options.postId, content: that.options.content, username: that.options.username };
 				app_router.navigate("stream", {trigger: true} );
 		
 				
 				appendRepost();


 			});

 		$("#doLove"+uniIdCounter).click(function()
 			{
 				alert("like"+uniIdCounter);
 			});

 	}

 });


 control_collectionItem = Backbone.View.extend({   

	render: function()
	{

		this.$el.append("<a class='collection' href='#user/"+encodeURIComponent(container_main.currentView.options.userId)+"/collections/"+this.options.data._id.$id+"'>"+this.options.data.name+"</a>");
	}

});
 
view_profilepage_collection_show = view_subpage.extend({


	options: {template:'user_collections_show', navMatch: '#nav_profile_collections'},
	el: '#page3',




	postRender: function()
	{
	
		// Set header name
		$(".profile_name").text(container_main.currentView.username);


		// Add post field, if userId = charmeUser.userID
		if (container_main.currentView.options.userId == charmeUser.userId)
		{
			var t = new  control_postField({el: $("#postFieldContainer"), collectionId: this.options.collectionId });
			t.render();
		}

		apl_request(
	    {"requests" : [

	    // Get posts of collection
	    {"id" : "collection_posts_get", "userId" : container_main.currentView.options.userId, collectionId: this.options.collectionId },

	    // Get name of collection
	    {"id" : "collection_getname", collectionId: this.options.collectionId },

	    // Does the user follow the collection?
 		{"id" : "register_isfollow", collectionId: this.options.collectionId, "collectionOwner" : container_main.currentView.options.userId,  "userId" : charmeUser.userId },
	    
	    ]
		}, function(d){

			if(d.register_isfollow.follows)
			{
				$('#but_followCollection').css("background-position", "-96px 0px");
				$('#but_followCollection').data("bgpos", "-96");
			}


			$("#colName").text(d.collection_getname.info.name);

		jQuery.each(d.collection_posts_get, function() {

		

			var p2 = new control_postItem({repost: this.repost, postId: this._id.$id, content: this.content,username: this.username,userId: this.owner, time: this.time, el: $(".collectionPostbox")});
			p2.render();



		});

	});


var that = this;

		$("#but_followCollection").click(function(){
			
			var action;
			if ($('#but_followCollection').data("bgpos") == -96)
			{
				action = "unfollow";
				$('#but_followCollection').css("background-position", "-48px 0px");
				$('#but_followCollection').data("bgpos", "-48");
				// Do unsubscribe...
			}
			else
			{
				action = "follow";
				$('#but_followCollection').css("background-position", "-96px 0px");
				$('#but_followCollection').data("bgpos", "-96");
				// Do subscribe...
			}

		

			apl_request(
		    {"requests" : [
		    {"id" : "collection_follow", "collectionOwner" : container_main.currentView.options.userId,  "userId" : charmeUser.userId, "action": action, collectionId: that.options.collectionId },
	  
		    ]
			}, function(d){
			
			});

		});

	},

	getData: function()
	{

		return {uid: charmeUser.userIdURL};
	}
});



var view_profilepage_collection = view_subpage.extend({

	el: '#page3',

	postRender : function()
	{
		// TODO : JSON HERE!

		$(".profile_name").text(container_main.currentView.username);


		apl_request(
	    {"requests" : [
	    {"id" : "collection_getAll", "userId" : container_main.currentView.options.userId},
	    ]
		}, function(d){
			
		jQuery.each(d.collection_getAll, function() {

			var search_view = new control_collectionItem({ el: $("#collection_list"), data: this });
			 search_view.render();

		});

		 // TODO: Add collection control...

		});



		 



		// load collections via json, and add as control to page
		$('#but_addNewCollection').click(function()
		{
			$.get("templates/box_collectionEdit.html", function (d)
			{
				_.templateSettings.variable = "rc";
				var template = _.template(d, {}); 
				
				ui_showBox( template , function()
				{
						$("#inp_box_name").focus();
						$('#but_box_save').click(function()
						{
							
							apl_request(
						    {"requests" : [
						    {"id" : "collection_add", "name" : $("#inp_box_name").val(), "description" : $("#inp_box_description").val()},
						    ]
							}, function(d){
								
							var search_view = new control_collectionItem({ el: $("#collection_list"), data: {_id : { $id: d.id}, description: $("#inp_box_description").val(), name:  $("#inp_box_name").val()} });
							 search_view.render();

							 ui_closeBox();
							 // TODO: Add collection control...

							});


						});
						
				});
			});
		});
	}

});


var view_profilepage_info = view_subpage.extend({

	el: '#page3',
	reqData: {},
	asyncRenderMode: true, 
	canRender: false,
	events: {
	//'click #select_lists a' : 'listUpdate', 
	

},
	listUpdate : function()
	{
	
		
		/*$(this).toggleClass("active");
		$.doTimeout( 'listsave', 1000, function( state ){


		var ar = $('#select_lists a.active').map(function(i,n) {
		return $(n).data("listid");
		}).get();

		var uid = $.urlParam("userId",location.href );
		console.log(ar);*/

		// do apl request...

		/*$.post("ui/actions/modList.php", {'ar[]': ar, userId: uid}, function(d) {
		alert(d); 
		});*/


		//}, true);
	},

	initialize: function()
	{

		var that = this;

		
		apl_request(
		    {"requests" : [

		    // TODO: Send this to profile owner's server, not user server!!!!
		    {"id" : "profile_get", "profileId" : container_main.currentView.options.userId},

		    // Send this to user server:
		    {"id" : "lists_getRegistred", "profileId" : container_main.currentView.options.userId}


		    ]
		}, function(d){
			
		 that.reqData = d;
         that.render();
        

		});



  		/*var url = 'http://server.local/charme/req.php?u='+(container_main.currentView.options.userIdRaw)+'&action=profile.get&callback=?';//encodeURI

  		var that = this;

         $.ajax({
          dataType: "jsonp",
          url: url,
          data: "",
          success: function(data) {
          	that.reqData = data;
          	that.render();

          }});*/


	},
	getData: function()
	{
		this.reqData.lists = apl_postloader_getLists();
		return this.reqData;
	},
	postRender: function()
	  {

	  	$(".profile_name").text(container_main.currentView.username);

		
	  	// Write username in header
	

	  	$("td:empty").parent().remove(); // Remove empty Info fields


		$('#select_lists a').click(function(){
			$(this).toggleClass("active");
			$.doTimeout( 'listsave', 1000, function( state ){

			// Get ids of selected lists. Form: ["5162c2b6d8cc9a4014000001", "5162c3c5d8cc9a4014000005"]
			var ar = $('#select_lists a.active').map(function(i,n) {
			return $(n).data("listid");
			}).get();

			// Send a request to the user server
			apl_request(
			    {"requests" : [
			    {"id" : "lists_update", "listIds" : ar, "userId": container_main.currentView.options.userId}

			    ]
			}, function(d){

				// OK...

			});

			// Notify profile owner server
			console.log(ar); 

			//alert("ok...");

		}, true);
/*
 $.post("ui/actions/modList.php", {'ar[]': ar, userId: uid}, function(d) {
        alert(d); 
    });*/





		});

	  }

});


/*

	The Settings Page views

*/

var view_settings_sub = view_subpage.extend({


 events: {
    'click #but_saveProfile': 'saveProfile',
    'click #but_saveImage': 'saveImage',
    'change #profileImgFileUp' : 'fileChanged'





  },
  initialize: function()
  {

  },
   saveImage: function()
   {
   
   	alert($('#profileImgFileUp').data("filecontent").result.length);
   		apl_request(
			    {"requests" : [
			    {"id" : "profile_imagechange", "data" : $('#profileImgFileUp').data("filecontent").result}

			    ]
			}, function(d){


			alert("IMAGE SAVED");
			 console.log(d);
	

        

		});



  		//console.log();

   },
   fileChanged: function(h)
   {
		
		var files = h.target.files; // FileList object
		//var output = [];
		// atid = $(x).attr('id'); // ID of attachment container



		var reader = new FileReader();
		reader.file = files[0]; //http://stackoverflow.com/questions/4404361/html5-file-api-get-file-object-within-filereader-callback

		reader.onload = function(e) {
		  //  $('#attachments'+atid).append("<div><a  class='delete' style='float:right' onclick='delAttachment(this)'> </a>"+ escape(this.file.name)+ "</div>");
			$('#profileImgFileUp').data("filecontent", this);

	    }
	    reader.readAsDataURL(reader.file) ;



   },
  saveProfile: function()
  {
		var s = $("#settingsform").serializeObject();

		var that = this;

			apl_request(
			    {"requests" : [
			    {"id" : "profile_save", "data" : s}

			    ]
			}, function(d){


			alert("OK");
			 console.log("FORM SAVED AND RETURNED:");
			 console.log(d);

        

		});



  },

	getData: function()
	{
		var templateData = {globaldata : []	};
	    return templateData;
	},
	

});



/*
	GUI Helper for reposts, can be called from #stream or #profile
	Reposts the post, specified in reposTemp.
*/
function appendRepost()
{
	/*
<div id='repostContainer' style='background-color: #efefef; display:none;'>
<a id='cancelRepost'>Cancel Repost</a>
<div id='repostUsername' style='padding-bottom:8px'></div>
<div id='repostContent'></div>
	*/
	if (repostTemp != null && $("#repostContainer").length > 0)
	{

		// repostTemp.username
		$('#repostContainer').show();

		// This data will be sent to server:
		$('#repostContainer').data("postdata", repostTemp);
		//  Also important: repostTemp.userId, repostTemp.postId
		$('#repostHeader span').text("You repost "+repostTemp.username+"'s post:");
		$('#repostContent').text(repostTemp.content);
		$('#textfield').focus();
			repostTemp = null;
	}
}



var view_stream_display = view_subpage.extend({
	 events: {
    'click #cancelRepost': 'cancelRepost'

  },
  cancelRepost: function()
  {
  	$('#repostContainer').hide();
  },

	postRender: function()
	{

	
var t = new  control_postField({el: $("#postFieldContainer"), collectionId: "" });
			t.render();


		


		apl_request({"requests" :
		[
			{"id" : "stream_get", list : this.options.streamId}
		]
		}, function(d2){ 

			// generate post controls...
			jQuery.each(d2.stream_get, function() {

				var p2 = new control_postItem({repost: this.post.repost, postId: this.post._id.$id, username: this.username, userId: this.post.owner, layout: "stream", content: this.post.content, time: this.post.time, el: $("#streamContainer"), prepend: true});
				p2.render();


			});

		});

		
		// this.options.streamId is list, 0 is no list.

		// JSON Nrequest to server....
	
		appendRepost();
	}

});

var view_welcome = view_page.extend({

    events: {
    'keyup #login_password': 'keypass'
    ,'keypress #login_user': 'keyuser'
  }
  ,keyuser: function(e) {
      code= (e.keyCode ? e.keyCode : e.which);
		    if (code == 13)
		    $('#login_password').focus().select();
  }
  ,keypass: function(e) {
      

		code= (e.keyCode ? e.keyCode : e.which);
		    if (code == 13)
		    login();
  },

	postRender: function(){
		$('#login_user').focus();

	}

});

var view_talks_subpage = view_subpage.extend({
	options: {template:'talks_', el: '#page3'},
	initialize: function()
	{
		this.messagePaginationIndex = 0;

		if (this.options.superId != "")
		this.loadMessages(0);
		
	},
	loadMessages: function(start)
	{

		console.log("messages_get_sub_START");
		apl_request({"requests" :
		[
			{"id" : "messages_get_sub", start: start, "superId":  this.options.superId}
		]
		}, function(d2){ 

			
			
			
			$.get("templates/control_messageview.html", function (d)
			{
				// RSA Decode, for each:
				// d2.messages_get_sub

				var rsa = new RSAKey();
				rsa.setPrivateEx(charmeUser.certificate.rsa.n, charmeUser.certificate.rsa.e, charmeUser.certificate.rsa.d,
				 charmeUser.certificate.rsa.p, charmeUser.certificate.rsa.q, charmeUser.certificate.rsa.dmp1, 
				 charmeUser.certificate.rsa.dmq1, charmeUser.certificate.rsa.coeff);
				

				//alert(d2.messages_get_sub.aesEnc);

				var aeskey = rsa.decrypt(d2.messages_get_sub.aesEnc);
				d2.messages_get_sub.aesEnc  = aeskey;

				jQuery.each(d2.messages_get_sub.messages, function() {
					
					try{
					this.msg = sjcl.decrypt(aeskey, this.encMessage);}
					catch(err)
					{
						this.msg =err;
					}
				});
				console.log("messages_get_sub:::");
				console.log(d2);
				// Decode AES Key with private RSA Key
				/*

				

				 var aeskey = rsa.decrypt(this.aesEnc);*///sjcl.decrypt(aeskey, this.encMessage);

				_.templateSettings.variable = "rc";
				var tmpl = _.template(d, d2.messages_get_sub); 

				$(".talkmessages").append(tmpl);
				 $(".talkmessages").css("margin-bottom", ($(".instantanswer").height()+48)+"px");
				$(window).scrollTop(999999);


 				$('#but_instantsend').click(function(){ sendAnswer(); });

				 $('#moremsg2').click(function(){
				$('#moremsg2').remove();
			 	that.loadMessages(++this.messagePaginationIndex);

			


			 });

			});

		});
	}
});


var view_talks = view_page.extend({

	events: {

		"click  #but_newMessage" : "newMsg"
	
	},
	initialize: function()
	{
		this.paginationIndex=0;
	},
	newMsg: function(ev)
	{
	    // Load homepage and append to [sharecontainer]
sendMessageForm({});
	},
	getData: function () {
		var templateData = {globaldata : [], test:"test"	};
		templateData["listitems"] = apl_postloader_getLists();
	    return templateData;

	},

	postRender: function(){
		
	
		this.loadMessages(0);
		$("#item_talks .count").remove();
		// Load some messages

	},
	loadMessages: function (start)
	{
		// load template

	var that = this;

		 apl_request({"requests" :
    [
      {"id" : "messages_get", start: start}
    ]
  }, function(d2){ 

  		 var rsa = new RSAKey();

		rsa.setPrivateEx(charmeUser.certificate.rsa.n, charmeUser.certificate.rsa.e, charmeUser.certificate.rsa.d,
		 charmeUser.certificate.rsa.p, charmeUser.certificate.rsa.q, charmeUser.certificate.rsa.dmp1, 
		 charmeUser.certificate.rsa.dmq1, charmeUser.certificate.rsa.coeff);


		$.get("templates/control_messagelist.html", function (d)
		{
			console.log("RSA PRV");
			console.log(charme_private_rsakey);

			jQuery.each(d2.messages_get, function() {
				
				// Decode AES Key with private RSA Key
				

				 var aeskey = rsa.decrypt(this.aesEnc);///sjcl.decrypt(aeskey, this.encMessage);
				 this.messageTitle = this.people;
				 this.messagePreview = sjcl.decrypt(aeskey,this.messagePreview);  //.join(", ");

			});
			console.log(d2.messages_get);


			var data = {messages: d2.messages_get};
		
			_.templateSettings.variable = "rc";
			var template = _.template(d, data); 

			$(".msgItems").append(template);

			 $('#moremsg').click(function(){
				$('#moremsg').remove();
			 	that.loadMessages(++this.paginationIndex);
			 });

			 $('.msgItems li a').click(function(){
			 	$('.msgItems li a').removeClass("active");
				$(this).addClass("active");
			
			 });

			 // Open first conversation, if no conversation open yet.
			if ( that.sub.options.superId == "")
			{
				that.sub.options.superId = ($('.msgItems li a:first').data("messageid"));
				that.sub.loadMessages(0);


			}

		
			$(".msgItems li a:first").addClass("active");
			 setSCHeight();
		

		});

	});
		// Decrpyt, TODO: in background Thread!

		// append....

		// load first message
	}


});



var view_stream = view_page.extend({

	userId : '',
	options: {},
	getData: function () {
		var templateData = {globaldata : [], test:"test"	};
		//templateData["streamitems"] = apl_postloader_getAll();

		

		templateData["listitems"] = apl_postloader_getLists();
  	
	
	    return templateData;

	},

	events: {

		"click  .shareIt" : "shareClick"
	},
	shareClick: function(ev)
	{
	    // Load homepage and append to [sharecontainer]
console.log("share");
	},
	postRender: function()
	{
		$("#item_stream .count").remove();

		

	}

	

});