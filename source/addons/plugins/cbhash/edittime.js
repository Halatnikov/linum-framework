function GetPluginSettings()
{
	return {
		"name":			"CB Hash",
		"id":			"CBhash",
		"version":      "r70 1.0",
		"description":	"cornedbeefhash - Produces a hash using MD5, SHA-1 or SHA-256 algorithms. Supports hexadecimal and base-64 output format. HMAC implentation also available. (Thanks Lucid for the name)",
		"author":		"Kyatric@gmail.com - JavaScript implementation of the RSA Data Security, Inc. MD5 Message: Copyright (c) 1998 - 2009, Paul Johnston & Contributors - A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined in FIPS 180-1 - Version 2.2 Copyright Paul Johnston 2000 - 2009 & contributors - A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined in FIPS 180-2 * Version 2.2 Copyright Angel Marin, Paul Johnston & contributors 2000 - 2009. * Distributed under the BSD License * See http://pajhome.org.uk/crypt/md5 for details. * Also http://anmar.eu.org/projects/jssha2/",
		"help url":		"http://www.scirra.com",
		"category":		"Hash",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};
//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On hashed", "CBhash", "On any hash generated", "Triggered when a new hash is generated.", "OnHashed");


////////////////////////////////////////
// Actions

////
// General configuration

// Hexadecimal output configuration (while properties don't work)
AddComboParamOption("Lowercase");
AddComboParamOption("Uppercase");
AddComboParam("Format", "Choose the output format in the algorithm.");
AddAction(0, 0, "Set inner algorithm hexadecimal output format", "Algorithm configuration", "Set inner algorithm hexadecimal output format to <b>{0}</b>.", "Sets the inner algorithm hexadecimal output format. Might help for server-side compatibility.", "set_hexoutput");

// Base64 pad character configuration (while properties don't work)
AddComboParamOption(" ");
AddComboParamOption("=");
AddComboParam("Base64 pad character", "Base64 pad character. \"=\" for strict RFC compliance.");
AddAction(1, 0, "Set base64 pad character.", "Algorithm configuration", "Set base64 pad character to <b>{0}</b>", "Sets base64 pad character. \"=\" for strict RFC compliance.", "set_bpad");


////
// MD5 Actions

// MD5 Hash
AddStringParam("String", "String to encode", "\"String to encode\"");
AddComboParamOption("Hexadecimal");
AddComboParamOption("Base64");
AddComboParam("Format", "Choose the final output format of the encoded string.");
AddAction(2, 0, "MD5 - hash", "Hashing", "MD5 - Encode <i>{0}</i> as a MD5 hash. Output format: <b>{1}</b>.", "Encodes the data provided with MD5 algorithm.", "MD5_hash");
// MD5 Pass Generation
AddStringParam("String", "The string to encode.", "\"String to encode\"");
AddStringParam("Encoding", "The string you encode with.", "\"Encode with characters' string\"");
AddAction(3, 0, "MD5 - password generation", "Password generation", "MD5 - Encode {0} as a MD5 password using {1} characters only.", "Encode a string using a string of characters.", "MD5_pass");
// HMAC-MD5 Keyed Hash
AddStringParam("Key", "The encoding key", "\"Key\"");
AddStringParam("Data", "Data to encode with the key", "\"Data\"");
AddComboParamOption("Hexadecimal");
AddComboParamOption("Base64");
AddComboParam("Format", "Choose the output format of the encoded string.");
AddAction(4, 0, "HMAC-MD5 - keyed hashes", "Hashing", "HMAC-MD5 - Encode a keyed hash of <i>{1}</i> using <i>{0}</i> as a key. Output format : <b>{2}</b>.", "Encodes a data string using a string key in order to make a HMAC-MD5 (Hash-based Message Authentication Code) hash.", "HMAC_hash");
// HMAC-MD5 Pass Generation
AddStringParam("Key", "The encoding key", "\"Key\"");
AddStringParam("Data", "Data to encode with the key", "\"Data\"");
AddStringParam("String", "Character string used for the encode", "\"charString\"");
AddAction(5, 0, "HMAC-MD5 - password generation", "Password generation", "HMAC-MD5 - Generate a password out of <i>{1}</i> using <i>{0}</i> as a key and <i>{2}</i> as character string to encode.", "Generate an HMAC-MD5 (Hash-based Message Authentication Code) password using provided data, key and character string.", "HMAC_pass");
////

 ////
// SHA-1 Actions

// SHA-1 Hash
AddStringParam("String", "String to encode", "\"String to encode\"");
AddComboParamOption("Hexadecimal");
AddComboParamOption("Base64");
AddComboParam("Format", "Choose the final output format of the encoded string.");
AddAction(6, 0, "SHA-1 - hash", "Hashing", "SHA-1 - Encode <i>{0}</i> as a SHA-1 hash. Output format: <b>{1}</b>.", "Encodes the data provided with SHA-1 algorithm.", "SHA1_hash");
// SHA-1 Pass Generation
AddStringParam("String", "The string to encode.", "\"String to encode\"");
AddStringParam("Encoding", "The string you encode with.", "\"Encode with characters' string\"");
AddAction(7, 0, "SHA-1 - password generation", "Password generation", "SHA-1 - Encode {0} as a SHA-1 password using {1} characters only.", "Encode a string using a string of characters.", "SHA1_pass");
// HMAC-SHA-1 Keyed Hash
AddStringParam("Key", "The encoding key", "\"Key\"");
AddStringParam("Data", "Data to encode with the key", "\"Data\"");
AddComboParamOption("Hexadecimal");
AddComboParamOption("Base64");
AddComboParam("Format", "Choose the output format of the encoded string.");
AddAction(8, 0, "HMAC-SHA-1 - keyed hashes", "Hashing", "HMAC-SHA-1 - Encode a keyed hash of <i>{1}</i> using <i>{0}</i> as a key. Output format : <b>{2}</b>.", "Encodes a data string using a string key in order to make a HMAC-SHA-1 (Hash-based Message Authentication Code) hash.", "HMACSHA1_hash");
// HMAC-SHA-1 Pass Generation
AddStringParam("Key", "The encoding key", "\"Key\"");
AddStringParam("Data", "Data to encode with the key", "\"Data\"");
AddStringParam("String", "Character string used for the encode", "\"charString\"");
AddAction(9, 0, "HMAC-SHA-1 - password generation", "Password generation", "HMAC-SHA-1 - Generate a password out of <i>{1}</i> using <i>{0}</i> as a key and <i>{2}</i> as character string to encode.", "Generate an HMAC-SHA-1 (Hash-based Message Authentication Code) password using provided data, key and character string.", "HMACSHA1_pass");
////

 ////
// SHA-256 Actions

// SHA-256 Hash
AddStringParam("String", "String to encode", "\"String to encode\"");
AddComboParamOption("Hexadecimal");
AddComboParamOption("Base64");
AddComboParam("Format", "Choose the final output format of the encoded string.");
AddAction(10, 0, "SHA-256 - hash", "Hashing", "SHA-256 - Encode <i>{0}</i> as a SHA-256 hash. Output format: <b>{1}</b>.", "Encodes the data provided with SHA-256 algorithm.", "SHA256_hash");
// SHA-256 Pass Generation
AddStringParam("String", "The string to encode.", "\"String to encode\"");
AddStringParam("Encoding", "The string you encode with.", "\"Encode with characters' string\"");
AddAction(11, 0, "SHA-256 - password generation", "Password generation", "SHA-256 - Encode {0} as a SHA-256 password using {1} characters only.", "Encode a string using a string of characters.", "SHA256_pass");
// HMAC-SHA-256 Keyed Hash
AddStringParam("Key", "The encoding key", "\"Key\"");
AddStringParam("Data", "Data to encode with the key", "\"Data\"");
AddComboParamOption("Hexadecimal");
AddComboParamOption("Base64");
AddComboParam("Format", "Choose the output format of the encoded string.");
AddAction(12, 0, "HMAC-SHA-256 - keyed hashes", "Hashing", "HMAC-SHA-256 - Encode a keyed hash of <i>{1}</i> using <i>{0}</i> as a key. Output format : <b>{2}</b>.", "Encodes a data string using a string key in order to make a HMAC-SHA-256 (Hash-based Message Authentication Code) hash.", "HMACSHA256_hash");
// HMAC-SHA-256 Pass Generation
AddStringParam("Key", "The encoding key", "\"Key\"");
AddStringParam("Data", "Data to encode with the key", "\"Data\"");
AddStringParam("String", "Character string used for the encode", "\"charString\"");
AddAction(13, 0, "HMAC-SHA-256 - password generation", "Password generation", "HMAC-SHA-256 - Generate a password out of <i>{1}</i> using <i>{0}</i> as a key and <i>{2}</i> as character string to encode.", "Generate an HMAC-SHA-256 (Hash-based Message Authentication Code) password using provided data, key and character string.", "HMACSHA256_pass");
////


//////////////////////////////////////////////////////////////
// Expressions

////
// Global expressions
AddExpression(0, ef_return_string, "Get the last hash made.", "Hashed", "get_lastResult", "Returns the last hash made.");

 ////
// MD5 expressions 

// MD5 (Hexa - B64)
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(1, ef_return_string, "Hash MD5 (Hexa)", "Hashing", "MD5", "MD5(Hexa) - Encodes the data provided with MD5 algorithm.");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(2, ef_return_string, "Hash MD5 (base64)", "Hashing", "MD5B", "MD5(base64) - Encodes the data provided with MD5 algorithm.");
// MD5 Pass (data,charstring)
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddStringParam("\"charstring\"", "Characters to encode with", "\"\"");
AddExpression(3, ef_return_string, "MD5 password generation", "Password generation", "MD5pass", "Generate a password from data using only the characters from charstring.");
// HMAC-MD5 Hash (Hexa-B64)
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(4, ef_return_string, "HMAC-MD5 Hash (Hexa)", "Hashing", "HMACMD5", "(Hexa) Encodes a data string using a string key in order to make a HMAC-MD5 (Hash-based Message Authentication Code) hash.");
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(5, ef_return_string, "HMAC-MD5 Hash (base64)", "Hashing", "HMACMD5B", "(base64) Encodes a data string using a string key in order to make a HMAC-MD5 (Hash-based Message Authentication Code) hash.");
// HMAC-MD5 Pass
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddStringParam("\"charstring\"", "Characters to encode with", "\"\"");
AddExpression(6, ef_return_string, "HMAC-MD5 - password generation", "Password generation", "HMACMD5pass", "Generate an HMAC-MD5 (Hash-based Message Authentication Code) password using provided data, key and character string.");

 ////
// SHA-1 expressions 

// SHA-1 (Hexa - B64)
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(7, ef_return_string, "Hash SHA-1 (Hexa)", "Hashing", "SHA1", "SHA-1(Hexa) - Encodes the data provided with SHA-1 algorithm.");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(8, ef_return_string, "Hash SHA-1 (base64)", "Hashing", "SHA1B", "SHA-1(base64) - Encodes the data provided with SHA-1 algorithm.");
// SHA-1 Pass (data,charstring)
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddStringParam("\"charstring\"", "Characters to encode with", "\"\"");
AddExpression(9, ef_return_string, "SHA-1 password generation", "Password generation", "SHA1pass", "Generate a password from data using only the characters from charstring.");
// HMAC-SHA-1 Hash (Hexa-B64)
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(10, ef_return_string, "HMAC-SHA-1 Hash (Hexa)", "Hashing", "HMACSHA1", "(Hexa) Encodes a data string using a string key in order to make a HMAC-SHA-1 (Hash-based Message Authentication Code) hash.");
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(11, ef_return_string, "HMAC-SHA-1 Hash (base64)", "Hashing", "HMACSHA1B", "(base64) Encodes a data string using a string key in order to make a HMAC-SHA-1 (Hash-based Message Authentication Code) hash.");
// HMAC-SHA-1 Pass
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddStringParam("\"charstring\"", "Characters to encode with", "\"\"");
AddExpression(12, ef_return_string, "HMAC-SHA-1 - password generation", "Password generation", "HMACSHA1pass", "Generate an HMAC-SHA-1 (Hash-based Message Authentication Code) password using provided data, key and character string.");

 ////
// SHA-256 expressions 

// SHA-256 (Hexa - B64)
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(13, ef_return_string, "Hash SHA-256 (Hexa)", "Hashing", "SHA256", "SHA-256(Hexa) - Encodes the data provided with SHA-256 algorithm.");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(14, ef_return_string, "Hash SHA-256 (base64)", "Hashing", "SHA256B", "SHA-256(base64) - Encodes the data provided with SHA-256 algorithm.");
// SHA-256 Pass (data,charstring)
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddStringParam("\"charstring\"", "Characters to encode with", "\"\"");
AddExpression(15, ef_return_string, "SHA-256 password generation", "Password generation", "SHA256pass", "Generate a password from data using only the characters from charstring.");
// HMAC-SHA-256 Hash (Hexa-B64)
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(16, ef_return_string, "HMAC-SHA-256 Hash (Hexa)", "Hashing", "HMACSHA256", "(Hexa) Encodes a data string using a string key in order to make a HMAC-SHA-256 (Hash-based Message Authentication Code) hash.");
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddExpression(17, ef_return_string, "HMAC-SHA-256 Hash (base64)", "Hashing", "HMACSHA256B", "(base64) Encodes a data string using a string key in order to make a HMAC-SHA-256 (Hash-based Message Authentication Code) hash.");
// HMAC-SHA-256 Pass
AddStringParam("\"key\"", "Key to encode with", "\"\"");
AddStringParam("\"data\"", "Data to encode", "\"\"");
AddStringParam("\"charstring\"", "Characters to encode with", "\"\"");
AddExpression(18, ef_return_string, "HMAC-SHA-256 - password generation", "Password generation", "HMACSHA256pass", "Generate an HMAC-SHA-256 (Hash-based Message Authentication Code) password using provided data, key and character string.");


ACESDone();


// Property grid properties for this plugin
var property_list = [
//	new cr.Property(ept_combo,"Hexoutput", "Lowercase", "Inner algorithm hexadecimal output format. Might help for server-side compatibility.", "Lowercase|Uppercase"),
//	new cr.Property(ept_combo,"Base-64 pad character", " ", "Inner algorithm base-64 pad character. = for strict RFC compliance", " |=")
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
