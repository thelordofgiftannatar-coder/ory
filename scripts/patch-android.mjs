import fs from 'node:fs';
const manifest='android/app/src/main/AndroidManifest.xml';
let xml=fs.readFileSync(manifest,'utf8');
xml=xml.replace('android:label="@string/app_name"', 'android:label="Skeletor Video"');
const filters=`\n            <intent-filter>\n                <action android:name="android.intent.action.VIEW" />\n                <category android:name="android.intent.category.DEFAULT" />\n                <category android:name="android.intent.category.BROWSABLE" />\n                <data android:scheme="content" android:mimeType="video/*" />\n                <data android:scheme="file" android:mimeType="video/*" />\n            </intent-filter>\n            <intent-filter>\n                <action android:name="android.intent.action.VIEW" />\n                <category android:name="android.intent.category.DEFAULT" />\n                <category android:name="android.intent.category.BROWSABLE" />\n                <data android:scheme="content" android:mimeType="audio/*" />\n                <data android:scheme="file" android:mimeType="audio/*" />\n            </intent-filter>`;
if(!xml.includes('android:mimeType="video/*"')) xml=xml.replace('</activity>',filters+'\n        </activity>');
fs.writeFileSync(manifest,xml);
// Register a tiny native bridge so Android VIEW intents can hand the selected content URI to the web player.
const javaDir='android/app/src/main/java/com/skeletor/video';
fs.mkdirSync(javaDir,{recursive:true});
fs.writeFileSync(`${javaDir}/OpenMediaPlugin.java`, `package com.skeletor.video;\nimport android.net.Uri;\nimport android.database.Cursor;\nimport android.provider.OpenableColumns;\nimport java.io.*;\nimport com.getcapacitor.*;\nimport com.getcapacitor.annotation.*;\n@CapacitorPlugin(name="OpenMedia")\npublic class OpenMediaPlugin extends Plugin {\n @PluginMethod public void getPendingMedia(PluginCall call) {\n  try { Uri uri=getActivity().getIntent().getData(); if(uri==null){call.resolve();return;}\n   String name="Opened media"; Cursor c=getContext().getContentResolver().query(uri,null,null,null,null); if(c!=null){try{if(c.moveToFirst()){int i=c.getColumnIndex(OpenableColumns.DISPLAY_NAME);if(i>=0)name=c.getString(i);}}finally{c.close();}}\n   String mime=getContext().getContentResolver().getType(uri); if(mime==null)mime="application/octet-stream";\n   File out=new File(getContext().getCacheDir(),"opened-"+System.currentTimeMillis()+"-"+name.replaceAll("[^A-Za-z0-9._-]","_"));\n   try(InputStream in=getContext().getContentResolver().openInputStream(uri);OutputStream os=new FileOutputStream(out)){if(in==null)throw new IOException("Cannot open media");byte[] buf=new byte[65536];int n;while((n=in.read(buf))>0)os.write(buf,0,n);}\n   JSObject ret=new JSObject();ret.put("path",out.getAbsolutePath());ret.put("name",name);ret.put("mime",mime);call.resolve(ret);\n  }catch(Exception e){call.reject("Unable to open selected media",e);}\n }\n}\n`);
const javaMain=`${javaDir}/MainActivity.java`, ktMain=`${javaDir}/MainActivity.kt`;
if(fs.existsSync(javaMain)){
 let m=fs.readFileSync(javaMain,'utf8');
 if(!m.includes('OpenMediaPlugin')) m=m.replace('public class MainActivity extends BridgeActivity {','public class MainActivity extends BridgeActivity {\n    @Override public void onCreate(android.os.Bundle savedInstanceState) { super.onCreate(savedInstanceState); registerPlugin(OpenMediaPlugin.class); }');
 fs.writeFileSync(javaMain,m);
}else if(fs.existsSync(ktMain)){
 let m=fs.readFileSync(ktMain,'utf8');
 if(!m.includes('OpenMediaPlugin')) m=m.replace('class MainActivity : BridgeActivity() {','class MainActivity : BridgeActivity() {\n    override fun onCreate(savedInstanceState: android.os.Bundle?) { super.onCreate(savedInstanceState); registerPlugin(OpenMediaPlugin::class.java) }');
 fs.writeFileSync(ktMain,m);
}
// Apply the supplied Skeletor artwork to Android launcher icons.
for (const density of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi']) {
  const dir=`android/app/src/main/res/mipmap-${density}`;
  fs.mkdirSync(dir,{recursive:true});
  fs.copyFileSync('www/assets/icon-512.png',`${dir}/ic_launcher.png`);
  fs.copyFileSync('www/assets/icon-512.png',`${dir}/ic_launcher_round.png`);
}
