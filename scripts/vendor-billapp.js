function alertJSON( data, alert_to ){
	var r_obj = $.parseJSON( data ); 
	var msg = r_obj.message+ " - Track Number: "+ r_obj.trackingNumber +" - "+ r_obj.developerMessage;
	console.log( msg ); 
	$( "#"+alert_to ).text( "" );
	$( "#"+alert_to ).text( "Server JSON Response: "+ r_obj.message + "  | Track Number: "+ r_obj.trackingNumber );
	$( "#"+alert_to ).show();
}
function handleTextResponse( data, alert_to ){
	$( "#"+alert_to ).text( "" );
	$( "#"+alert_to ).text( "Server Text Response: "+ data.split(";")[1] );
	console.log( data );
	$( "#"+alert_to ).show();
}
function buildJson(){
	var bill = {};
	var shipper = {};
	var consignee = {};
	var shipment = {};
	var input = {};
	fillUp( shipper, "shipper" );
	shipper[ "account" ] = $( "#account" ).val();
	shipper[ "reference" ] = $( "#reference" ).val();
	fillUp( consignee, "consignee" );
	shipment[ "contents" ] = $( "#contents" ).val();/*$( "input[name=contents]:checked" ).val(); */
	shipment[ "description" ] = $( "#description" ).val();
	shipment[ "pieces" ] = $( "#pieces" ).val();
	shipment[ "packaging" ] = $( "#packaging" ).val();
	shipment[ "weight" ] = $( "#weight" ).val();
	shipment[ "weight_qualifier" ] = $( "#weight_qualifier" ).val();
	shipment[ "value" ] = $( "#value" ).val();
	shipment[ "service" ] = $( "#service" ).val();
	shipment[ "bill_to" ] = $( "#bill_to" ).val();
	shipment[ "platinum_service" ] = $( "#platinum_service" ).val();
	shipment[ "insurance_amount" ] = $( "#insurance_amount" ).val();
	shipment[ "dimensions" ] = $( "#dimensions" ).val();
	shipment[ "dimensions_qualifier" ] = $( "#dimensions_qualifier" ).val();
	shipment[ "tracking" ] = $( "#tracking" ).val();

	bill[ "shipper" ] = shipper;
	bill[ "consignee" ] = consignee;
	bill[ "shipment" ] = shipment;
	input[ "bill" ] = bill;
	return JSON.stringify( bill );
}
function fillUp( item, name ){
	item[ "name" ] = $( "#"+name+"_name" ).val();
	item[ "company_name" ] = $( "#"+name+"_company_name" ).val();
	item[ "phone" ] = $( "#"+name+"_phone" ).val();
	item[ "address" ] = $( "#"+name+"_address" ).val();
	item[ "city" ] = $( "#"+name+"_city" ).val();
	item[ "state" ] = $( "#"+name+"_state" ).val();
	item[ "zip" ] = $( "#"+name+"_zip" ).val();
	item[ "country" ] = $( "#"+name+"_country" ).val();			
}
function toJson( form ){	
	//toJson("#testBill" )
	var array = $(form).serializeArray();
	var json_obj = {};

	$.each( array, function(){
		json_obj[this.name] = this.value || '';        
	});
	return JSON.stringify( json_obj );
}
function showModalMessage( alert, main_title, msg,  text_mode ){ // text_mode=true ){
	if( text_mode == null ){
		text_mode = true;
	}
	if( alert ){
		$("#modalMsgContentDiv").removeClass( "alert-success" ).addClass( "alert-danger" );
		$("#modalMsgCloseBtn").removeClass( "btn-success" ).addClass( "btn-danger" );
		
	}else{
		$("#modalMsgContentDiv").removeClass( "alert-danger" ).addClass( "alert-success" );
		$("#modalMsgCloseBtn").removeClass( "btn-danger" ).addClass( "btn-success" );
	}
	$("#modalMsgLabel").html( main_title );

     $("#modalMsgContent").empty();
     if( text_mode ){
     	$("#modalMsgContent").html( msg );
     }else{
          var msg_obj = toJsonObject( msg );
          $("#modalMsgInnerLabel").html( msg_obj[ 'message' ] );
          $("#modalMsgLabel").append( " ("+msg_obj[ 'code' ]+ ")" );
          var devMsg = $("<p></p>").html( msg_obj['developerMessage'].replace( /\n/g, "<br />") );
          $("#modalMsgContent").append( "<hr />", devMsg );
     }
	$('#modalMsg').modal('show');
}

$(function (){
	//POST form submit
	var rtype = "json"; //text or json
	$( "#fsubmit" ).click( function(){
		//alert($( "input[name=contents]:checked" ).val());	
		var btn = $(this);
		if( $( "#bill_form" ).valid() ){
			$.post( "production",  { 'billdata':buildJson() }, function( data ) {
				rtype === "text" ? handleTextResponse( data, "test_response" ) :
					alertJSON( JSON.stringify( data ), "test_response" );
			},rtype )
			.fail( function( data ) {
				rtype === "text" ? handleTextResponse( data.responseText, "test_response" ) :
                         showModalMessage(true, "Failure Message - Issue storing your information", data.responseText, false);
			});
			return false;
		}
	});
	$( "#fclear" ).click( function(){
		$("#test_response").text("");
		$(this).closest('form').find("input[type=text], input[type=number], textarea").val("");
		$('select').each(function (i, v) {
			$(this).prop("selectedIndex", 0);
		});
		
	});

     //Validation...
	jQuery.extend(jQuery.validator.messages, { required: "  -Required.",  number: " -Numeric.", digits: " -Digits." });
	$.validator.addMethod("document_value", function( value, element, param ) {
		var val_a = $("#value").val();
		if( !val_a ){ 	val_a = 0; }
		val_a = Globalize.parseFloat( Globalize.format( val_a, "c" ) );
		return $("#contents").val() === 'APX' ? ( val_a >= 1 ) : ( val_a <= 1 );
	}," -DOC 1 or 0, APX >= 1" );
	$('#bill_form').validate({
		rules: {  
		account: { required: true, maxlength: 4 }, shipper_name: { required: true, maxlength: 35 }, shipper_phone:{ required: true, rangelength: [10, 25] },
		shipper_address:{required: true, maxlength: 70 }, shipper_city:{ required: true, maxlength: 35 },
		shipper_country:{required: true, maxlength: 2 }, shipper_company_name:{ required: false, maxlength: 35 }, 
		shipper_state:{ required: false, rangelength: [2, 20] },shipper_zip:{ required: false, maxlength: 20}, 
		consignee_name: { required: true, maxlength: 35 }, consignee_phone:{ required: true, rangelength: [10, 25] },
		consignee_address:{required: true, maxlength: 70 }, consignee_city:{ required: true, maxlength: 35 },
		consignee_country:{required: true, maxlength: 2 }, consignee_company_name:{ required: false, maxlength: 35 }, 
		consignee_state:{ required: false, rangelength: [2, 20] },consignee_zip:{ required: false, maxlength: 20 },
		description:{ required: true, maxlength: 20 }, weight:{ required: true, number: true }, pieces: {required: true, number: true},
		value:{ required: function(e) { return $("#contents").val() === 'APX'; }, number: true, document_value: true }, insurance: { required: true, max: 2500, number: true }
		}, messages: { account:" -4 digits" , shipper_state: " -2-20 Max.", shipper_zip: " -2-20 Max."}, 
		errorElement: "span",
		errorClass: 'help-block',
		highlight: function(element) { $(element).closest('div').addClass('has-error');  $(element).prev('label').addClass('help-block');},  
		unhighlight: function(element) { $(element).closest('div').removeClass('has-error'); $(element).prev('label').removeClass('help-block'); },
		errorPlacement: function(error, element) { 
			error.appendTo( element.prev('label') );
		}
	});

});

//Utilities
function toJsonObject( json_input ){
	return JSON && JSON.parse( json_input ) || $.parseJSON( json_input );
}
