// app/index.tsx
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  // The SignedIn/SignedOut logic in app/_layout.tsx will handle redirection.
  // This screen will only show very briefly, if at all.
  // You can show a loading indicator.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
  // OR, if you want an explicit redirect as a fallback (though _layout should handle it):
  // return <Redirect href="/(auth)/welcome" />;
}





  // Authorized Redirect UI
// https://social-stud-90.clerk.accounts.dev/v1/oauth_callback

/*
Configuration: Build Credentials oDpQfroDEh (Default)
Keystore
Type                JKS
Key Alias           2af82073d74904fbf0e419bea3c8bc9a
MD5 Fingerprint     F9:4F:74:40:37:B6:81:90:0D:FF:D8:0E:FB:D9:B7:5C
SHA1 Fingerprint    
SHA256 Fingerprint  E0:69:BF:EA:34:56:4C:58:87:5F:06:DE:CB:75:E7:8C:82:B6:65:6E:5B:91:21:26:22:7C:7F:FE:C1:6D:77:89
Updated             7 seconds ago

Sensitive Keystore information:
    Keystore password: 7885839888c4898166e6a71888bca980
    Key alias:         2af82073d74904fbf0e419bea3c8bc9a
    Key password:      d3ad43153425b7e0d5da8144fd5071cf

    Path to Keystore:  @abdulodnt__liftme.jks
*/


//************************************************ */

//************************************************ */

/*

THIS IS FOR CREATING
FOR CHECKING CURRENT SHA-1 LOOK AT CODE BELOW : - keytool -list -v -keystore my-release-key.jks -alias my-key-alias

PS C:\Users\nasee\OneDrive\Documents\Docs\Project\liftme> keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
Enter keystore password:  

Re-enter new password: odungat

What is your first and last name?
  [Unknown]:  naseef
What is the name of your organizational unit?
  [Unknown]:  liftme
What is the name of your organization?
  [Unknown]:  liftmeapp
What is the name of your City or Locality?
  [Unknown]:  calicut
What is the name of your State or Province?
  [Unknown]:  kerala
What is the two-letter country code for this unit?
  [Unknown]:  IN
Is CN=naseef, OU=liftme, O=liftmeapp, L=calicut, ST=kerala, C=IN correct?
  [no]:  yes

Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) with a validity of 10,000 days
        for: CN=naseef, OU=liftme, O=liftmeapp, L=calicut, ST=kerala, C=IN
[Storing my-release-key.jks]


//************************************************ //

PS C:\Users\nasee\OneDrive\Documents\Docs\Project\liftme> keytool -keystore "C:\Users\nasee\OneDrive\Documents\Docs\Project\liftme\my-release-key.jks" -list -v
Enter keystore password:  

Keystore type: PKCS12
Keystore provider: SUN

Your keystore contains 1 entry

Alias name: my-key-alias
Creation date: Jul 10, 2025
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=naseef, OU=liftme, O=liftmeapp, L=calicut, ST=kerala, C=IN
Issuer: CN=naseef, OU=liftme, O=liftmeapp, L=calicut, ST=kerala, C=IN
Serial number: b626afa41578afd3
Valid from: Thu Jul 10 20:09:20 IST 2025 until: Mon Nov 25 20:09:20 IST 2052
Certificate fingerprints:
         SHA1: 63:33:3F:24:CE:2E:39:42:5C:78:F7:84:DA:2A:4F:5F:FC:47:D7:2F
         SHA256: E3:04:90:87:8D:DD:00:1E:F8:A8:91:88:E8:73:52:0A:F5:D2:44:40:F8:69:0A:A2:0C:5A:93:F3:6D:29:86:75   
Signature algorithm name: SHA256withRSA
Subject Public Key Algorithm: 2048-bit RSA key
Version: 3

Extensions:

#1: ObjectId: 2.5.29.14 Criticality=false
SubjectKeyIdentifier [
KeyIdentifier [
0000: 6A 3C C2 5D 92 66 A0 CB   9C 26 78 21 0F 20 6F 3D  j<.].f...&x!. o=
0010: C2 82 84 23                                        ...#
]
]



*******************************************
*******************************************


PS C:\Users\nasee\OneDrive\Documents\Docs\Project\liftme> 

*/